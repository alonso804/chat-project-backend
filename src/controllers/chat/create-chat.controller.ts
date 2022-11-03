import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ChatModel, UserModel } from 'models';
import { Types } from 'mongoose';

import logger from 'utils/logger';

export const createChat = async (req: Request, res: Response) => {
  const { username } = req.params;
  const { content } = req.body;

  logger.info(`[POST] /chat/${username}`);

  const token = (req.headers.authorization as string).split(' ')[1];

  const chatId = new Types.ObjectId();

  try {
    const reciever = await UserModel.findOne({ username }, { _id: 1 }).lean();

    if (!reciever) {
      return res.status(404).json({ message: 'User not found' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    await Promise.all([
      await ChatModel.create({
        _id: chatId,
        users: [decoded.id, reciever._id],
        messages: [
          {
            sender: decoded.username,
            content,
          },
        ],
      }),

      await UserModel.updateOne(
        { username: decoded.username },
        {
          $push: {
            chats: {
              _id: chatId,
            },
          },
        }
      ),

      await UserModel.updateOne(
        { username },
        {
          $push: {
            chats: {
              _id: chatId,
            },
          },
        }
      ),
    ]);

    return res.status(200).json({ message: 'Chat created' });
  } catch (error) {
    logger.error(error);

    return res.status(500).json({ message: error });
  }
};
