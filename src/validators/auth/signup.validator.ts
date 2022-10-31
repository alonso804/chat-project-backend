import Joi from 'joi';
import { SignupRequest } from 'schemas/auth/signup.schema';

export const SignupValidator = Joi.object<SignupRequest>({
  username: Joi.string().min(3).required(),
  password: Joi.string()
    .pattern(
      new RegExp(
        // eslint-disable-next-line no-useless-escape
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,64})/
      )
    )
    .required(),
  phoneNumber: Joi.string().required(),
  publicKey: Joi.string().required(),
  privateKey: Joi.string().required(),
});
