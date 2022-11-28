import { prop, Ref, modelOptions } from '@typegoose/typegoose';

import { User } from './User';

@modelOptions({
  schemaOptions: {
    _id: false,
    timestamps: true,
  },
})
class Message {
  @prop({ required: true })
  content!: string;

  @prop({ required: true })
  sender!: Ref<User>;
}

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class Chat {
  @prop({ ref: () => User, default: () => [] })
  users!: Ref<User>[];

  @prop({ type: () => Message, default: () => [] })
  messages!: Message[];
}
