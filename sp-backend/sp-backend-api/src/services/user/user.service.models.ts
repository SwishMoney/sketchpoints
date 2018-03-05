// main user model
export interface User {
  _id: any;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  twitterHandle?: string;
  profileImageUrl?: string;
  password?: string;
  createdDate?: Date;

  // todo: add products
}

// common for multiple user transactions
export type UserPartial = Partial<User>;
export interface UserRequest {
  user: UserPartial;
}

// createUser
export interface CreateUserResponse {
  user: User;
  jwt: string;
}
