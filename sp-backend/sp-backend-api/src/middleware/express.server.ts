import 'isomorphic-fetch';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as helmet from 'helmet';
import * as cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';
import * as expressWinston from 'express-winston';
import { promisify } from 'util';
import { mergeStrings } from 'gql-merge';
import { makeExecutableSchema } from 'graphql-tools';
import { merge } from 'lodash';
import { v4 as uuid } from 'uuid';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { CONFIG_KEYS, DEPLOY_STAGES } from './helpers/constants';
import { getConfigValue } from './helpers/utils';
import { createConnection } from './services/MongoDB';
import { logger } from './services/LoggerService';
import { decodeViewerFromHeaders } from './services/AuthService';
import { login, logout } from './controllers/login';
import { signS3Attachment } from './controllers/attachments';
import ticketResolvers from './resolvers/TicketResolver';
import healthResolvers from './resolvers/HealthResolver';
import userResolvers from './resolvers/UserResolver';
import companyResolvers from './resolvers/CompanyResolver';

let server;

async function constructSchema() {
  if (global.schema) {
    return global.schema;
  }

  const readDir = promisify(fs.readdir);
  const readFile = promisify(fs.readFile);
  const typesDir = path.resolve(__dirname, './schemas');
  const typeFiles = await readDir(typesDir);
  const types = await Promise.all(
    typeFiles.map(
      async file => await readFile(path.join(typesDir, file), 'utf-8')
    )
  );

  const resolvers = merge(
    {},
    ticketResolvers,
    healthResolvers,
    userResolvers,
    companyResolvers
  );

  // Construct a schema, using GraphQL schema language
  const schema = makeExecutableSchema({
    typeDefs: mergeStrings(types),
    resolvers,
  });
  logger().log('info', `Constructed Schema from ${types.length} files.`);

  global.schema = schema;
  return schema;
}

export async function start(port: number) {
  const app = express();

  const STAGE = await getConfigValue(CONFIG_KEYS.STAGE);
  const mongoUrl = await getConfigValue(CONFIG_KEYS.MONGO_URL);
  const secretKey = await getConfigValue(CONFIG_KEYS.JWT_SECRET);
  const cookieName = await getConfigValue(CONFIG_KEYS.COOKIE_NAME);

  await createConnection(mongoUrl);

  const graphQlSchema = await constructSchema();

  // Security
  app.use(helmet());
  app.use(
    cors({
      origin: [/localhost:.*/, /.*fixgiant.com/],
      optionsSuccessStatus: 200,
      credentials: true,
    })
  );

  app.use(bodyParser.json());
  app.use(cookieParser());

  // Get Viewer
  app.use((req: any, res, next) => {
    const jwtFromAuth =
      req.header('Authorization') &&
      req.header('Authorization').replace('Bearer ', '');
    const jwtFromCookie = req.cookies[cookieName];
    req.viewer = decodeViewerFromHeaders(
      secretKey,
      jwtFromAuth || jwtFromCookie
    );
    next();
  });

  // Logging
  app.use(
    expressWinston.logger({
      winstonInstance: logger(),
      meta: true,
      expressFormat: true,
      colorize: true,
      requestWhitelist: ['responseTime'],
      responseWhitelist: [],
      dynamicMeta: (req, res) => {
        const meta = {
          isLoggedIn: req.viewer && req.viewer.user ? true : false,
          viewer: req.viewer,
          graphql: false,
        } as any;
        if (req.body && req.body.operationName) {
          meta.graphql = {
            operationName: req.body && req.body.operationName,
          };
          const privateOperations = ['CreateAccount', 'ResetPasswordWithCode'];
          if (
            req.body.variables &&
            !privateOperations.includes(req.body.operationName)
          ) {
            meta.graphql.variables = req.body.variables;
          }
        }
        return meta;
      },
    })
  );

  app.use(
    '/graphql',
    graphqlExpress((req: any) => {
      return {
        schema: graphQlSchema,
        context: {
          rid: `api-${uuid()}`,
          headers: req.headers,
          viewer: req.viewer,
        },
        formatError: err => {
          logger().log('error', err);
          return {
            message:
              err.message || 'There was an error processing the request.',
            path: err.path,
          };
        },
      };
    })
  );

  if (STAGE !== DEPLOY_STAGES.PROD) {
    app.get('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));
  }

  app.post('/login', login);
  app.post('/logout', logout);
  app.post('/sign-attachment', signS3Attachment(secretKey));

  server = await new Promise((resolve, reject) => {
    const httpServer = app.listen(port, err => {
      if (err) {
        reject(err);
      }
      resolve(httpServer);
    });
  });
}

export async function stop() {
  return new Promise((resolve, reject) => {
    server.close(err => {
      if (err) {
        return reject(err);
      }
      server = null;
      resolve();
    });
  });
}
