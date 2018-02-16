import { Db } from 'mongodb';
import { COLLECTIONS } from '../../../src/helpers/constants';

export async function clearDatabase(db: Db) {
  await db.collection(COLLECTIONS.COMPANIES).remove({});
  await db.collection(COLLECTIONS.EMAIL_VERIFICATIONS).remove({});
  await db.collection(COLLECTIONS.TICKET_WATCHERS).remove({});
  await db.collection(COLLECTIONS.TICKETS).remove({});
  await db.collection(COLLECTIONS.USERS).remove({});
  await db.collection(COLLECTIONS.VOTES).remove({});
}
