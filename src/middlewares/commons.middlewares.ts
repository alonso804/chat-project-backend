import { NextFunction, Request, Response } from 'express';
import { ObjectSchema } from 'joi';

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
