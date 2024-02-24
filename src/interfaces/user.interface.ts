import { Request } from 'express';
import { ObjectId } from 'mongoose';
import { Auth } from './auth.interface';

export interface User extends Auth {
  _id: string | ObjectId;
  name: string;
  lastname: string;
  phone: string;
  address: string;
  token: string;
  confirmed: boolean;
}

export interface UserRequest extends Request {
  user?: User;
}
