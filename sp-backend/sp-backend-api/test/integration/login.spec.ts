import { MongoClient } from 'mongodb';
import { COLLECTIONS } from '../../src/helpers/constants';
import { TEST } from '../../src/helpers/config';
import { apiRequest } from './helpers/request';
import { USERS } from './helpers/fixtures';
import { clearDatabase } from './helpers/db';

let db;

beforeAll(async () => {
  db = await MongoClient.connect(TEST.MONGO_URL);
  await clearDatabase(db);
  await db.collection(COLLECTIONS.USERS).insertMany(USERS);
});

afterAll(async () => {
  await db.collection(COLLECTIONS.USERS).remove({});
  await db.close(true);
});

it('should authenticate a valid user and return a JWT', async () => {
  const { status, body } = await apiRequest('/login', 'post', {
    email: 'user1@test.com',
    password: 'test',
  });
  expect(status).toBe(200);
  expect(body).toHaveProperty('jwt');
  expect(body.jwt.length).toBeGreaterThan(100);
});

it('should fail the authentication with a bad password', async () => {
  const { status, body } = await apiRequest('/login', 'post', {
    email: 'user1@test.com',
    password: 'this-is-not-correct',
  });
  expect(status).toBe(401);
  expect(body).toHaveProperty('error');
});

it('should fail the authentication with a bad email address', async () => {
  const { status, body } = await apiRequest('/login', 'post', {
    email: 'user-does-not-exist@test.com',
    password: 'this-is-not-correct',
  });
  expect(status).toBe(401);
  expect(body).toHaveProperty('error');
});
