import { User, UserRequest, CreateUserResponse } from './user.service.models';

export async function getUser(req: UserRequest): Promise<User> {
  return Promise.resolve({
    _id: 'idyo',
    username: req.user.username || 'someuser',
    email: req.user.email || 'jeff@gethuman.com'
  });
}

export async function createUser(req: UserRequest): Promise<CreateUserResponse> {
  return Promise.resolve({
    user: {
      _id: 'idyo',
      username: req.user.username || 'someuser',
      email: req.user.email || 'jeff@gethuman.com'
    },
    jwt: 'jwt string yo'
  });
}
