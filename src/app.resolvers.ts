import { Resolver, Mutation, Subscription, Args, Query } from '@nestjs/graphql';
import { Inject, Logger } from '@nestjs/common';
import { PubSubEngine } from 'graphql-subscriptions';
import * as errors from './domain/errors';
import { Game, PLAYER_TOKEN, HistoryStep, GamePlayer } from './domain/game';
import { parseToken, generateToken } from './domain/security';

const LIVE_EVENT_NAME = 'watch';

const games: Game[] = [];

class Response {
  constructor(
    public feedbackMessage: string = 'OK',
    public error: boolean = false,
    public token: PLAYER_TOKEN = null,
    public gameId: string = '',
    public snap: string[] = [],
    public history: HistoryStep[] = [],
  ) {}
}

@Resolver('Game')
export class GameResolvers {
  constructor(@Inject('PUB_SUB') private pubSub: PubSubEngine) {}

  @Mutation('createGame')
  async createGame(@Args('multiplayer') multiplayer, @Args('emoji') emoji) {
    const response = new Response();
    try {
      const game: Game = new Game(multiplayer);
      const gameId = game.id;
      const token = generateToken(emoji, gameId);
      game.player1 = new GamePlayer(token, emoji);
      games.push(game);
      response.gameId = gameId;
      response.snap = game.playground.toString().split(`\n`);
      response.token = token;
      const multiplayerMessage = game.multiplayer
        ? 'share it with your partner to join'
        : '';
      response.feedbackMessage = `Game created gameId: ${gameId} ${multiplayerMessage} and use your token to makeMoves`;
      this.pubSub.publish(LIVE_EVENT_NAME, { [LIVE_EVENT_NAME]: response });
    } catch (error) {
      Logger.error(error.stack);
      response.feedbackMessage = error.message;
      response.error = true;
    } finally {
      Logger.log(response);
      return response;
    }
  }

  @Mutation('joinToGame')
  async joinToGame(@Args('gameId') gameId, @Args('emoji') emoji) {
    const response = new Response();
    try {
      const game: Game = games.find(x => x.id === gameId);
      if (!game) throw new errors.GameNotFound(gameId);
      const token = generateToken(emoji, gameId);
      if (game.player2) throw new errors.CantJoinToStartedGame();
      game.player2 = new GamePlayer(token, emoji);

      response.token = token;
      response.snap = game.playground.toString().split(`\n`);
      response.feedbackMessage = `Welcome ${emoji} to game ${gameId}`;
      this.pubSub.publish(LIVE_EVENT_NAME, { [LIVE_EVENT_NAME]: response });
    } catch (error) {
      Logger.error(error.stack);
      response.error = true;
      response.feedbackMessage = error.message;
    } finally {
      Logger.log(response);
      return response;
    }
  }

  @Mutation('makeMove')
  async makeMove(@Args('token') token, @Args('slotTarget') slotTarget) {
    const response = new Response();
    try {
      const { gameId, emoji } = parseToken(token);
      const game = games.find(x => x.id === gameId);
      if (!game) throw new errors.GameNotFound(gameId);
      if (game.winner) throw new errors.CantMoveOnFinishedGame(game);
      response.snap = game.playground.toString().split(`\n`);
      game.makeMove(token, slotTarget, emoji);
      response.snap = game.playground.toString().split(`\n`);
      this.pubSub.publish(LIVE_EVENT_NAME, { [LIVE_EVENT_NAME]: response });
      if (!game.multiplayer)
        setTimeout(() => {
          game.moveAI();
          const r = new Response(`${game.player2.emoji} moved`, false);
          r.snap = game.playground.toString().split(`\n`);
          this.pubSub.publish(LIVE_EVENT_NAME, { [LIVE_EVENT_NAME]: r });
        }, 1000);
    } catch (error) {
      Logger.error(error.stack);
      response.error = true;
      response.feedbackMessage = error.message;
    } finally {
      Logger.log(response);
      return response;
    }
  }

  @Query('gameHistory')
  async gameHistory(@Args('gameId') gameId) {
    const response = new Response();
    try {
      const game = games.find(x => x.id === gameId);
      if (!game) throw new errors.GameNotFound(gameId);
      response.history = game.history;
      response.feedbackMessage = `The winner is ${game.winner}`;
    } catch (error) {
      response.error = true;
      Logger.log(response);
      response.feedbackMessage = error.message;
    } finally {
      return response;
    }
  }

  @Subscription(LIVE_EVENT_NAME)
  watch() {
    return this.pubSub.asyncIterator(LIVE_EVENT_NAME);
  }
}
