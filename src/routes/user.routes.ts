import { Router } from 'express';

import { verifyToken } from 'middlewares/commons.middlewares';

import { getUserInfo } from 'controllers/user/get-user-info.controller';

const authRoutes = Router();

authRoutes.get(
  '/get-user-info',
  verifyToken,
  getUserInfo
);

export default authRoutes;
