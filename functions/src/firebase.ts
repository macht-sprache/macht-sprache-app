import * as admin from 'firebase-admin';
import * as firebaseFunctions from 'firebase-functions';
import { DocReference } from '../../src/types';
import config from './config';

const app = admin.initializeApp();
const db = admin.firestore(app);
db.settings({ ignoreUndefinedProperties: true });

const functions = firebaseFunctions.region(config.functions.region);
const { logger } = firebaseFunctions;

export { db, functions, logger };

export const convertRef = <T>(ref: admin.firestore.DocumentReference) => (ref as unknown) as DocReference<T>;

export type WithoutId<T> = Omit<T, 'id'>;
