import Joi from 'joi';
import { LoginRequest } from 'schemas/auth/login.schema';

export const LoginValidator = Joi.object<LoginRequest>({
  username: Joi.string().required(),
  password: Joi.string().required(),
});
