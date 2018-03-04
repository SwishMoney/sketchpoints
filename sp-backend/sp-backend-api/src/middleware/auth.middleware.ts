import { config, HeaderNames } from '../helpers';
import { authenticateUser, generateJWT, decodeUserFromHeaders } from '../services/auth';

export function decodeJwt(req: any, res: any, next: any) {
  const jwtFromAuth = req.header(HeaderNames.AUTHORIZATION) && req.header(HeaderNames.AUTHORIZATION).replace(HeaderNames.BEARER + ' ', '');
  const jwtFromCookie = req.cookies[config.cookieName];
  req.user = decodeUserFromHeaders(config.jwtSecret, jwtFromAuth || jwtFromCookie);
  next();
}

export async function login(req: any, res: any) {
  const { email, password, rememberMe } = req.body;
  const user = await authenticateUser(email, password);
  if (!user) {
    return res.status(401).send({ success: false, error: 'Invalid Login' });
  }
  const jwt = await generateJWT(config.jwtSecret, user);

  const cookieParams = {
    httpOnly: false,
    secure: false
  } as any;

  const cookieDomain = config.cookieDomain;

  if (cookieDomain && cookieDomain !== 'localhost') {
    cookieParams.domain = cookieDomain;
    cookieParams.secure = true;
  }
  if (rememberMe) {
    cookieParams.maxAge = config.jwtExpirationSeconds * 1000;
  }

  res.cookie(config.cookieName, jwt, cookieParams);

  res.status(200).send({
    success: true,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username
    },
    jwt
  });
}

export async function logout(req: any, res: any) {
  res.clearCookie(config.cookieName);
  res.status(200).send({
    success: true
  });
}
