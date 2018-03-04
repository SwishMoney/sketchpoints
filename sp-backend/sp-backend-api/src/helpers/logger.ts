import * as winston from 'winston';
import { config } from './config';
import { LogLevel } from './constants';

export interface Logger {
  error(message: string, ...vars: any[]): void;
  info(message: string, ...vars: any[]): void;
  debug(message: string, ...vars: any[]): void;
  log(level: LogLevel, message: string, ...vars: any[]): void;
}

export const logger: Logger = winston.createLogger({
  level: config.logLevel || LogLevel.DEBUG,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.simple(), winston.format.colorize())
    })
  ]
});
