export interface User {
  _id: any;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  passwordHash: string;
  createdDate: string;
}
