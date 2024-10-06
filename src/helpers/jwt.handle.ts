import { sign, verify } from 'jsonwebtoken';
import { User } from '../interfaces';

export const generateJWT = (user?: User) => {
  const jwtKeySecret: string = process.env.JWT_SECRET || '';

  return sign({ user }, jwtKeySecret, {
    expiresIn: '2h',
  });
};

export const verifyJWT = (jwt: string): { user: User } => {
  const jwtKeySecret: string = process.env.JWT_SECRET || '';

  return verify(jwt, jwtKeySecret) as { user: User };
};
