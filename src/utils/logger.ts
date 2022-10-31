import { createLogger, format, transports } from 'winston';

type ColorsType = {
  [key: string]: string;
};

const Colors: ColorsType = {
  info: '\x1b[36m',
  error: '\x1b[31m',
  warn: '\x1b[33m',
  verbose: '\x1b[43m',
  reset: '\x1b[0m',
};

export default createLogger({
  format: format.combine(
    format.simple(),
    format.timestamp(),
    format.printf(
      (info) =>
        `${info.timestamp} [${Colors[info.level]}${info.level.toUpperCase()}${Colors.reset}] ${
          info.message
        }`
    )
  ),
  transports: [new transports.Console()],
});
