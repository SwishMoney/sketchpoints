export const userTypeDefs = `
type Query {
  foo(firstName: String, lastName: String): User
}

type User {
  firstName: String
  lastName: String
}

`;
