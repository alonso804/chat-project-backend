export type GetUserChatsResponse = {
  receiver: {
    _id: string;
    username: string;
  };
  message: string;
  date: Date;
}[] | { message: string };
