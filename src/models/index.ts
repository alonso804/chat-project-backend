import { getModelForClass } from '@typegoose/typegoose';

import { Chat } from './Chat';
import { User } from './User';

export const UserModel = getModelForClass(User);
export const ChatModel = getModelForClass(Chat);
