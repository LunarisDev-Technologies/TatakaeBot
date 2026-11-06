import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export function createLogger(name: string) {
  return pino({
    name,
    level: process.env.LOG_LEVEL || 'info',
    transport: !isProduction
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  });
}

export const logger = createLogger('tatakae-nexus');
export type Logger = pino.Logger;

