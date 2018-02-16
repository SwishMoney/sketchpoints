import { USERS } from './fixtures';
import {
  generateCompanyJWT,
  generateJWT,
} from '../../../src/services/AuthService';
import { getConfigValue } from '../../../src/helpers/utils';
import { CONFIG_KEYS } from '../../../src/helpers/constants';

interface GraphqlResponse {
  status: number;
  data: any;
  errors?: Array<any>;
}

interface GraphqlOptions {
  authorizedUserEmail?: string;
  jwt?: string;
}

interface ApiResponse {
  status: number;
  body?: any;
}

interface RequestyBody {
  query: string;
  operationName?: string;
  variables?: any;
}

type HttpMethod = 'post' | 'get';

const API_URL = 'http://localhost:4000';

export async function graphqlQuery(
  requestBody: RequestyBody,
  options?: GraphqlOptions
): Promise<GraphqlResponse> {
  let authorization;
  if (options && options.authorizedUserEmail) {
    const user = USERS.find(u => u.email === options.authorizedUserEmail);
    if (!user) {
      throw new Error(
        `Unable to find user with email ${options.authorizedUserEmail}`
      );
    }
    const jwtSecret = await getConfigValue(CONFIG_KEYS.JWT_SECRET);
    const jwt = user.companyId
      ? await generateCompanyJWT(jwtSecret, user.companyId.toHexString(), user)
      : await generateJWT(jwtSecret, user);
    authorization = `Bearer ${jwt}`;
  } else if (options && options.jwt) {
    authorization = `Bearer ${options.jwt}`;
  }

  const headers = {
    'Content-Type': 'application/json',
  };
  if (authorization) {
    headers['authorization'] = authorization;
  }

  const requestOptions = {
    body: JSON.stringify(requestBody),
    headers: new Headers(headers),
    method: 'post',
  };

  const res = await fetch(`${API_URL}/graphql`, requestOptions);

  let body;
  try {
    body = await res.json();
  } catch (e) {
    // Probably an error response that isn't JSON
  }
  try {
    body = await res.text();
  } catch (e) {
    // Should be ok
  }

  return {
    status: res.status,
    data: body && body.data ? body.data : body,
    errors: body && body.errors ? body.errors : null,
  };
}

export async function apiRequest(
  route: string,
  method: HttpMethod,
  requestBody: object
): Promise<ApiResponse> {
  const res = await fetch(`${API_URL}${route}`, {
    method,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  let body;
  try {
    body = await res.json();
  } catch (e) {
    // Probably an error response that isn't JSON
  }
  try {
    body = await res.text();
  } catch (e) {
    // Should be ok
  }

  return {
    status: res.status,
    body,
  };
}
