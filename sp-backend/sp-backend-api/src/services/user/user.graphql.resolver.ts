import * as userService from './user.service';

export const userResolver = {
  Query: {
    getUser: (root: any, args: any, { user }: any) => userService.getUser(user)
  },
  Mutation: {
    createUser: (root: any, args: any, { user }: any) => userService.createUser(user)
  }
};
