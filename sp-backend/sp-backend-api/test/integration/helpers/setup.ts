import 'isomorphic-fetch';
import { createLogger } from '../../../src/services/LoggerService';
import { start, stop } from '../../../src/server';
import {
  NODE_ENVIRONMENTS,
  DEPLOY_STAGES,
} from '../../../src/helpers/constants';
import { setConfigValue } from '../../../src/helpers/utils';

beforeAll(async () => {
  setConfigValue('NODE_ENV', NODE_ENVIRONMENTS.TEST);
  setConfigValue('STAGE', DEPLOY_STAGES.TEST);
  createLogger('integration-tests', 'error');
  await start(4000);
});

afterAll(async () => {
  await stop();
});
