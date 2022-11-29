import { ChatModel, UserModel } from 'models';
import jwt from 'jsonwebtoken';
import { Server as WebSocketServer } from 'socket.io';
import logger from 'utils/logger';
import { Types } from 'mongoose';
import { Chat } from 'models/Chat';
import { User } from 'models/User';

type SendMessageRequest = {
  chatId: string;
  message: string;
  receiver: {
    _id: string;
    username: string;
  };
};

type CreateChatRequest = {
  receiver: {
    _id: string;
    username: string;
  };
  message: string;
};

const users = new Map();

export default (io: WebSocketServer) => {
  io.use(async (socket, next) => {
    const { user } = socket.handshake.auth;
    const { token } = socket.handshake.query;

    if (!user._id || !(await UserModel.findById(user._id).lean())) {
      return next(new Error('Unauthorized'));
    }

    try {
      if (!token) {
        return next(new Error('No token provided'));
      }
      jwt.verify(token as string, process.env.JWT_SECRET as string);
      return next();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error(`Error while verifying token: ${error.message}`);

      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { user } = socket.handshake.auth;

    users.set(user._id, socket.id);

    socket.on(
      'sendMessage',
      async ({ chatId, message, receiver }: SendMessageRequest) => {
        logger.info(`Sending message to chat ${chatId}`);

        const chat = (await ChatModel.findByIdAndUpdate(
          chatId,
          {
            $push: {
              messages: {
                $each: [
                  {
                    sender: user._id,
                    content: message,
                  },
                ],
                $position: 0,
              },
            },
          },
          { new: true, lean: true }
        )) as unknown as Chat & { updatedAt: Date };

        const lastMessage = {
          createdAt: chat.updatedAt,
          content: message,
        };

        if (users.has(receiver._id)) {
          io.to(users.get(receiver._id)).emit('sendMessage', {
            chatId,
            message: { ...lastMessage, isSender: false },
          });

          const receiverUser = await UserModel.findById(receiver._id, {
            _id: 0,
            chats: 1,
          }).populate({
            path: 'chats',
            select: { users: 1, messages: 1 },
            options: { sort: { updatedAt: -1 } },
            populate: {
              path: 'users',
              select: { _id: 1, username: 1, publicKey: 1 },
            },
          });

          io.to(users.get(receiver._id)).emit('updateAllChats', {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            messages: receiverUser?.chats.map((userChat: any) => {
              const chatReceiver = (
                userChat.users[0]._id.toString() === receiver._id
                  ? userChat.users[1]
                  : userChat.users[0]
              ) as User & { _id: Types.ObjectId };

              return {
                receiver: {
                  _id: chatReceiver._id.toString(),
                  username: chatReceiver.username,
                  publicKey: chatReceiver.publicKey,
                },
                message: userChat?.messages[0].content,
                date: userChat?.messages[0].updatedAt,
              };
            }),
          });
        }

        io.to(users.get(user._id)).emit('sendMessage', {
          chatId,
          message: { ...lastMessage, isSender: true },
        });

        const senderUser = await UserModel.findById(user._id, {
          _id: 0,
          chats: 1,
        }).populate({
          path: 'chats',
          select: { users: 1, messages: 1 },
          options: { sort: { updatedAt: -1 } },
          populate: {
            path: 'users',
            select: { _id: 1, username: 1, publicKey: 1 },
          },
        });

        io.to(users.get(user._id)).emit('updateAllChats', {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          messages: senderUser?.chats.map((userChat: any) => {
            const chatReceiver = (
              userChat.users[0]._id.toString() === user._id
                ? userChat.users[1]
                : userChat.users[0]
            ) as User & { _id: Types.ObjectId };
            return {
              receiver: {
                _id: chatReceiver._id.toString(),
                username: chatReceiver.username,
                publicKey: chatReceiver.publicKey,
              },
              message: userChat?.messages[0].content,
              date: userChat?.messages[0].updatedAt,
            };
          }),
        });
      }
    );

    socket.on(
      'createChat',
      async ({ receiver, message }: CreateChatRequest) => {
        logger.info(`Creating chat between ${user._id} and ${receiver._id}`);

        const chatId = new Types.ObjectId();

        try {
          const [chat] = await Promise.all([
            (await ChatModel.create({
              _id: chatId,
              users: [user._id, receiver._id],
              messages: [
                {
                  sender: user._id,
                  content: message,
                },
              ],
            })) as unknown as Chat & { updatedAt: Date },

            await UserModel.findByIdAndUpdate(user._id, {
              $push: {
                chats: {
                  _id: chatId,
                },
              },
            }),

            await UserModel.findByIdAndUpdate(receiver._id, {
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

          if (users.has(receiver._id)) {
            io.to(users.get(receiver._id)).emit('newChat', {
              chatId,
              message: { ...lastMessage, isSender: false },
            });

            io.to(users.get(receiver._id)).emit('newLastMessage', {
              receiver: {
                _id: user._id,
                username: user.username,
                publicKey: user.publicKey,
              },
              message,
              date: chat.updatedAt,
            });
          }

          io.to(users.get(user._id)).emit('newChat', {
            chatId,
            message: { ...lastMessage, isSender: true },
          });

          io.to(users.get(user._id)).emit('newLastMessage', {
            receiver,
            message,
            date: chat.updatedAt,
          });
        } catch (error) {
          logger.error(error);
        }
      }
    );

    socket.on('disconnect', () => {
      users.delete(user._id);
      logger.info(`${user._id} disconnected`);
    });
  });
};
