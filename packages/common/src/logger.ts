import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp, runId, agent }) => {
  const prefix = agent ? `[${agent}]` : '';
  const runIdStr = runId ? ` {${runId}}` : '';
  return `${timestamp}${runIdStr} ${level} ${prefix}: ${message}`;
});

export const createLogger = (agent?: string, runId?: string) => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      colorize(),
      logFormat
    ),
    defaultMeta: { agent, runId },
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ 
        filename: 'logs/error.log', 
        level: 'error' 
      }),
      new winston.transports.File({ 
        filename: 'logs/combined.log' 
      })
    ]
  });
};

export const logger = createLogger();