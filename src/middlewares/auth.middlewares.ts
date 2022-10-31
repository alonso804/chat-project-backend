import { NextFunction, Request, Response } from 'express';

import logger from 'utils/logger';

import { SignupRequest, SignupResponse } from 'schemas/auth/signup.schema';

import { UserModel } from 'models';

export const checkDuplicateUsername = async (
  req: Request<SignupRequest>,
  res: Response<SignupResponse>,
  next: NextFunction
) => {
  logger.info('Checking duplicate username');

  try {
    const user = await UserModel.findOne({ username: req.body.username });

    if (user) {
      logger.error('Username already exists');

      return res.status(400).json({ message: 'Username already exists' });
    }

    return next();
  } catch (error) {
    logger.error(`Error while checking duplicate username: ${error}`);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
