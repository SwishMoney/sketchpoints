import { makeExecutableSchema } from 'graphql-tools';
import { userTypeDefs } from './user.typedefs';
import { userResolvers } from './user.resolvers';

export const userSchema = makeExecutableSchema({
  typeDefs: userTypeDefs,
  resolvers: userResolvers
});
