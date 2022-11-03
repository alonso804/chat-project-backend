import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

import logger from 'utils/logger';

import { GetUserInfoResponse } from 'schemas/user/getUserInfo.schema';

export const getUserInfo = async (
  req: Request,
  res: Response<GetUserInfoResponse>
) => {
  logger.info('[GET] /user/get-user-info');
  const token = (req.headers.authorization as string).split(' ')[1];

  try {
    const { id, username } = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    return res.status(200).json({ id, username });
  } catch (error) {
    logger.error(error);

    return res.status(500).json({ message: 'Internal server error' });
  }
};
