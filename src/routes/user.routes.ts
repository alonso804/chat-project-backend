import { Router } from 'express';

import { verifyToken } from 'middlewares/commons.middlewares';

import { getUserInfo } from 'controllers/user/get-user-info.controller';
import { getAllUsers } from 'controllers/user/get-all-users.controller';
import { getUserChats } from 'controllers/user/get-user-chats.controller';

const userRoutes = Router();

userRoutes.get('/get-user-info', verifyToken, getUserInfo);

userRoutes.get('/get-all-users', verifyToken, getAllUsers);

userRoutes.get('/get-user-chats', verifyToken, getUserChats);

export default userRoutes;
