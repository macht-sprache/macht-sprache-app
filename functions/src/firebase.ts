import * as admin from 'firebase-admin';
import * as firebaseFunctions from 'firebase-functions';
import { DocReference } from '../../src/types';

const app = admin.initializeApp();
const db = admin.firestore(app);
db.settings({ ignoreUndefinedProperties: true });

if (!process.env.FIREBASE_FUNCTION_REGION) {
    throw new Error('Env FIREBASE_FUNCTION_REGION is not defined.');
}

const functions = firebaseFunctions.region(process.env.FIREBASE_FUNCTION_REGION);
const { logger } = firebaseFunctions;

export { db, functions, logger };

export const convertRef = <T>(ref: admin.firestore.DocumentReference) => (ref as unknown) as DocReference<T>;

export type WithoutId<T> = Omit<T, 'id'>;
