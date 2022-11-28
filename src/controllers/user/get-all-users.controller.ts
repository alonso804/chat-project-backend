import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

import logger from 'utils/logger';

import { GetAllUsersResponse } from 'schemas/user/getAllUsers.schema';
import { UserModel } from 'models';

export const getAllUsers = async (
  req: Request,
  res: Response<GetAllUsersResponse>
) => {
  logger.info('[GET] /user/get-all-users');
  const token = (req.headers.authorization as string).split(' ')[1];
  const { term } = req.query;

  try {
    const { id } = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const users = await UserModel.find(
      {
        _id: { $ne: id },
        ...(term &&
          term !== '' && {
            username: { $regex: term as string, $options: 'i' },
          }),
      },
      { username: 1 }
    )
      .limit(5)
      .lean();

    return res.status(200).json(users as GetAllUsersResponse);
  } catch (error) {
    logger.error(error);

    return res.status(500).json({ message: 'Internal server error' });
  }
};
