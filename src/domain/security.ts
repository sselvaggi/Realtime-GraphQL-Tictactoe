import { sign, decode } from 'jsonwebtoken';
import { UUID, EMOJI } from './game';
import * as errors from './errors';
export const generateToken = (emoji: EMOJI, gameId: UUID) => {
  return sign({ emoji, gameId }, process.env.SECRET_KEY);
};
export const parseToken = token => {
  try {
    const { emoji, gameId } = decode(token, process.env.SECRET_KEY);
    return { emoji, gameId };
  } catch (error) {
    throw new errors.InvalidToken();
  }
};
