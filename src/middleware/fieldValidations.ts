import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

export const fieldValidations = ( req: Request, res: Response, next: NextFunction ) => {
  const errors = validationResult( req );

  if ( !errors.isEmpty() ) return res.status(400).json({ ok: false, errors: errors.array() });

  return next();
}