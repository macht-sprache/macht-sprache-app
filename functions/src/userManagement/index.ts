import { auth, db, functions, HttpsError, logger, verifyUser } from '../firebase';

const verifyAdmin = async (userId: string) => {
    const snap = await db.collection('userProperties').doc(userId).get();
    if (!snap.data()?.admin) {
        throw new HttpsError('permission-denied', 'User is not an admin');
    }
};

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
