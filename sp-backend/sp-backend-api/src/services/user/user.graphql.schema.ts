import * as fs from 'fs';
import * as path from 'path';
import { makeExecutableSchema } from 'graphql-tools';
import { userResolver } from './user.graphql.resolver';

export const userSchema = makeExecutableSchema({
  typeDefs: fs.readFileSync(path.join(process.cwd(), 'src/services/user/user.graphql.typedefs.gql'), 'utf8'),
  resolvers: [userResolver]
});
