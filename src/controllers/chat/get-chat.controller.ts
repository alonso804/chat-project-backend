import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ChatModel, UserModel } from 'models';

import logger from 'utils/logger';

export const getChat = async (req: Request, res: Response) => {
  const { username } = req.params;

  logger.info(`[GET] /chat/${username}`);

  const token = (req.headers.authorization as string).split(' ')[1];

  try {
    const receiver = await UserModel.findOne({ username }).lean();

    if (!receiver) {
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
        users: {
          $all: [receiver._id, decoded.id],
        },
      },
      {
        _id: 1,
      }
    );

    if (!chat) {
      return res.status(200).json({
        receiver: receiver.username,
        messages: [],
      });
    }

    const sortedChat = await ChatModel.aggregate([
      {
        $match: {
          _id: chat._id,
        },
      },
      {
        $unwind: '$messages',
      },
      {
        $group: {
          _id: '$_id',
          messages: {
            $push: {
              content: '$messages.content',
              createdAt: '$messages.createdAt',
              isSender: {
                $cond: {
                  if: {
                    $eq: ['$messages.sender', decoded.id],
                  },
                  then: true,
                  else: false,
                },
              },
            },
          },
          receiver: {
            $first: receiver.username,
          },
        },
      },
    ]);

    return res.status(200).json({
      id: sortedChat[0]._id,
      messages: sortedChat[0].messages,
      receiver: sortedChat[0].receiver,
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: error });
  }
};
