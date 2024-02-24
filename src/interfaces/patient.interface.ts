import { User } from './user.interface';

export interface Patient {
  name: string;
  owner: string;
  email: string;
  visitDate: Date;
  symptoms: string;
  createdFor: User;
}
