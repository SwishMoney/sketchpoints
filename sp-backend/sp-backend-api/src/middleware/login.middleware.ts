import { getConfigValue } from '../helpers/utils';
import { CONFIG_KEYS } from '../helpers/constants';
import { authenticateUser, generateJWT } from '../services/AuthService';

export async function login(req, res) {
  const { email, password, rememberMe } = req.body;
  const user = await authenticateUser(email, password);
  if (!user) {
    return res.status(401).send({ success: false, error: 'Invalid Login' });
  }
  const jwtSecret = await getConfigValue(CONFIG_KEYS.JWT_SECRET);
  const jwt = await generateJWT(jwtSecret, user);

  const cookieParams = {
    httpOnly: false,
    secure: false,
  } as any;

  const cookieDomain = await getConfigValue(CONFIG_KEYS.COOKIE_DOMAIN);
  const cookieName = await getConfigValue(CONFIG_KEYS.COOKIE_NAME);

  if (cookieDomain && cookieDomain !== 'localhost') {
    cookieParams.domain = cookieDomain;
    cookieParams.secure = true;
  }
  if (rememberMe) {
    const expirationInSeconds = await getConfigValue(
      CONFIG_KEYS.JWT_EXPIRATION_SECONDS
    );
    cookieParams.maxAge = expirationInSeconds * 1000;
  }

  res.cookie(cookieName, jwt, cookieParams);

  res.status(200).send({
    success: true,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      permissions: user.permissions,
    },
    jwt,
  });
}

export async function logout(req, res) {
  const cookieName = await getConfigValue(CONFIG_KEYS.COOKIE_NAME);
  res.clearCookie(cookieName);
  res.status(200).send({
    success: true,
  });
}
