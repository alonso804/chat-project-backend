import { Server as WebSocketServer } from 'socket.io';
import logger from 'utils/logger';

export default (io: WebSocketServer) => {
  io.on('connection', () => {
    logger.info('a user connected');
  });
};
