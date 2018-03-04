import { Environment, LogLevel } from './constants';

const vars = require('../../../../env.json');

export interface Config {
  environment: Environment;
  mongoUrl: string;
  jwtSecret: string;
  jwtExpirationSeconds: number;
  logLevel: LogLevel;
  cookieDomain: string;
  cookieName: string;
  s3Bucket: string;
  passwordSaltRounds: number;
}

export const config: Partial<Config> = {};

export function initConfig(environment: string = Environment.DEVELOPMENT) {
  Object.assign(config, vars[environment], {
    environment: environment
  });
}
