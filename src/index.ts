import dotenv from 'dotenv';
dotenv.config();

import 'utils/mongoose';
import logger from 'utils/logger';

import express, { Request, Response } from 'express';
import cors from 'cors';
import { Server as WebSocketServer } from 'socket.io';
import http from 'http';
import cookieParser from 'cookie-parser';

import sockets from './sockets';

import authRoutes from 'routes/auth.routes';
import chatRoutes from 'routes/chat.routes';
import userRoutes from 'routes/user.routes';

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.set('port', process.env.PORT || 3000);

app.get('/', (_: Request, res: Response) => {
  res.sendFile('index.html');
});

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user', userRoutes);

const server = http.createServer(app);
const io = new WebSocketServer(server);

sockets(io);

server.listen(app.get('port'), () => {
  logger.info(`Server on port ${app.get('port')}`);
});
