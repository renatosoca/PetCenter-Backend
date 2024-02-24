import { sign, verify } from 'jsonwebtoken';
import { ObjectId } from 'mongoose';

export const generateJWT = (_id: ObjectId | string, email: string) => {
  const jwtKeySecret: string = process.env.JWT_SECRET || '';

  return sign({ _id, email }, jwtKeySecret, {
    expiresIn: '2h',
  });
};

export const verifyJWT = (jwt: string): { _id: string; email: string } => {
  const jwtKeySecret: string = process.env.JWT_SECRET || '';

  return verify(jwt, jwtKeySecret) as { _id: string; email: string };
};
