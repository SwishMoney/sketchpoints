import { createLogger } from '../../src/services/LoggerService';
import { NODE_ENVIRONMENTS, DEPLOY_STAGES } from '../../src/helpers/constants';
import { setConfigValue } from '../../src/helpers/utils';

beforeAll(() => {
  setConfigValue('NODE_ENV', NODE_ENVIRONMENTS.TEST);
  setConfigValue('STAGE', DEPLOY_STAGES.TEST);
  createLogger('tests', 'error');
});
