import { NextFunction, Response } from 'express';
import { verifyJWT } from '../helpers';
import { UserRequest } from '../interfaces';
import userModel from '../models/userModel';

export const checkSession = async (req: UserRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const { user } = verifyJWT(token);

      req.user = (await userModel.findById(user._id).select('-password -token -confirmed -createdAt -updatedAt')) ?? undefined;

      return next();
    } catch (error) {
      return res.status(401).json({ msg: 'Sin autorización' });
    }
  }

  if (!token) return res.status(401).json({ msg: 'JWToken no válido o inexistente' });

  return next();
};
