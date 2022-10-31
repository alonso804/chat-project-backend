import dotenv from 'dotenv';
dotenv.config();

import 'utils/mongoose';
import logger from 'utils/logger';

import express, { Request, Response } from 'express';
import cors from 'cors';

import authRoutes from 'routes/auth.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('port', process.env.PORT || 3000);

app.get('/', (_: Request, res: Response) => {
  res.send('Hello World!');
});

app.use('/api/auth', authRoutes);

app.listen(app.get('port'), () => {
  logger.info(`Server is running on port ${process.env.PORT}`);
});
