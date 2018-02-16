import { ObjectId } from 'mongodb';
import {
  TICKET_STATUSES,
  EMAIL_TYPES,
  COMMENT_STATUSES,
} from '../../../src/helpers/constants';
import Ticket from '../../../src/models/Ticket';
import User from '../../../src/models/User';
import Company from '../../../src/models/Company';
import Comment from '../../../src/models/Comment';
import Attachment from '../../../src/models/Attachment';
import EmailVerification from '../../../src/models/EmailVerification';

export const TICKETS = [
  new Ticket({
    _id: ObjectId.createFromHexString('a00000000000000000000001'),
    slug: 'test-ticket-1',
    slugUid: '1',
    shortUrl: 'short-1',
    url: 'verizon.net',
    companyId: ObjectId.createFromHexString('b00000000000000000000001'),
    companySlug: 'verizon',
    title: 'Test Ticket 1',
    createdDate: '2013-02-04T22:44:30.652Z',
    createdUserId: ObjectId.createFromHexString('c00000000000000000000001'),
    createdUsername: 'user1',
    publicBody: 'Test Ticket 1 Public Body',
    privateBody: 'Test Ticket 1 Private Body',
    status: TICKET_STATUSES.OPEN,
    voteTally: 0,
    attachments: [
      new Attachment({
        _id: ObjectId.createFromHexString('e00000000000000000000001'),
        fileName: 'abc.jpg',
        isPrivate: false,
        createdUserId: ObjectId.createFromHexString('c00000000000000000000001'),
        createdDate: '2013-02-04T22:44:30.652Z',
      }),
      new Attachment({
        _id: ObjectId.createFromHexString('e00000000000000000000002'),
        fileName: 'def.jpg',
        isPrivate: true,
        createdUserId: ObjectId.createFromHexString('c00000000000000000000001'),
        createdDate: '2013-02-04T22:44:30.652Z',
      }),
    ],
    comments: [
      new Comment({
        _id: ObjectId.createFromHexString('d00000000000000000000001'),
        publicBody: 'Ticket 1 Comment 1 - Public',
        isAcceptedAnswer: false,
        createdUserId: ObjectId.createFromHexString('c00000000000000000000002'),
        createdUsername: 'user2',
        status: COMMENT_STATUSES.OPEN,
      }),
      new Comment({
        _id: ObjectId.createFromHexString('d00000000000000000000002'),
        publicBody: 'Ticket 1 Comment 2 - Public',
        privateBody: 'Ticket 1 Comment 2 - Private',
        isAcceptedAnswer: false,
        createdUserId: ObjectId.createFromHexString('c00000000000000000000001'),
        createdUsername: 'user1',
        status: COMMENT_STATUSES.OPEN,
      }),
    ],
  }),
  new Ticket({
    _id: ObjectId.createFromHexString('a00000000000000000000002'),
    slug: 'test-ticket-2',
    slugUid: '2',
    shortUrl: '2',
    url: 'tmobile.net',
    companyId: ObjectId.createFromHexString('b00000000000000000000002'),
    companySlug: 't-mobile',
    title: 'Test Ticket 2',
    createdDate: '2013-02-04T22:44:30.652Z',
    createdUserId: ObjectId.createFromHexString('c00000000000000000000002'),
    createdUsername: 'user2',
    publicBody: 'Test Ticket 2 Public Body',
    privateBody: 'Test Ticket 2 Private Body',
    status: TICKET_STATUSES.OPEN,
    voteTally: 0,
    comments: [
      new Comment({
        _id: ObjectId.createFromHexString('d00000000000000000000005'),
        publicBody: 'Ticket 2 Comment 1 - Public',
        privateBody: 'Ticket 2 Comment 1 - Private',
        isAcceptedAnswer: false,
        createdUserId: ObjectId.createFromHexString('c00000000000000000000003'),
        createdUsername: 'user1',
        status: COMMENT_STATUSES.OPEN,
      }),
    ],
  }),
  new Ticket({
    _id: ObjectId.createFromHexString('a00000000000000000000003'),
    slug: 'test-ticket-3',
    slugUid: '3',
    shortUrl: '3',
    url: 'tmobile.net',
    companyId: ObjectId.createFromHexString('b00000000000000000000002'),
    companySlug: 't-mobile',
    title: 'Test Ticket 3',
    createdDate: '2013-02-04T22:44:30.652Z',
    createdUserId: ObjectId.createFromHexString('c00000000000000000000002'),
    createdUsername: 'user2',
    publicBody: 'Test Ticket 3 Public Body',
    privateBody: 'Test Ticket 3 Private Body',
    status: TICKET_STATUSES.NEW,
    voteTally: 0,
    comments: [
      new Comment({
        _id: ObjectId.createFromHexString('d00000000000000000000005'),
        publicBody: 'Ticket 2 Comment 1 - Public',
        privateBody: 'Ticket 2 Comment 1 - Private',
        isAcceptedAnswer: false,
        createdUserId: ObjectId.createFromHexString('c00000000000000000000002'),
        createdUsername: 'user1',
        status: COMMENT_STATUSES.NEW,
      }),
    ],
  }),
];

export const USERS = [
  new User({
    _id: ObjectId.createFromHexString('c00000000000000000000001'),
    username: 'user1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'user1@test.com',
    passwordHash:
      '$2a$04$MddJP1CTDo4JelgcO37FL.ANoTsJ7nvq6pW1Rq5mvVIBpFub99vM6', // "test"
    permissions: {
      canCreateNewTickets: true,
      canCommentOnTickets: true,
      canVoteOnTickets: true,
    },
  }),
  new User({
    _id: ObjectId.createFromHexString('c00000000000000000000002'),
    username: 'user2',
    firstName: 'Mary',
    lastName: 'Jones',
    email: 'user2@test.com',
    passwordHash:
      '$2a$04$MddJP1CTDo4JelgcO37FL.ANoTsJ7nvq6pW1Rq5mvVIBpFub99vM6', // "test"
    permissions: {
      canCreateNewTickets: true,
      canCommentOnTickets: true,
      canVoteOnTickets: true,
    },
  }),
  new User({
    _id: ObjectId.createFromHexString('c00000000000000000000003'),
    username: 'verizon-employee',
    email: 'company-employee@verizon.com',
    companyId: ObjectId.createFromHexString('b00000000000000000000001'),
    permissions: {
      canCreateNewTickets: false,
      canCommentOnTickets: true,
      canVoteOnTickets: true,
    },
  }),
  new User({
    _id: ObjectId.createFromHexString('c00000000000000000000004'),
    username: 'admin1',
    firstName: 'Some',
    lastName: 'Admin',
    email: 'admin1@test.com',
    passwordHash:
      '$2a$04$MddJP1CTDo4JelgcO37FL.ANoTsJ7nvq6pW1Rq5mvVIBpFub99vM6', // "test"
    permissions: {
      canCreateNewTickets: true,
      canCommentOnTickets: true,
      canVoteOnTickets: true,
      canViewSpam: true,
      canUpdateCompanies: true,
      canUpdateTickets: true,
      canUpdateUsers: true,
    },
  }),
  new User({
    _id: ObjectId.createFromHexString('c00000000000000000000005'),
    username: 'user5',
    firstName: 'Spam',
    lastName: 'Bot',
    email: 'user5@test.com',
    passwordHash:
      '$2a$04$MddJP1CTDo4JelgcO37FL.ANoTsJ7nvq6pW1Rq5mvVIBpFub99vM6', // "test"
    permissions: {
      canCreateNewTickets: false,
      canCommentOnTickets: false,
      canVoteOnTickets: false,
    },
  }),
];

export const COMPANIES = [
  new Company({
    _id: ObjectId.createFromHexString('b00000000000000000000001'),
    slug: 'verizon',
    domain: 'verizon.com',
    domainAliases: ['verizon.net'],
    name: 'Verizon',
    createdDate: '2013-02-04T22:44:30.652Z',
  }),
  new Company({
    _id: ObjectId.createFromHexString('b00000000000000000000002'),
    slug: 't-mobile',
    domain: 't-mobile.com',
    domainAliases: ['t-mobile.net', 'tmobile.com'],
    name: 'T-Mobile',
    createdDate: '2013-02-04T22:44:30.652Z',
  }),
  new Company({
    _id: ObjectId.createFromHexString('b00000000000000000000003'),
    slug: 'att',
    domain: 'att.com',
    domainAliases: ['att.net'],
    name: 'AT&T',
    createdDate: '2013-02-04T22:44:30.652Z',
  }),
];

export const EMAIL_VERIFICATIONS = [
  new EmailVerification({
    userId: ObjectId.createFromHexString('c00000000000000000000001'),
    type: EMAIL_TYPES.EMAIL_ADDRESS_VERIFICATION,
    code: 'ab1234',
  }),
  new EmailVerification({
    userId: ObjectId.createFromHexString('c00000000000000000000001'),
    type: EMAIL_TYPES.FORGOT_PASSWORD,
    code: 'ab1234',
  }),
];
