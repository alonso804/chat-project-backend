import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

import logger from 'utils/logger';

import { GetUserInfoResponse } from 'schemas/user/getUserInfo.schema';
import { UserModel } from 'models';

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

    const user = await UserModel.findById(id, { publicKey: 1, privateKey: 1 }).lean();

    return res.status(200).json({ id, username, publicKey: user?.publicKey, privateKey: user?.privateKey });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(error);

    return res.status(500).json({ message: error.message as string });
  }
};
