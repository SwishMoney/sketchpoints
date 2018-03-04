import { v4 as uuid } from 'uuid';
import { mergeSchemas } from 'graphql-tools';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { logger } from '../helpers';
import { userSchema } from '../services/user';

export function graphql() {
  return graphqlExpress((req: any) => {
    return {
      schema: mergeSchemas({ schemas: [userSchema] }),
      context: {
        rid: `api-${uuid()}`,
        headers: req.headers,
        viewer: req.viewer
      },
      formatError: (err: any) => {
        logger.error(err);
        return {
          message: err.message || 'There was an error processing the request.',
          path: err.path
        };
      }
    };
  });
}

export function graphqlInteractive() {
  return graphiqlExpress({ endpointURL: '/graphql' });
}
