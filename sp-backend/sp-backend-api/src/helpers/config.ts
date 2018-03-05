import { Environment, LogLevel } from './constants';

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

export function initConfig(environment: string = Environment.DEVELOPMENT, vars: any) {
  Object.assign(config, vars[environment], {
    environment: environment
  });
}
