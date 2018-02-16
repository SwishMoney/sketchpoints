export const LOCAL = {
  MONGO_URL: 'mongodb://localhost:27017/sketchpoints',
  JWT_SECRET: 'not-a-secret',
  JWT_EXPIRATION_SECONDS: 60,
  PASSWORD_SALT_ROUNDS: 1,
  RECAPTCHA_KEY: 'test',
  COOKIE_DOMAIN: 'localhost',
  COOKIE_NAME: 'sp-local-auth',
  S3_BUCKET: 'sketchpoints-attachments'
};

export const TEST = {
  MONGO_URL: 'mongodb://localhost:27017/sketchpoints-test',
  JWT_SECRET: 'not-a-secret',
  JWT_EXPIRATION_SECONDS: 60,
  PASSWORD_SALT_ROUNDS: 1,
  RECAPTCHA_KEY: 'test',
  COOKIE_NAME: 'sp-test-auth',
  COOKIE_DOMAIN: 'localhost'
};

export const E2E = {
  JWT_SECRET: 'not-a-secret',
  JWT_EXPIRATION_SECONDS: 60,
  PASSWORD_SALT_ROUNDS: 1,
  COOKIE_DOMAIN: 'localhost',
  COOKIE_NAME: 'sp-e2e-auth'
};

export const DEV = {
  JWT_EXPIRATION_SECONDS: 60 * 60 * 24 * 30, // 30 days
  PASSWORD_SALT_ROUNDS: 12,
  S3_BUCKET: 'sketchpoints-attachments',
  COOKIE_DOMAIN: '.sketchpoints.io',
  COOKIE_NAME: 'sp-dev-auth'
};

export const PROD = {
  JWT_EXPIRATION_SECONDS: 60 * 60 * 24 * 30, // 30 days
  PASSWORD_SALT_ROUNDS: 12,
  S3_BUCKET: 'sketchpoints-attachments',
  COOKIE_DOMAIN: '.sketchpoints.io',
  COOKIE_NAME: 'sp-auth'
};

export default {
  LOCAL,
  TEST,
  E2E,
  DEV,
  PROD
};
