import _ from 'lodash';
import * as errors from './errors';
import { v4 as uuidv4 } from 'uuid';
const AI_TOKEN = 'AI_TOKEN';
const AI_EMOJI = '🤖';
const EMOJI_REGEX = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
export type UUID = string;
export type PLAYER_TOKEN = string;
export type EMOJI = string;
export class Game {
  readonly id: UUID;
  private _player1: GamePlayer = null;
  private _player2: GamePlayer = null;
  private _winner: EMOJI | null;
  private _moves: GameMove[] = [];
  private playground = [null, null, null, null, null, null, null, null, null];
  static humanFriendlySlotTargets = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  constructor(readonly multiplayer: boolean) {
    this.id = uuidv4();
    if (!multiplayer) {
      this._player2 = new GamePlayer(AI_TOKEN, AI_EMOJI);
    }
  }

  makeMove(token: PLAYER_TOKEN, slotTarget: number, emoji: EMOJI): Game {
    if (this.winner) throw new errors.CantMoveOnFinishedGame(this);

    if (this._player1.token !== token && this._player2.token !== token) {
      throw new errors.PlayerNotAllowToPlayInThisGame(this.id);
    }

    if (this.lastMove && this.lastMove.emoji === emoji) {
      throw new errors.AttemptToMoveOutOfTurn();
    }

    if (Game.humanFriendlySlotTargets.indexOf(slotTarget) === -1) {
      throw new errors.InvalidSlotTargetValue(slotTarget);
    }

    if (this.readSlot(slotTarget)) {
      throw new errors.InvalidMoveTarget(slotTarget);
    } else {
      this.playground[slotTarget - 1] = emoji;
    }

    const winner = this.checkWinner();
    if (winner !== null) this._winner = winner;

    this._moves = [
      ...this._moves,
      {
        slotTarget,
        emoji,
        snap: this.toString(),
      },
    ];
    return this;
  }

  moveAI() {
    const freeSlots = this.freeSlots;
    return this.makeMove(
      AI_TOKEN,
      freeSlots[Math.floor(Math.random() * freeSlots.length)],
      AI_EMOJI,
    );
  }

  get lastMove(): GameMove {
    return this._moves[this._moves.length - 1];
  }

  get history(): HistoryStep[] {
    return this._moves.map(x => {
      const { emoji, slotTarget } = x;
      return { emoji, slotTarget };
    });
  }

  get player1(): GamePlayer | null {
    return this._player1;
  }

  set player1(player: GamePlayer) {
    this._setPlayer(player, 1);
  }

  get player2(): GamePlayer {
    return this._player2;
  }

  set player2(player: GamePlayer) {
    if (!this.multiplayer) throw new errors.CantJoinToSinglePlayerGame(this);
    this._setPlayer(player, 2);
  }

  private _setPlayer(player, number: 1 | 2) {
    if (this.winner) throw new errors.CantJoinToFinishedGame(this);
    const theOtherPlayer = number === 1 ? this._player2 : this._player1;
    if (theOtherPlayer && theOtherPlayer.emoji === player.emoji)
      throw new errors.CantChooseTheSameEmojiAsOtherPlayer(player.emoji);
    this[`_player${number}`] = player;
  }

  public get winner() {
    return this._winner;
  }

  static validateEmoji(emoji: EMOJI) {
    if (emoji.length === 1) return true;
    if (emoji.match(EMOJI_REGEX) && emoji.length === 2) return true;
    throw new errors.InvalidEmoji(emoji);
  }

  readSlot(slotTarget) {
    return this.playground[slotTarget - 1];
  }

  checkWinner() {
    const a = this.playground;
    if (a[0] && a[0] === a[1] && a[1] === a[2]) return a[2];
    if (a[3] && a[3] === a[4] && a[4] === a[5]) return a[5];
    if (a[6] && a[6] === a[7] && a[7] === a[8]) return a[8];
    if (a[0] && a[0] === a[3] && a[3] === a[6]) return a[6];
    if (a[1] && a[1] === a[4] && a[4] === a[7]) return a[7];
    if (a[2] && a[2] === a[5] && a[5] === a[8]) return a[8];
    if (a[0] && a[0] === a[4] && a[4] === a[8]) return a[8];
    if (a[2] && a[2] === a[4] && a[4] === a[6]) return a[6];
    return null;
  }
  toString() {
    return this.playground
      .map((value, index) => {
        const humanFriendlyIndex = index + 1;
        const glue = humanFriendlyIndex % 3 === 0 ? `\n` : '|';
        const char =
          this.playground[index] === null
            ? humanFriendlyIndex
            : this.playground[index];
        return ` ${char} ${glue}`;
      })
      .join('');
  }
  get freeSlots() {
    const result = [];
    for (let i = 0; i < this.playground.length; i++) {
      if (this.playground[i] === null) {
        result.push(i + 1);
      }
    }
    return result;
  }
}

export interface GameMove {
  slotTarget: number;
  emoji: EMOJI;
  snap: string;
}

export interface HistoryStep {
  emoji: string;
  slotTarget: number;
}

export class GamePlayer {
  constructor(readonly token: PLAYER_TOKEN, readonly emoji: EMOJI) {
    Game.validateEmoji(emoji);
  }
}
