import * as UserService from './user.service';

// Queries

const fetchMyProfile = (root, args, { viewer }: Context) => UserService.fetchMyProfile(viewer);

const searchUsers = (root, { searchTerm }, { viewer }: Context) => UserService.searchUsers(viewer, searchTerm);

const fetchUserAndTickets = (root, { id }, { viewer }: Context) => UserService.fetchUserAndTickets(viewer, id);

// Mutations

const updateMyProfile = (root, { input }, { viewer }: Context) => UserService.updateProfile(viewer, input);

const createAccount = (root, { input }, { viewer }: Context) => UserService.createAccount(viewer, input);

const verifyEmailAddress = (root, { input }, { viewer }: Context) => UserService.verifyEmailAddress(viewer, input);

const sendForgotPasswordEmail = (root, { input }, { viewer }: Context) => UserService.sendForgotPasswordEmail(viewer, input);

const resetPassword = (root, { input }, { viewer }: Context) => UserService.resetPassword(viewer, input);

const sendCompanyAuthEmail = (root, { input }, { viewer }: Context) => UserService.sendCompanyAuthEmail(viewer, input);

const authenticateCompanyEmployee = (root, { input }, { viewer }: Context) => UserService.authenticateCompanyEmployee(viewer, input);

const unsubscribe = (root, { userId }, { viewer }: Context) => UserService.unsubscribe(viewer, userId);

export default {
  Query: {
    me: fetchMyProfile,
    searchUsers,
    fetchUserAndTickets
  },
  Mutation: {
    updateMyProfile,
    createAccount,
    verifyEmailAddress,
    sendForgotPasswordEmail,
    resetPassword,
    sendCompanyAuthEmail,
    authenticateCompanyEmployee,
    unsubscribe
  }
};
