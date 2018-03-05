import { hash, compare } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { config } from '../../helpers';
import { getUser, User } from '../user';

export async function authenticateUser(email: string, password: string): Promise<User> {
  const user = await getUser({ user: { email } });
  const validPassword = await verifyPassword(password, user);
  return validPassword ? user : null;
}

export async function encryptPassword(password: string) {
  return hash(password, config.passwordSaltRounds);
}

export async function verifyPassword(passwordToTest: string, user: User): Promise<boolean> {
  if (!user) {
    return false;
  }
  return compare(passwordToTest, user.password);
}

export async function generateJWT(secretKey: string, user: User): Promise<string> {
  return jwt.sign(
    {
      user
    },
    secretKey,
    {
      expiresIn: config.jwtExpirationSeconds
    }
  );
}

export function decodeUserFromHeaders(secretKey: string, authHeader: string): User {
  if (!authHeader || !authHeader.length) {
    return null;
  }
  return decodeUserFromToken(authHeader);
}

export function decodeUserFromToken(token: string): User {
  const payload: any = jwt.decode(token);
  const user: User = payload && payload.user;
  return user;
}
