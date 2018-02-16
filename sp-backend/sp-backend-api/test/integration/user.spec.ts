import { MongoClient, ObjectId } from 'mongodb';
import { COLLECTIONS, EMAIL_TYPES } from '../../src/helpers/constants';
import { TEST } from '../../src/helpers/config';
import { graphqlQuery } from './helpers/request';
import {
  USERS,
  EMAIL_VERIFICATIONS,
  TICKETS,
  COMPANIES,
} from './helpers/fixtures';
import * as nock from 'nock';
import { clearDatabase } from './helpers/db';

let db;

beforeAll(async () => {
  db = await MongoClient.connect(TEST.MONGO_URL);
});

beforeEach(async () => {
  nock.cleanAll();
  await clearDatabase(db);
  await db.collection(COLLECTIONS.USERS).insertMany(USERS);
  await db.collection(COLLECTIONS.TICKETS).insertMany(TICKETS);
  await db.collection(COLLECTIONS.COMPANIES).insertMany(COMPANIES);
  await db
    .collection(COLLECTIONS.EMAIL_VERIFICATIONS)
    .insertMany(EMAIL_VERIFICATIONS);
});

afterAll(async () => {
  await db.close(true);
});

function mockGoogleRecaptcha() {
  nock('https://www.google.com')
    .post('/recaptcha/api/siteverify')
    .reply(200, {
      success: true,
    });
}

it('should fetch details for the current user', async () => {
  const query = `
    {
      me {
        firstName
        lastName
        permissions {
          canCreateNewTickets
        }
      }
    }
  `;
  const operationName = null;
  const variables = {};
  const { status, errors, data } = await graphqlQuery(
    {
      query,
      operationName,
      variables,
    },
    { authorizedUserEmail: 'user1@test.com' }
  );
  expect(errors).toBeFalsy();
  expect(status).toBe(200);
  expect(data).toMatchSnapshot();
});

it('should fetch details for any user', async () => {
  const query = `
    query FetchUserAndTickets($userId: String!) {
      fetchUserAndTickets(id: $userId) {
        user {
          username
          email
        }
        tickets {
          id
          title
        }
      }
    }
  `;
  const operationName = 'FetchUserAndTickets';
  const variables = {
    userId: 'c00000000000000000000001',
  };
  const { status, errors, data } = await graphqlQuery(
    {
      query,
      operationName,
      variables,
    },
    { authorizedUserEmail: 'admin1@test.com' }
  );
  expect(errors).toBeFalsy();
  expect(status).toBe(200);
  expect(data).toMatchSnapshot();
});

it('should company fetch details for the current user if a company rep', async () => {
  const query = `
    {
      me {
        firstName
        lastName
        companyId
        companySlug
        companyName
      }
    }
  `;
  const operationName = null;
  const variables = {};
  const { status, data } = await graphqlQuery(
    {
      query,
      operationName,
      variables,
    },
    { authorizedUserEmail: 'company-employee@verizon.com' }
  );
  expect(status).toBe(200);
  expect(data).toMatchSnapshot();
});

it('should return null for the current user if the viewer is not logged in', async () => {
  const query = `
    {
      me {
        firstName
        lastName
      }
    }
  `;
  const operationName = null;
  const variables = {};
  const { status, data } = await graphqlQuery({
    query,
    operationName,
    variables,
  });
  expect(status).toBe(200);
  expect(data.me).toBeFalsy();
});

it('should allow a public user to create a new user account', async () => {
  mockGoogleRecaptcha();
  const query = `
    mutation CreateAccount($input: CreateAccountInput!) {
      createAccount(input: $input) {
        user {
          email
          permissions {
            canCreateNewTickets,
            canCommentOnTickets,
            canVoteOnTickets
          }
        }
        jwt
      }
    }
  `;
  const operationName = 'CreateAccount';
  const variables = {
    input: {
      token: 'anything',
      user: {
        username: 'michaelcox',
        firstName: 'Michael',
        lastName: 'Cox',
        email: 'mcox@test.com',
        password: 'testing123',
      },
    },
  };
  const { status, data } = await graphqlQuery({
    query,
    operationName,
    variables,
  });
  expect(status).toBe(200);
  expect(data.createAccount.user).toMatchSnapshot();
  expect(data.createAccount).toHaveProperty('jwt');
  expect(data.createAccount.jwt.length).toBeGreaterThan(100);

  // Double check we're storing passwords in MongoDB correctly
  const newUser = await db
    .collection(COLLECTIONS.USERS)
    .findOne({ email: 'mcox@test.com' });
  expect(newUser).not.toHaveProperty('password');
  expect(newUser).toHaveProperty('passwordHash');
  expect(newUser.passwordHash.length).toBeGreaterThan(20);
});

it('should return an error if the selected username is already taken', async () => {
  mockGoogleRecaptcha();
  const query = `
    mutation CreateAccount($input: CreateAccountInput!) {
      createAccount(input: $input) {
        user {
          username
          email
        }
        jwt
      }
    }
  `;
  const operationName = 'CreateAccount';
  const variables = {
    input: {
      token: 'anything',
      user: {
        username: 'user1',
        firstName: 'Michael',
        lastName: 'Cox',
        email: 'mcox@test.com',
        password: 'testing123',
      },
    },
  };
  const { status, data, errors } = await graphqlQuery({
    query,
    operationName,
    variables,
  });
  expect(status).toBe(200);
  expect(data).toHaveProperty('createAccount', null);
  expect(errors).toMatchSnapshot();
});

it('should return an error if the selected email is already taken', async () => {
  mockGoogleRecaptcha();
  const query = `
    mutation CreateAccount($input: CreateAccountInput!) {
      createAccount(input: $input) {
        user {
          username
          email
        }
        jwt
      }
    }
  `;
  const operationName = 'CreateAccount';
  const variables = {
    input: {
      token: 'anything',
      user: {
        username: 'michaelcox',
        firstName: 'Michael',
        lastName: 'Cox',
        email: 'user1@test.com',
        password: 'testing123',
      },
    },
  };
  const { status, data, errors } = await graphqlQuery({
    query,
    operationName,
    variables,
  });
  expect(status).toBe(200);
  expect(data).toHaveProperty('createAccount', null);
  expect(errors).toMatchSnapshot();
});

it('should throw an error if a logged in user tries to create a new account', async () => {
  mockGoogleRecaptcha();
  const query = `
    mutation CreateAccount($input: CreateAccountInput!) {
      createAccount(input: $input) {
        user {
          email
        }
        jwt
      }
    }
  `;
  const operationName = 'CreateAccount';
  const variables = {
    input: {
      token: 'anything',
      user: {
        username: 'michaelcox',
        firstName: 'Michael',
        lastName: 'Cox',
        email: 'mcox@test.com',
        password: 'testing123',
      },
    },
  };
  const { status, data, errors } = await graphqlQuery(
    {
      query,
      operationName,
      variables,
    },
    { authorizedUserEmail: 'user1@test.com' }
  );
  expect(status).toBe(200);
  expect(errors).toMatchSnapshot();
  expect(data.createAccount).toBe(null);
});

it('should verify the email address of the user with a valid code', async () => {
  const query = `
    mutation VerifyEmailAddress($input: VerifyEmailInput!) {
      verifyEmailAddress(input: $input) {
        success,
      }
    }
  `;
  const operationName = 'VerifyEmailAddress';
  const variables = {
    input: {
      code: 'ab1234',
    },
  };
  const { status, data, errors } = await graphqlQuery(
    {
      query,
      operationName,
      variables,
    },
    { authorizedUserEmail: 'user1@test.com' }
  );
  expect(status).toBe(200);
  expect(data.verifyEmailAddress.success).toBe(true);
  expect(errors).toBeFalsy();

  const emailVerifications = await db
    .collection(COLLECTIONS.EMAIL_VERIFICATIONS)
    .find({
      type: EMAIL_TYPES.EMAIL_ADDRESS_VERIFICATION,
    })
    .toArray();
  expect(emailVerifications).toHaveLength(0);

  const user = await db
    .collection(COLLECTIONS.USERS)
    .findOne({ _id: ObjectId.createFromHexString('c00000000000000000000001') });
  expect(user).toHaveProperty('emailVerifiedDate');
  expect(user.emailVerifiedDate).toBeTruthy();
});

it('should not verify the email address of the user with a valid code', async () => {
  const query = `
    mutation VerifyEmailAddress($input: VerifyEmailInput!) {
      verifyEmailAddress(input: $input) {
        success,
      }
    }
  `;
  const operationName = 'VerifyEmailAddress';
  const variables = {
    input: {
      code: 'this-is-the-wrong-code',
    },
  };
  const { status, data, errors } = await graphqlQuery(
    {
      query,
      operationName,
      variables,
    },
    { authorizedUserEmail: 'user1@test.com' }
  );
  expect(status).toBe(200);
  expect(data.verifyEmailAddress).toBeFalsy();
  expect(errors).toHaveLength(1);
  expect(errors).toMatchSnapshot();

  const emailVerifications = await db
    .collection(COLLECTIONS.EMAIL_VERIFICATIONS)
    .find({
      type: EMAIL_TYPES.EMAIL_ADDRESS_VERIFICATION,
    })
    .toArray();
  expect(emailVerifications).toHaveLength(1);

  const user = await db
    .collection(COLLECTIONS.USERS)
    .findOne({ _id: ObjectId.createFromHexString('c00000000000000000000001') });
  expect(user.emailVerifiedDate).toBeFalsy();
});

it('should send a forgot password notification', async () => {
  const query = `
    mutation SendForgotPasswordEmail($input: SendForgotPasswordInput!) {
      sendForgotPasswordEmail(input: $input) {
        success,
      }
    }
  `;
  const operationName = 'SendForgotPasswordEmail';
  const variables = {
    input: {
      email: 'user2@test.com',
    },
  };
  const { status, data, errors } = await graphqlQuery({
    query,
    operationName,
    variables,
  });

  expect(status).toBe(200);
  expect(data.sendForgotPasswordEmail.success).toBe(true);
  expect(errors).toBeFalsy();

  const emailVerifications = await db
    .collection(COLLECTIONS.EMAIL_VERIFICATIONS)
    .find({
      userId: ObjectId.createFromHexString('c00000000000000000000002'),
      type: EMAIL_TYPES.FORGOT_PASSWORD,
    })
    .toArray();
  expect(emailVerifications).toHaveLength(1);
  expect(emailVerifications[0]).toHaveProperty('code');
  expect(emailVerifications[0].code).toHaveLength(36);
  expect(emailVerifications[0]).toHaveProperty('createdDate');
});

it('should allow resetting a password with a valid code', async () => {
  const query = `
    mutation ResetPassword($input: ResetPasswordInput!) {
      resetPassword(input: $input) {
        user {
          id
          email
        }
        jwt
      }
    }
  `;
  const operationName = 'ResetPassword';
  const variables = {
    input: {
      email: 'user1@test.com',
      code: 'ab1234',
      password: 'this-is-my-new-password',
    },
  };
  const { status, errors, data } = await graphqlQuery({
    query,
    operationName,
    variables,
  });

  expect(errors).toBeFalsy();
  expect(status).toBe(200);

  expect(data.resetPassword).toHaveProperty('user');
  expect(data.resetPassword.user).toBeTruthy();
  expect(data.resetPassword).toHaveProperty('jwt');
  expect(data.resetPassword.jwt).toBeTruthy();

  const emailVerifications = await db
    .collection(COLLECTIONS.EMAIL_VERIFICATIONS)
    .find({
      type: EMAIL_TYPES.FORGOT_PASSWORD,
    })
    .toArray();
  expect(emailVerifications).toHaveLength(0);
});

it('should allow resetting the password of a logged in user', async () => {
  const query = `
    mutation ResetPassword($input: ResetPasswordInput!) {
      resetPassword(input: $input) {
        user {
          id
          email
        }
        jwt
      }
    }
  `;
  const operationName = 'ResetPassword';
  const variables = {
    input: {
      email: 'user1@test.com',
      password: 'this-is-my-new-password',
    },
  };
  const { status, data } = await graphqlQuery(
    {
      query,
      operationName,
      variables,
    },
    { authorizedUserEmail: 'user1@test.com' }
  );

  expect(status).toBe(200);

  expect(data.resetPassword).toHaveProperty('user');
  expect(data.resetPassword.user).toBeTruthy();
  expect(data.resetPassword).toHaveProperty('jwt');
  expect(data.resetPassword.jwt).toBeTruthy();
});

it('should allow resetting a password with a valid case insensitive code', async () => {
  const query = `
    mutation ResetPassword($input: ResetPasswordInput!) {
      resetPassword(input: $input) {
        user {
          id
          email
        }
        jwt
      }
    }
  `;
  const operationName = 'ResetPassword';
  const variables = {
    input: {
      email: 'user1@test.com',
      code: 'AB1234',
      password: 'this-is-my-new-password',
    },
  };
  const { status, errors, data } = await graphqlQuery({
    query,
    operationName,
    variables,
  });

  expect(errors).toBeFalsy();
  expect(status).toBe(200);

  expect(data.resetPassword).toHaveProperty('user');
  expect(data.resetPassword.user).toBeTruthy();
  expect(data.resetPassword).toHaveProperty('jwt');
  expect(data.resetPassword.jwt).toBeTruthy();

  const emailVerifications = await db
    .collection(COLLECTIONS.EMAIL_VERIFICATIONS)
    .find({
      type: EMAIL_TYPES.FORGOT_PASSWORD,
    })
    .toArray();
  expect(emailVerifications).toHaveLength(0);
});

it('should allow updating the profile information for a logged in user', async () => {
  const query = `
    mutation UpdateMyProfile($input: UpdateMyProfileInput!) {
      updateMyProfile(input: $input) {
        id
        email
        firstName
        lastName
      }
    }
  `;
  const operationName = 'UpdateMyProfile';
  const variables = {
    input: {
      firstName: 'John',
      lastName: 'Doe',
    },
  };
  const { status, errors, data } = await graphqlQuery(
    {
      query,
      operationName,
      variables,
    },
    { authorizedUserEmail: 'user1@test.com' }
  );

  expect(errors).toBeFalsy();
  expect(status).toBe(200);

  expect(data.updateMyProfile).toHaveProperty('email', 'user1@test.com');
  expect(data.updateMyProfile).toHaveProperty('firstName', 'John');
  expect(data.updateMyProfile).toHaveProperty('lastName', 'Doe');
});

it('should send an SNS to send an email to a company employee with a bypass login', async () => {
  const query = `
    mutation SendCompanyAuthEmail($input: SendCompanyAuthEmailInput!) {
      sendCompanyAuthEmail(input: $input) {
        success,
      }
    }
  `;
  const operationName = 'SendCompanyAuthEmail';
  const variables = {
    input: {
      companyId: 'b00000000000000000000001',
      username: 'John Smith Verizion',
      email: 'john.smith@verizon.net',
    },
  };
  const { status, data, errors } = await graphqlQuery({
    query,
    operationName,
    variables,
  });

  expect(status).toBe(200);

  expect(errors).toBeFalsy();
  expect(data.sendCompanyAuthEmail.success).toBe(true);

  const emailVerifications = await db
    .collection(COLLECTIONS.EMAIL_VERIFICATIONS)
    .find({
      type: EMAIL_TYPES.COMPANY_SUPPORT_VERIFICATION,
    })
    .toArray();

  expect(emailVerifications).toHaveLength(1);
  expect(emailVerifications[0]).toHaveProperty('code');
  expect(emailVerifications[0].code).toHaveLength(5);
  expect(emailVerifications[0].companyId.toString()).toBe(
    'b00000000000000000000001'
  );
  expect(emailVerifications[0].username).toBe('John Smith Verizion');
});

it('should authenticate a company employee with a JWT', async () => {
  // Create a valid code in our database
  await db.collection(COLLECTIONS.EMAIL_VERIFICATIONS).insertOne({
    code: 'ab1234',
    type: EMAIL_TYPES.COMPANY_SUPPORT_VERIFICATION,
    companyId: ObjectId.createFromHexString('b00000000000000000000001'),
    companySlug: 't-mobile',
    username: 'John Smith',
  });

  const query = `
    mutation AuthenticateCompanyEmployee($input: AuthenticateCompanyEmployeeInput!) {
      authenticateCompanyEmployee(input: $input) {
        user {
          id
          username
          companyId
          companyName
          companySlug
        }
        jwt
      }
    }
  `;
  const operationName = 'AuthenticateCompanyEmployee';
  const variables = {
    input: {
      companySlug: 't-mobile',
      code: 'ab1234',
    },
  };
  const { status, data, errors } = await graphqlQuery({
    query,
    operationName,
    variables,
  });
  expect(errors).toBeFalsy();
  expect(status).toBe(200);
  expect(data.authenticateCompanyEmployee.user.username).toBe('John Smith');
  expect(data.authenticateCompanyEmployee.jwt).toBeTruthy();
  expect(data.authenticateCompanyEmployee.user.companyName).toBe('T-Mobile');
});

it('should allow an admin to search for users', async () => {
  const query = `
    query SearchUsers($searchTerm: String!) {
      searchUsers(searchTerm: $searchTerm) {
        users {
          id
          email
        }
      }
    }
  `;
  const operationName = 'SearchUsers';
  const variables = {
    searchTerm: 'user',
  };
  const { status, data, errors } = await graphqlQuery(
    {
      query,
      operationName,
      variables,
    },
    { authorizedUserEmail: 'admin1@test.com' }
  );

  expect(errors).toBeNull();
  expect(status).toBe(200);
  expect(data).toMatchSnapshot();
});

it('should allow unsubscribing from emails easily', async () => {
  const query = `
    mutation Unsubscribe($userId: String!) {
      unsubscribe(userId: $userId) {
        success
      }
    }
  `;
  const operationName = 'Unsubscribe';
  const variables = {
    userId: 'c00000000000000000000005',
  };
  const { status, data, errors } = await graphqlQuery({
    query,
    operationName,
    variables,
  });

  expect(errors).toBeNull();
  expect(status).toBe(200);
  expect(data).toMatchSnapshot();
});
