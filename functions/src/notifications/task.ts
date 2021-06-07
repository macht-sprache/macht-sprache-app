import { firestore } from 'firebase-admin';
import { logger } from 'firebase-functions';
import { Notification, UserSettings } from '../../../src/types';
import { app, auth, db, functions } from '../firebase';
import { sendNotificationMail } from '../mails';
import { CloudTasksClient, protos } from '@google-cloud/tasks';
import config from '../config';

const queueName = 'notifications';
const taskName = 'notifications-notificationMailTask';
const debounceSeconds = 60 * 30;

export const enqueueNotificationMailTask = functions.firestore
    .document('/users/{userId}/notifications/{notificationId}')
    .onCreate(async (snapshot, context) => {
        const { userId, notificationId } = context.params;
        await handleEnqueueNotificationMailTask(userId, notificationId);
    });

const handleEnqueueNotificationMailTask = async (userId: string, notificationId: string) => {
    const tasksClient = new CloudTasksClient();
    const queuePath = tasksClient.queuePath(app.options.projectId!, config.functions.region, queueName);
    const url = `https://${config.functions.region}-${app.options
        .projectId!}.cloudfunctions.net/${taskName}?userId=${userId}&notificationId=${notificationId}`;

    const task: protos.google.cloud.tasks.v2.ITask = {
        httpRequest: {
            httpMethod: 'POST',
            url,
            headers: {
                authorization: config.functions.auth ?? '',
            },
        },
        scheduleTime: {
            seconds: Date.now() / 1000 + debounceSeconds,
        },
    };

    logger.info(`Enqueueing ${url}`);

    await tasksClient.createTask({ parent: queuePath, task });
};

export const notificationMailTask = functions.https.onRequest(async (req, res) => {
    if (req.headers.authorization !== config.functions.auth) {
        res.status(403).send('Invalid auth');
        return;
    }

    const { userId, notificationId } = req.query;

    if (typeof userId !== 'string' || typeof notificationId !== 'string') {
        res.status(400).send('Missing query params');
        return;
    }

    handleNotificationMailTask(userId, notificationId);

    res.status(200).send();
});

const handleNotificationMailTask = async (userId: string, notificationId: string) => {
    const notifications = await getNotificationsAndMarkAsNotified(userId, notificationId);

    if (!notifications.length) {
        logger.info('No notifications to notify about');
        return;
    }

    const [userSettings, authUser] = await Promise.all([getUserSettings(userId), auth.getUser(userId)]);

    if (!userSettings.notificationMail) {
        logger.info(
            `Notification mails for user ${userId} are disabled. Skipping ${notifications.length} notifications.`
        );
        return;
    }

    logger.info(`Notifying user ${userId} about ${notifications.length} notifications`);

    await sendNotificationMail(
        { id: userId, displayName: authUser.displayName!, email: authUser.email!, lang: userSettings.lang },
        notifications
    );
};

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
            logger.info(`Notification ${notificationId} for user ${userId} is not the most recent`);
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
