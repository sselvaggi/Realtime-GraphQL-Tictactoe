import { Playground } from './game';

export class MissingLoginToken extends Error {
  constructor() {
    super(`You have to activate cookies and login to create a game`);
  }
}

export class InvalidToken extends Error {
  constructor() {
    super(`Invalid token, please login again`);
  }
}

export class CantJoinToSinglePlayerGame extends Error {
  constructor(game) {
    super(`Can't join to game ${game.id} because it's not multiplayer`);
  }
}

export class CantChooseTheSameEmojiAsOtherPlayer extends Error {
  constructor(emoji) {
    super(`You can't use the same emoji ${emoji} as the other player`);
  }
}

export class CantJoinToStartedGame extends Error {
  constructor() {
    super(`You can't to this game bacause all participant's places were taken`);
  }
}

export class CantJoinToFinishedGame extends Error {
  constructor(game) {
    super(`You can't join because game ${game.id} is finished`);
  }
}

export class CantMoveOnFinishedGame extends Error {
  constructor(game) {
    super(`You can't move because game ${game.id} is finished`);
  }
}

export class GameNotFound extends Error {
  constructor(gameId) {
    super(`We can't find game for given gameId ${gameId}`);
  }
}

export class PlayerNotAllowToPlayInThisGame extends Error {
  constructor(gameId) {
    super(`You are not allowed to make moves in game ${gameId}`);
  }
}

export class InvalidMoveTarget extends Error {
  constructor(target) {
    super(`Target slot ${target} is not available`);
  }
}

export class InvalidEmoji extends Error {
  static notAllowedEmojis = ['SPACE', 'PIPE', 'LINE_BREAK', 'TAB'];
  constructor(emoji) {
    super(
      `Emoji must be only one character different to: ${InvalidEmoji.notAllowedEmojis.join(
        ', ',
      )}`,
    );
  }
}

export class AttemptToMoveOutOfTurn extends Error {
  constructor() {
    super(`It's the other player's turn to move`);
  }
}

export class InvalidSlotTargetValue extends Error {
  constructor(value) {
    super(
      `Invalid slot target ${value}. Only ${Playground.humanFriendlySlotTargets.join(
        ', ',
      )} are acceptable`,
    );
  }
}
