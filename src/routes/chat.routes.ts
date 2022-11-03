import { Router } from 'express';

import { createChat } from 'controllers/chat/create-chat.controller';
import { getChat } from 'controllers/chat/get-chat.controller';
import { sendMessage } from 'controllers/chat/send-message.controller';

const authRoutes = Router();

authRoutes.post('/:username', createChat);

authRoutes.put('/:chatId', sendMessage);

authRoutes.get('/:username', getChat);

export default authRoutes;
