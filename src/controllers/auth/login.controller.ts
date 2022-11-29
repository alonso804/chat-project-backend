import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import logger from 'utils/logger';

import { LoginRequest, LoginResponse } from 'schemas/auth/login.schema';

import { UserModel } from 'models';
import { User } from 'models/User';

export const login = async (
  req: Request<LoginRequest>,
  res: Response<LoginResponse>
) => {
  logger.info('[POST] /auth/login');

  try {
    const { username, password } = req.body;

    const user = await UserModel.findOne(
      { username },
      { username: 1, password: 1, googleAuthSecret: 1 }
    ).lean();

    const isPasswordValid = await User.comparePassword(
      password,
      user?.password ?? ''
    );

    if (!user || !isPasswordValid) {
      logger.error('Invalid username or password');

      return res.status(200).json({ message: 'Invalid username or password' });
    }

    const payload = {
      username: user.username,
      id: user._id,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: 3600,
    });

    logger.info(`${username} logged`);

    return res
      .status(200)
      .json({ token, googleAuthSecret: user.googleAuthSecret });
  } catch (error) {
    logger.error(error);

    return res.status(500).json({ message: 'Internal server error' });
  }
};
