import { ChatModel, UserModel } from 'models';
import jwt from 'jsonwebtoken';
import { Server as WebSocketServer } from 'socket.io';
import logger from 'utils/logger';
import { Types } from 'mongoose';
import { Chat } from 'models/Chat';

type SendMessageRequest = {
  chatId: string;
  message: string;
};

type CreateChatRequest = {
  receiverId: string;
  message: string;
};

const users = new Map();

export default (io: WebSocketServer) => {
  io.use(async (socket, next) => {
    const { userId } = socket.handshake.auth;
    const { token } = socket.handshake.query;

    if (!userId || !(await UserModel.findById(userId).lean())) {
      return next(new Error('Unauthorized'));
    }

    try {
      if (!token) {
        return next(new Error('No token provided'));
      }
      jwt.verify(token as string, process.env.JWT_SECRET as string);
      return next();
    } catch (error: any) {
      logger.error(`Error while verifying token: ${error.message}`);

      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { userId } = socket.handshake.auth;

    users.set(userId, socket.id);

    socket.on('sendMessage', ({ chatId, message }: SendMessageRequest) => {
      logger.info(chatId);
      logger.info(message);
    });

    socket.on(
      'createChat',
      async ({ receiverId, message }: CreateChatRequest) => {
        const chatId = new Types.ObjectId();
        logger.info(`userId: ${userId}`);
        logger.info(`receiverId: ${receiverId}`);
        logger.info(`message: ${message}`);
        logger.info(`chatId: ${chatId}`);

        try {
          const [chat] = await Promise.all([
            (await ChatModel.create({
              _id: chatId,
              users: [userId, receiverId],
              messages: [
                {
                  sender: userId,
                  content: message,
                },
              ],
            })) as unknown as Chat & { updatedAt: Date },

            await UserModel.findByIdAndUpdate(userId, {
              $push: {
                chats: {
                  _id: chatId,
                },
              },
            }),

            await UserModel.findByIdAndUpdate(receiverId, {
              $push: {
                chats: {
                  _id: chatId,
                },
              },
            }),
          ]);

          const lastMessage = {
            createdAt: chat.updatedAt,
            content: message,
          };

          if (users.has(receiverId)) {
            io.to(users.get(receiverId)).emit('newChat', {
              chatId,
              message: { ...lastMessage, isSender: false },
            });

            io.to(users.get(userId)).emit('newChat', {
              chatId,
              message: { ...lastMessage, isSender: true },
            });
          }
        } catch (error) {
          logger.error(error);
        }
      }
    );

    socket.on('disconnect', () => {
      users.delete(userId);
      logger.info(`${userId} disconnected`);
    });
  });
};
