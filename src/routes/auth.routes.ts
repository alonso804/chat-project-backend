import { Router } from 'express';

import { SignupValidator } from 'validators/auth/signup.validator';
import { LoginValidator } from 'validators/auth/login.validator';

import { validateSchema } from 'middlewares/commons.middlewares';
import { checkDuplicateUsername } from 'middlewares/auth.middlewares';

import { signup } from 'controllers/auth/signup.controller';
import { login } from 'controllers/auth/login.controller';

const authRoutes = Router();

authRoutes.post(
  '/signup',
  validateSchema(SignupValidator),
  checkDuplicateUsername,
  signup
);

authRoutes.post('/login', validateSchema(LoginValidator), login);

export default authRoutes;

