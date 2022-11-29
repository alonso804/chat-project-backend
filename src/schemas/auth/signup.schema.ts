export type SignupRequest = {
  username: string;
  password: string;
  publicKey: string;
  privateKey: string;
  googleAuthSecret: string;
};

export type SignupResponse = {
  token?: string;
  message?: string;
};
