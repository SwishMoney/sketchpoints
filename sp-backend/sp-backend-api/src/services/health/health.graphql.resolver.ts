export const healthResolver = {
  Query: {
    health: (root: any, args: any, { user }: any) => Promise.resolve(true)
  }
};
