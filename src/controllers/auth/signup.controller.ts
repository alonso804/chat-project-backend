import { Request, Response } from 'express';

import logger from 'utils/logger';

import { SignupRequest, SignupResponse } from 'schemas/auth/signup.schema';

import { UserModel } from 'models';
import { User } from 'models/User';

export const signup = async (
  req: Request<SignupRequest>,
  res: Response<SignupResponse>
) => {
  logger.info('[POST] /auth/signup');

  try {
    const { username, password, phoneNumber, publicKey, privateKey } = req.body;

    await UserModel.create({
      username,
      password: await User.encryptPassword(password),
      phoneNumber,
      publicKey,
      privateKey,
    });

    logger.info(`[POST] /auth/signup: ${username} created`);
    return res.status(200).json({ message: 'User created successfully' });
  } catch (err) {
    logger.error(`[POST] /auth/signup: ${err}`);
    return res.status(500).json({ message: err as string });
  }
};
