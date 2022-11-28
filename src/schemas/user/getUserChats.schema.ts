export type GetUserChatsResponse = {
  username: string;
  message: string;
  date: Date;
}[] | { message: string };
