import { firestore } from 'firebase-admin';
import { logger } from 'firebase-functions';
import { Notification, UserSettings } from '../../../src/types';
import { auth, db, functions } from '../firebase';
import { sendNotificationMail } from '../mails';

export const notificationMailTask = functions.https.onRequest(async (req, res) => {
    const { userId, notificationId } = req.query;

    if (typeof userId !== 'string' || typeof notificationId !== 'string') {
        res.status(400).send('Missing query params');
        return;
    }

    const notifications = await getNotificationsAndMarkAsNotified(userId, notificationId);

    if (!notifications.length) {
        logger.info('No notifications to notify about');
        res.status(200).send();
        return;
    }

    const [userSettings, authUser] = await Promise.all([getUserSettings(userId), auth.getUser(userId)]);
    logger.info(`Notifying user ${userId} about ${notifications.length} notifications`);

    await sendNotificationMail(
        { id: userId, displayName: authUser.displayName!, email: authUser.email!, lang: userSettings.lang },
        notifications
    );

    res.status(200).send();
});

const getNotificationsAndMarkAsNotified = (userId: string, notificationId: string) =>
    db.runTransaction(async t => {
        const notificationSnap = await t.get(
            db
                .collection('users')
                .doc(userId)
                .collection('notifications')
                .where('seenAt', '==', null)
                .where('notifiedAt', '==', null)
                .orderBy('createdAt', 'asc')
        );
        const notifications = notificationSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Notification));

        if (notifications[notifications.length - 1]?.id !== notificationId) {
            logger.info(`Notification ${notificationId} is not the most recent`);
            return [];
        }

        const notifiedAt = firestore.Timestamp.now();
        notificationSnap.docs.forEach(doc => t.update(doc.ref, { notifiedAt }));
        return notifications;
    });

const getUserSettings = async (userId: string) => {
    const snap = await db.collection('userSettings').doc(userId).get();
    const userSettings = snap.data();
    if (!userSettings) {
        throw new Error(`UserSettings for ${userId} not found`);
    }
    return userSettings as UserSettings;
};
