import * as winston from 'winston';
import { NODE_ENVIRONMENTS } from './constants';

type logLevels = 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly';

interface Logger {
  log(level: logLevels, message: string, ...vars: any[]): void;
}

let _logger: Logger;

export function createLogger(name: string, level?: logLevels): Logger {
  if (_logger) {
    return _logger;
  }

  // Output to the console, which then goes to Cloud Watch
  const transports = [];
  switch (process.env.NODE_ENV) {
    case NODE_ENVIRONMENTS.DEVELOPMENT:
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(winston.format.simple(), winston.format.colorize())
        })
      );
      break;
    case NODE_ENVIRONMENTS.TEST:
      transports.push(
        new winston.transports.Console({
          level: 'off'
        })
      );
      break;
    case NODE_ENVIRONMENTS.PRODUCTION:
      transports.push(
        new winston.transports.Console({
          format: winston.format.json()
        })
      );
      break;
  }

  _logger = winston.createLogger({
    level: level || 'info',
    transports
  });

  return _logger;
}

export function logger() {
  return _logger;
}
