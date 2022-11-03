import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ChatModel } from 'models';

import logger from 'utils/logger';

export const sendMessage = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { content } = req.body;

  logger.info(`[PUT] /chat/${chatId}`);

  const token = (req.headers.authorization as string).split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    await ChatModel.findByIdAndUpdate(chatId, {
      $push: {
        messages: {
          sender: decoded.username,
          content,
        },
      },
    });

    return res.status(200).json({ message: 'Message sended' });
  } catch (error) {
    logger.error(error);

    return res.status(500).json({ message: error });
  }
};
