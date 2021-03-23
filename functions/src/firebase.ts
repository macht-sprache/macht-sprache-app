import * as admin from 'firebase-admin';
import * as firebaseFunctions from 'firebase-functions';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { DocReference } from '../../src/types';
import config from './config';

const app = admin.initializeApp();
const auth = admin.auth(app);
const db = admin.firestore(app);
db.settings({ ignoreUndefinedProperties: true });

const functions = firebaseFunctions.region(config.functions.region);
const { logger } = firebaseFunctions;
const { HttpsError } = firebaseFunctions.https;

export { auth, db, functions, logger, HttpsError };

export const convertRef = <T>(ref: admin.firestore.DocumentReference) => (ref as unknown) as DocReference<T>;

export const verifyUser = (context: CallableContext) => {
    if (!context.auth?.uid || !context.auth?.token.email_verified) {
        throw new HttpsError('unauthenticated', 'User is not verified.');
    }
    return context.auth.uid;
};

export type WithoutId<T> = Omit<T, 'id'>;
