import mongoose from 'mongoose';
import { MONGOOSE_OPTIONS } from './constants';
import logger from './logger';

mongoose
  .connect(process.env.MONGODB_URI as string, MONGOOSE_OPTIONS)
  .then(() => logger.info(`DB connected on ${mongoose.connection.name}`))
  .catch((err) => logger.error(err));
