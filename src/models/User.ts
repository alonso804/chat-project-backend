import { prop, Ref, ReturnModelType, index } from '@typegoose/typegoose';
import { ObjectId } from 'mongoose';
import bcrypt from 'bcryptjs';

import { BCRYPT_SALT_ROUNDS } from 'utils/constants';

import { Chat } from './Chat';

@index({ username: 1 }, { unique: true })
export class User {
  @prop({ required: true })
  username!: string;

  @prop({ required: true })
  password!: string;

  @prop({ required: true })
  publicKey!: string;

  @prop({ required: true })
  privateKey!: string;

  @prop({ required: true })
  googleAuthSecret!: string;

  @prop({ ref: () => Chat, default: () => [] })
  chats!: Ref<Chat>[];

  static async findByUsername(
    this: ReturnModelType<typeof User>,
    username: string
  ): Promise<(User & { _id: ObjectId }) | null> {
    return this.findOne(
      { username },
      { _id: 1, username: 1, password: 1 }
    ).lean();
  }

  static async encryptPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  static async comparePassword(
    receivedPassword: string,
    password: string
  ): Promise<boolean> {
    return bcrypt.compare(receivedPassword, password);
  }
}
