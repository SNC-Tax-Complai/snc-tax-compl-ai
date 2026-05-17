import winston from 'winston';

const { combine, timestamp, json, printf, colorize } = winston.format;

const isDev = process.env.NODE_ENV !== 'production';

// Custom format for development
const devFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level}]: ${message}${metaStr}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    isDev ? combine(colorize(), devFormat) : json()
  ),
  defaultMeta: { service: 'snc-tax-backend' },
  transports: [
    // Console output
    new winston.transports.Console(),

    // File output (production)
    ...(isDev ? [] : [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880,
        maxFiles: 14,
      }),
    ]),
  ],
});

export default logger;
