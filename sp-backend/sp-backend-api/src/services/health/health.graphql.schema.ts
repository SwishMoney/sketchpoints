import * as fs from 'fs';
import * as path from 'path';
import { makeExecutableSchema } from 'graphql-tools';
import { healthResolver } from './health.graphql.resolver';

export const healthSchema = makeExecutableSchema({
  typeDefs: fs.readFileSync(path.join(process.cwd(), 'src/services/health/health.graphql.typedefs.gql'), 'utf8'),
  resolvers: [healthResolver]
});
