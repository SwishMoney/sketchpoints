import { ObjectId } from 'mongodb';
import { utc } from 'moment';
import * as uuid from 'uuid/v4';
import * as slugify from 'slug';
import { User } from './user.model';
import { COLLECTIONS, CONFIG_KEYS, DEPLOY_STAGES, NODE_ENVIRONMENTS, EMAIL_TYPES } from '../../helpers';
import { getConfigValue } from '../helpers/utils';
import { getConnection as db } from './MongoDB';
import Viewer from '../models/Viewer';
import { generateJWT, encryptPassword, generateCompanyJWT } from './AuthService';
import { notifyUserCreated, notifyRequestForgotPassword, notifyRequestCompanyLogin } from './SnsService';
import { logger } from './LoggerService';
import { fetch as fetchCompany } from './CompanyService';
import { verifyToken } from './RecaptchaService';
import {
  CreateAccountInput,
  CreateAccountResponse,
  SuccessFailResponse,
  VerifyEmailInput,
  SendForgotPasswordInput,
  ResetPasswordInput,
  SendCompanyAuthEmailInput,
  AuthenticateCompanyEmployeeInput,
  UpdateProfileInput
} from '../helpers/interfaces';
import Ticket from '../models/Ticket';

export async function fetchUser(query: Partial<User>): Promise<User> {
  const user = await db()
    .collection(COLLECTIONS.USERS)
    .findOne(query);

  if (!user) {
    return null;
  }
  return new User(user);
}

export async function fetchUsernamesById(userIds: Array<ObjectId>) {
  return await db()
    .collection(COLLECTIONS.USERS)
    .find({ _id: { $in: userIds } }, { _id: 1, username: 1 })
    .toArray();
}

export async function fetchMyProfile(viewer: Viewer): Promise<User> {
  if (viewer.isPublicUser()) {
    return null;
  }
  const user = await fetchUser({ _id: viewer.user._id });
  if (!user) {
    return null;
  }

  // Overlay default permissions
  user.permissions = Object.assign(
    {
      canCreateNewTickets: false,
      canCommentOnTickets: false,
      canVoteOnTickets: false,
      canViewSpam: false,
      canUpdateTickets: false,
      canUpdateCompanies: false,
      canUpdateUsers: false
    },
    user.permissions
  );

  if (viewer.isCompanySupport()) {
    const company = await fetchCompany({ _id: new ObjectId(viewer.companyId) });
    if (!company) {
      return user;
    }
    return Object.assign(user, {
      companyId: company.id,
      companySlug: company.slug,
      companyName: company.name
    });
  } else {
    return user;
  }
}

async function fetchEmailVerification(code: string, emailType: EMAIL_TYPES): Promise<EmailVerification> {
  return await db()
    .collection(COLLECTIONS.EMAIL_VERIFICATIONS)
    .findOne({
      code: code.toLowerCase(),
      type: emailType
    });
}

export async function verifyEmailAddress(viewer: Viewer, input: VerifyEmailInput): Promise<SuccessFailResponse> {
  const verification = await fetchEmailVerification(input.code, EMAIL_TYPES.EMAIL_ADDRESS_VERIFICATION);

  if (!verification) {
    throw new Error('The code provided is not valid');
  }

  const user = await fetchUser({ _id: verification.userId });
  if (!user.emailVerifiedDate) {
    await db()
      .collection(COLLECTIONS.USERS)
      .updateOne(
        {
          _id: verification.userId
        },
        {
          $set: {
            emailVerifiedDate: utc().toISOString()
          }
        }
      );
  }

  await db()
    .collection(COLLECTIONS.EMAIL_VERIFICATIONS)
    .remove({
      _id: verification._id
    });

  return {
    success: true
  };
}

export async function createAccount(viewer: Viewer, input: CreateAccountInput): Promise<CreateAccountResponse> {
  if (viewer.isRegisteredUser()) {
    throw new Error('You cannot register another account since you already have one.');
  }

  // Verify the spam token (skip in e2e tests)
  const STAGE = await getConfigValue('STAGE');
  const NODE_ENV = await getConfigValue('NODE_ENV');
  if (STAGE !== DEPLOY_STAGES.E2E && NODE_ENV === NODE_ENVIRONMENTS.PRODUCTION) {
    const passesSpamCheck = await verifyToken(input.token);
    if (!passesSpamCheck) {
      throw new Error('There was an error completing your request. Please try again.');
    }
  }

  const existingUser: User = await db()
    .collection(COLLECTIONS.USERS)
    .findOne({
      $or: [
        {
          email: input.user.email
        },
        {
          username: input.user.username
        }
      ]
    });

  if (existingUser && existingUser.email === input.user.email) {
    throw new Error('Your account is already registered.');
  } else if (existingUser && existingUser.username === input.user.username) {
    throw new Error('This username is already taken. Please select another one.');
  }

  const hashedPassword = await encryptPassword(input.user.password);
  const user = {
    ...input.user,
    username: slugify(input.user.username),
    permissions: {
      canCreateNewTickets: true,
      canCommentOnTickets: true,
      canVoteOnTickets: true
    },
    createdDate: utc().toISOString()
  } as any;
  delete user.password;
  user.passwordHash = hashedPassword;

  const result = await db()
    .collection(COLLECTIONS.USERS)
    .insertOne(user);

  if (!result || !result.insertedCount) {
    throw new Error('There was an error creating the user account');
  }

  // Send an SNS Notification that a new user has been created
  await notifyUserCreated(result.insertedId);

  const newUser = new User(result.ops[0]);
  const jwt = await generateJWT(await getConfigValue(CONFIG_KEYS.JWT_SECRET), newUser);

  return {
    user: newUser,
    jwt
  };
}

export async function sendForgotPasswordEmail(viewer: Viewer, input: SendForgotPasswordInput): Promise<SuccessFailResponse> {
  const user = await fetchUser({ email: input.email });

  if (!user) {
    logger().log('error', 'An invalid email address was used', {
      email: input.email
    });
    // Returning true here so people can't scan for active emails
    return {
      success: true
    };
  }

  // See if there is an existing forgot password record
  const emailVerification = await db()
    .collection(COLLECTIONS.EMAIL_VERIFICATIONS)
    .findOne({
      type: EMAIL_TYPES.FORGOT_PASSWORD,
      userId: user._id
    });

  // Don't resend the email
  if (emailVerification) {
    return {
      success: true
    };
  }

  // Generate and save a new code
  const code = uuid().toLowerCase();

  const verificationRes = await db()
    .collection(COLLECTIONS.EMAIL_VERIFICATIONS)
    .insertOne({
      type: EMAIL_TYPES.FORGOT_PASSWORD,
      code,
      userId: user._id,
      createdDate: utc().toISOString()
    });

  if (!verificationRes.result.ok) {
    throw new Error('There was an error while sending the email');
  }

  await notifyRequestForgotPassword(user._id);

  return {
    success: true
  };
}

export async function updateProfile(viewer: Viewer, input: UpdateProfileInput): Promise<User> {
  if (!viewer.isRegisteredUser()) {
    throw new Error('You do not have permission to update your profile');
  }

  const update: any = {};
  if (input.email) {
    update.email = input.email;
  }
  if (input.firstName) {
    update.firstName = input.firstName;
  }
  if (input.lastName) {
    update.lastName = input.lastName;
  }
  if (!Object.keys(update).length) {
    throw new Error('You must specify a valid value to update your profile');
  }

  const updateUser = await db()
    .collection(COLLECTIONS.USERS)
    .findOneAndUpdate(
      {
        _id: viewer.user._id
      },
      {
        $set: update
      },
      {
        returnOriginal: false
      }
    );

  if (!updateUser.ok) {
    throw new Error('There was an error while updating your profile');
  }
  return new User(updateUser.value);
}

export async function resetPassword(viewer: Viewer, input: ResetPasswordInput): Promise<CreateAccountResponse> {
  let userId;
  let emailVerification;
  if (viewer.isPublicUser()) {
    if (!input.code) {
      throw new Error('You must provide a valid code to reset your password');
    }

    // Lookup the code in the database to verify it
    emailVerification = await db()
      .collection(COLLECTIONS.EMAIL_VERIFICATIONS)
      .findOne({
        code: input.code.toLowerCase(),
        type: EMAIL_TYPES.FORGOT_PASSWORD
      });

    if (!emailVerification) {
      throw new Error('Invalid code provided');
    }
    userId = emailVerification.userId;
  } else if (viewer.isRegisteredUser()) {
    userId = viewer.user && viewer.user._id;
  }

  if (!userId) {
    throw new Error('You are not allowed to reset your password');
  }

  // Update the user's password
  const passwordHash = await encryptPassword(input.password);
  const updateUserRes = await db()
    .collection(COLLECTIONS.USERS)
    .findOneAndUpdate(
      {
        _id: userId
      },
      {
        $set: {
          passwordHash
        }
      },
      {
        returnOriginal: false
      }
    );

  if (!updateUserRes.ok) {
    throw new Error('There was an error updating the password');
  }

  // Remove the temporary code
  if (emailVerification) {
    await db()
      .collection(COLLECTIONS.EMAIL_VERIFICATIONS)
      .remove({
        _id: emailVerification._id
      });
  }

  const user = new User(updateUserRes.value);
  const jwt = await generateJWT(await getConfigValue(CONFIG_KEYS.JWT_SECRET), user);
  return {
    user,
    jwt
  };
}

export async function sendCompanyAuthEmail(viewer: Viewer, input: SendCompanyAuthEmailInput): Promise<SuccessFailResponse> {
  // Look up the associated Company
  const companyData = await db()
    .collection(COLLECTIONS.COMPANIES)
    .findOne({
      _id: ObjectId.createFromHexString(input.companyId)
    });
  if (!companyData) {
    throw new Error('Unable to find the verified company');
  }
  const company = new Company(companyData);

  // Confirm that the email address matches a known domain
  const companyDomains = company.domainAliases.concat([company.domain]);
  const emailDomain = input.email.substr(input.email.indexOf('@') + 1);
  const isEmailValid = companyDomains.length && companyDomains.some(d => d === emailDomain);

  if (!isEmailValid) {
    throw new Error('The email address you entered is not a verified domain of the company');
  }

  // Generate and save a new code
  const code = uuid()
    .substring(0, 5)
    .toLowerCase();

  const verificationRes = await db()
    .collection(COLLECTIONS.EMAIL_VERIFICATIONS)
    .insertOne({
      type: EMAIL_TYPES.COMPANY_SUPPORT_VERIFICATION,
      companyId: company._id,
      companySlug: company.slug,
      username: input.username,
      code,
      email: input.email,
      createdDate: utc().toISOString()
    });

  if (!verificationRes.result.ok) {
    throw new Error('There was an error while generating the authentication code');
  }

  await notifyRequestCompanyLogin(company._id, input.username, input.email);

  return {
    success: true
  };
}

export async function authenticateCompanyEmployee(viewer: Viewer, input: AuthenticateCompanyEmployeeInput): Promise<CreateAccountResponse> {
  if (viewer.isRegisteredUser()) {
    throw new Error('You must logout first before trying to authenticate as a company representative');
  }

  // Authenticate the code they've provided
  const verification = await db()
    .collection(COLLECTIONS.EMAIL_VERIFICATIONS)
    .findOne({
      code: input.code.toLowerCase(),
      companySlug: input.companySlug,
      type: EMAIL_TYPES.COMPANY_SUPPORT_VERIFICATION
    });

  if (!verification) {
    logger().log('warn', 'An invalid code was used to attempt to login as an employee', input);
    throw new Error('The code you provided is not valid');
  }

  // Look up the associated Company
  const companyData = await db()
    .collection(COLLECTIONS.COMPANIES)
    .findOne({
      slug: input.companySlug
    });
  if (!companyData) {
    throw new Error('Unable to find the verified company');
  }
  const company = new Company(companyData);

  // Look up the associated user, if they already have an account
  let user = await fetchUser({ email: verification.email });
  if (!user) {
    // User doesn't exist, create a new one
    const addUserRes = await db()
      .collection(COLLECTIONS.USERS)
      .insertOne({
        username: verification.username,
        email: verification.email,
        companyId: company._id,
        createdDate: utc().toISOString()
      });

    if (!addUserRes || !addUserRes.insertedCount) {
      throw new Error('There was an error creating the user account');
    }
    user = new User(addUserRes.ops[0]);
  }

  const jwt = await generateCompanyJWT(await getConfigValue(CONFIG_KEYS.JWT_SECRET), company.id, user);

  return {
    user: Object.assign(user, {
      companySlug: company.slug,
      companyName: company.name
    }),
    jwt
  };
}

export async function searchUsers(viewer: Viewer, searchTerm: string) {
  // const hasPermissions =
  //   viewer.isRegisteredUser() &&
  //   viewer.user.permissions.canUpdateUsers === true;
  // if (hasPermissions !== true) {
  //   throw new Error('You do not have permission to view user details');
  // }

  const users = await db()
    .collection(COLLECTIONS.USERS)
    .find({
      $or: [
        {
          username: new RegExp(`.*${searchTerm}.*`, 'gi')
        },
        {
          email: new RegExp(`.*${searchTerm}.*`, 'gi')
        }
      ]
    })
    .limit(20)
    .toArray();

  return {
    users: users && users.map(u => new User(u))
  };
}

export async function fetchUserAndTickets(viewer: Viewer, id: string) {
  const hasPermissions = viewer.isRegisteredUser() && viewer.user.permissions.canUpdateUsers === true;

  if (hasPermissions !== true) {
    throw new Error('You do not have permission to view user details');
  }

  const user = await fetchUser({
    _id: new ObjectId(id)
  });

  if (!user) {
    throw new Error('Cannot find the user');
  }

  const tickets = await db()
    .collection(COLLECTIONS.TICKETS)
    .find({
      createdUserId: user._id
    })
    .toArray();

  return {
    user: new User(user),
    tickets: tickets.map(t => new Ticket(t))
  };
}

export async function unsubscribe(viewer: Viewer, userId: string): Promise<SuccessFailResponse> {
  const userIdToUpdate = viewer.isRegisteredUser() ? viewer.user._id : new ObjectId(userId);

  const userRes = await db()
    .collection(COLLECTIONS.USERS)
    .updateOne(
      {
        _id: userIdToUpdate
      },
      {
        $set: {
          unsubscribe: true
        }
      }
    );

  return {
    success: userRes.modifiedCount === 1
  };
}
