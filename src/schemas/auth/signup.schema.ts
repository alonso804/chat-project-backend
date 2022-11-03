export type SignupRequest = {
  username: string;
  password: string;
  phoneNumber: string;
  publicKey: string;
  privateKey: string;
};

export type SignupResponse = {
  token?: string;
  message?: string;
};
