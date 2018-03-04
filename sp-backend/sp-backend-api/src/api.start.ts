require('source-map-support').install();
import { startApi } from './middleware';
import { logger, initConfig, Environment } from './helpers';

(async function startApp() {
  logger.info('Starting...');

  const environment = process.env.ENVIRONMENT || Environment.DEVELOPMENT;
  initConfig(environment);

  await createConnection(mongoUrl);

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
  await startApi(PORT);

  logger.info(`Application Online, Port ${PORT}`);
})();
