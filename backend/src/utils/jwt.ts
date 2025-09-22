import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  sub: string;
  role: string;
}

export const signJwt = (
  payload: JwtPayload,
  expiresIn: SignOptions['expiresIn'] = '1d'
): string => {
  const options: SignOptions = expiresIn ? { expiresIn } : {};
  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyJwt = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};
