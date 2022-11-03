import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ChatModel, UserModel } from 'models';

import logger from 'utils/logger';

export const getChat = async (req: Request, res: Response) => {
  const { username } = req.params;

  logger.info(`[GET] /chat/${username}`);

  const token = (req.headers.authorization as string).split(' ')[1];

  try {
    const reciever = await UserModel.findOne({ username }).lean();

    if (!reciever) {
      return res.status(404).json({ message: 'User not found' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    if (decoded.username === req.params.username) {
      logger.info('User is trying to get their own chat');

      return res.status(200).json({
        message: 'Cannot chat with yourself',
      });
    }

    const chat = await ChatModel.findOne(
      {
        users: [decoded.id, reciever._id],
      },
      {
        messages: {
          content: 1,
          sender: 1,
          createdAt: 1,
        },
      }
    ).populate('users', 'username -_id');

    if (!chat) {
      return res.status(200).json({
        chat: {
          users: [{ username: decoded.username }, { username: reciever.username }],
          messages: [],
        },
      });
    }

    return res.status(200).json({ chat });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: error });
  }
};
