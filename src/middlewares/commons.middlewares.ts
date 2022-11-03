import { NextFunction, Request, Response } from 'express';
import { ObjectSchema } from 'joi';
import jwt from 'jsonwebtoken';

import logger from 'utils/logger';

export const validateSchema = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    logger.info('Validating schema');

    const { error } = schema.validate(req.body);

    if (!error) {
      next();
    } else {
      const { details } = error;
      const message = details.map(({ message }) => message).join(',');

      logger.error(`Schema validation error: ${message}`);

      res.status(400).json({ error: message });
    }
  };
};

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.info('Verifying token');

  const header = req.headers.authorization;

  if (!header || header.split(' ')[0] !== 'Bearer') {
    logger.error('Token not found');

    return res.status(401).json({ error: 'Token not found' });
  }

  const decoded = jwt.verify(
    header.split(' ')[1],
    process.env.JWT_SECRET as string
  );

  if (!decoded) {
    logger.error('Invalid token');

    return res.status(401).json({ error: 'Invalid token' });
  }

  logger.info('Token verified');

  return next();
};
