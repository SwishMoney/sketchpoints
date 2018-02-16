import { v4 as uuid } from 'uuid';
import { ObjectId } from 'mongodb';
import { hash, compare } from 'bcrypt';
import { utc } from 'moment';
import * as jwt from 'jsonwebtoken';

import { getConfigValue } from '../helpers/utils';
import { CONFIG_KEYS } from '../helpers/constants';
import { generatePublicViewer } from '../services/ViewerService';
import { fetchUser } from '../services/UserService';
import Viewer from '../models/Viewer';
import User from '../models/User';

export async function authenticateUser(
  email: string,
  password: string
): Promise<User> {
  const user = await fetchUser({ email });
  const validPassword = await verifyPassword(password, user);
  return validPassword ? user : null;
}

export async function encryptPassword(password: string) {
  const saltRounds = await getConfigValue(CONFIG_KEYS.PASSWORD_SALT_ROUNDS);
  return hash(password, saltRounds);
}

export async function verifyPassword(
  passwordToTest: string,
  user: User
): Promise<boolean> {
  if (!user) {
    return false;
  }
  return compare(passwordToTest, user.passwordHash);
}

export async function generateJWT(
  secretKey: string,
  user: User
): Promise<string> {
  const id = uuid();
  const mDate = utc();
  const jwtExpirationSeconds = await getConfigValue(
    CONFIG_KEYS.JWT_EXPIRATION_SECONDS
  );
  const viewer = new Viewer({
    id,
    createdDate: mDate.toISOString(),
    expirationDate: mDate.add(jwtExpirationSeconds, 'seconds').toISOString(),
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      permissions: user.permissions || {},
    } as User,
  });
  return jwt.sign(
    {
      viewer,
    },
    secretKey,
    {
      expiresIn: jwtExpirationSeconds,
    }
  );
}

export async function generateCompanyJWT(
  secretKey: string,
  companyId: string,
  user: User
) {
  const id = uuid();
  const mDate = utc();
  const jwtExpirationSeconds = await getConfigValue(
    CONFIG_KEYS.JWT_EXPIRATION_SECONDS
  );
  const viewer = {
    id,
    createdDate: mDate.toISOString(),
    expirationDate: mDate.add(jwtExpirationSeconds, 'seconds').toISOString(),
    companyId,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      permissions: user.permissions || {},
    },
  };
  return jwt.sign(
    {
      viewer,
    },
    secretKey,
    {
      expiresIn: jwtExpirationSeconds,
    }
  );
}

export function decodeViewerFromHeaders(
  secretKey: string,
  authHeader: string
): Viewer {
  if (!authHeader || !authHeader.length) {
    return generatePublicViewer();
  }
  return decodeViewerFromToken(authHeader);
}

export function decodeViewerFromToken(token: string): Viewer {
  try {
    const payload = jwt.decode(token);
    if (payload && payload.viewer && payload.viewer.user) {
      payload.viewer.user._id = new ObjectId(payload.viewer.user.id);
      if (payload.viewer.companyId) {
        payload.viewer.companyId = new ObjectId(payload.viewer.companyId);
      }
      return new Viewer(payload.viewer);
    }
  } catch (e) {
    console.log('Error parsing token', token, e);
  }
  return generatePublicViewer();
}
