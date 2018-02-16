require('source-map-support').install();
import { start } from './middleware';
import { createLogger } from './services/LoggerService';
import { setConfigValue } from './helpers/utils';
import { NODE_ENVIRONMENTS } from './helpers/constants';

(async function startApp() {
  const logger = createLogger('fixgiant', 'info');

  if (!process.env.STAGE) {
    logger.log('error', 'You must specify which STAGE this app is running in');
    process.exit(1);
  }

  setConfigValue('NODE_ENV', process.env.NODE_ENV || NODE_ENVIRONMENTS.DEVELOPMENT);
  setConfigValue('STAGE', process.env.STAGE);

  logger.log('info', 'Starting...');
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
  await start(PORT);
  logger.log('info', `Application Online, Port ${PORT}`);
})();
