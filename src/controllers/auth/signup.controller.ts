import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

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
    const { username, password, publicKey, privateKey, googleAuthSecret } = req.body;

    const user = await UserModel.create({
      username,
      password: await User.encryptPassword(password),
      publicKey,
      privateKey,
      googleAuthSecret,
    });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET as string,
      {
        expiresIn: 3600,
      }
    );

    logger.info(`${username} created`);

    return res.status(200).json({ token });
  } catch (err) {
    logger.error(`[POST] /auth/signup: ${err}`);
    return res.status(500).json({ message: err as string });
  }
};
