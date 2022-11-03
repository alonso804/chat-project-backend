import { Router } from 'express';

import { verifyToken } from 'middlewares/commons.middlewares';

import { createChat } from 'controllers/chat/create-chat.controller';
import { getChat } from 'controllers/chat/get-chat.controller';
import { sendMessage } from 'controllers/chat/send-message.controller';

const authRoutes = Router();

authRoutes.post('/:username', verifyToken, createChat);

authRoutes.put('/:chatId', verifyToken, sendMessage);

authRoutes.get('/:username', verifyToken, getChat);

export default authRoutes;
