import * as admin from 'firebase-admin';
import * as firebaseFunctions from 'firebase-functions';

const app = admin.initializeApp();
const db = admin.firestore(app);
db.settings({ ignoreUndefinedProperties: true });

const functions = firebaseFunctions.region('europe-west3');
const { logger } = firebaseFunctions;

export { db, functions, logger };
