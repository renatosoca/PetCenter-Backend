import { genSaltSync, hashSync, compareSync } from 'bcrypt';

export const hashPassword = ( password: string ) => {
  const salt = genSaltSync( 10 )
  return hashSync( password, salt );
}

export const comparePassword = ( password: string, passwordHash: string ) => {
  return compareSync( password, passwordHash );
}