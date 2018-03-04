import { MongoClient, Db } from 'mongodb';
import { logger } from './logger';

let db: Db = null;

export async function createConnection(url: string): Promise<Db> {
  if (db !== null) {
    return Promise.resolve(db);
  }
  db = await MongoClient.connect(url);
  logger.info(`Connected to MongoDB database "${db.databaseName}"`);
  return db;
}

export function getConnection(): Db {
  return db;
}

export function closeConnection(force: boolean = false): void {
  if (!db || !db.close) {
    return;
  }
  db.close(force);
}
