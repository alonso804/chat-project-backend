export type GetAllUsersResponse = {
  _id: string;
  username: string;
  publicKey: string;
}[] | { message: string };
