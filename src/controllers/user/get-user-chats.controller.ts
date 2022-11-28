import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

import logger from 'utils/logger';

import { GetUserChatsResponse } from 'schemas/user/getUserChats.schema';

import { UserModel } from 'models';

export const getUserChats = async (
  req: Request,
  res: Response<GetUserChatsResponse>
) => {
  logger.info('[GET] /user/get-all-chats');
  const token = (req.headers.authorization as string).split(' ')[1];

  try {
    const { id } = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const user = await UserModel.findById(id, { _id: 0, chats: 1 }).populate({
      path: 'chats',
      select: { users: 1, messages: 1 },
      options: { sort: { updatedAt: -1 } },
      populate: {
        path: 'users',
        select: { _id: 1, username: 1 },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chats = user.chats.map((chat: any) => {
      const reciever =
        chat.users[0]._id.toString() === id ? chat.users[1] : chat.users[0];

      return {
        receiver: {
          _id: reciever._id,
          username: reciever.username,
        },
        message: chat.messages[0].content,
        date: chat.messages[0].updatedAt,
      };
    });

    return res.status(200).json(chats);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(error);

    return res.status(500).json({ message: error.message as string });
  }
};
