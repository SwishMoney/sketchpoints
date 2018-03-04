import * as express from 'express';
import * as bodyParser from 'body-parser';
// import * as cookieParser from 'cookie-parser';
import * as helmet from 'helmet';
import * as cors from 'cors';
import { graphql, graphqlInteractive } from './graphql.middleware';

let server: any;

export async function startApi(port: number) {
  const app = express();

  // Security
  app.use(helmet());
  app.use(
    cors({
      origin: ['*'],
      optionsSuccessStatus: 200,
      credentials: true
    })
  );

  app.use(bodyParser.json());
  // app.use(cookieParser());

  // get user from jwt token in the header
  // app.use(decodeJwt);

  // setup graphql endpoints
  app.use('/graphql', graphql());
  app.get('/graphiql', graphqlInteractive());

  // routes that we don't want going through GraphQL
  // app.post('/login', login);
  // app.post('/logout', logout);
  // app.post('/sign-attachment', signS3Attachment(secretKey));

  server = await new Promise((resolve, reject) => {
    const httpServer = app.listen(port, (err: any) => {
      if (err) {
        reject(err);
      }
      resolve(httpServer);
    });
  });
}

export async function stopApi() {
  return new Promise((resolve, reject) => {
    if (!server) {
      resolve();
    }

    server.close((err: any) => {
      if (err) {
        return reject(err);
      }
      server = null;
      resolve();
    });
  });
}
