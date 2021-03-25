import { DISPLAY_NAME_REGEX } from '../../../src/constants';
import { User, UserProperties } from '../../../src/types';
import { auth, db, functions, HttpsError, logger, verifyUser, WithoutId } from '../firebase';

const verifyAdmin = async (userId: string) => {
    const snap = await db.collection('userProperties').doc(userId).get();
    if (!snap.data()?.admin) {
        throw new HttpsError('permission-denied', 'User is not an admin');
    }
};

export const postRegistrationHandler = functions.https.onCall(
    async ({ displayName }: { displayName: string }, context) => {
        if (!context.auth) {
            throw new HttpsError('unauthenticated', 'User not logged in');
        }

        if (!DISPLAY_NAME_REGEX.test(displayName)) {
            throw new HttpsError('invalid-argument', `Invalid displayName ${displayName}`);
        }

        const userId = context.auth.uid;
        const tokenTime = new Date(context.auth.token.auth_time).toISOString();

        await db.runTransaction(async t => {
            const usersWithDisplayNameSnap = await t.get(
                db.collection('users').where('displayName', '==', displayName)
            );

            if (usersWithDisplayNameSnap.size) {
                throw new HttpsError('already-exists', `Name ${displayName} is already in use.`);
            }

            const userRef = db.collection('users').doc(userId);
            const userPropertiesRef = db.collection('userProperties').doc(userId);
            const userSnap = await t.get(userRef);

            if (userSnap.exists) {
                throw new HttpsError('already-exists', `User ${userId} already exists`);
            }

            const user: WithoutId<User> = {
                displayName,
            };

            const userProperties: UserProperties = {
                admin: false,
                enabled: true,
                tokenTime,
            };

            t.set(userRef, user);
            t.set(userPropertiesRef, userProperties);
        });
    }
);

export const getAuthUserInfos = functions.https.onCall(async (_, context) => {
    const userId = verifyUser(context);
    await verifyAdmin(userId);

    const { users } = await auth.listUsers();
    return users.reduce<Partial<Record<string, { email: string; verified: boolean }>>>((acc, user) => {
        if (user.email) {
            acc[user.uid] = {
                email: user.email,
                verified: user.emailVerified,
            };
        }
        return acc;
    }, {});
});

export const deleteAllContentOfUser = functions.https.onCall(async ({ userId }: { userId: string }, context) => {
    const currentUserId = verifyUser(context);
    await verifyAdmin(currentUserId);

    await Promise.all(
        [
            db.collection('comments'),
            db.collection('terms'),
            db.collection('translations'),
            db.collection('translationExamples'),
        ].map(async collectionRef => {
            const snapshot = await collectionRef.where('creator.id', '==', userId).get();
            logger.info(`Deleting ${snapshot.size} documents from collection ${collectionRef.path}`);
            return Promise.all(snapshot.docs.map(doc => doc.ref.delete()));
        })
    );
});
