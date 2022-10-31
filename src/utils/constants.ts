const { NODE_ENV } = process.env;

const MONGOOSE_PROD_OPTIONS = {
  journal: true,
  autoCreate: false,
  autoIndex: false,
  minPoolSize: 10,
};

const MONGOOSE_DEV_OPTIONS = {
  journal: true,
  autoCreate: true,
  autoIndex: true,
  minPoolSize: 10,
};

export const MONGOOSE_OPTIONS =
  NODE_ENV === 'production' ? MONGOOSE_PROD_OPTIONS : MONGOOSE_DEV_OPTIONS;

export const BCRYPT_SALT_ROUNDS = 10;
