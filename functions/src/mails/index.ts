import { logger } from 'firebase-functions';
import { langA, langB } from '../../../src/languages';
import { FORGOT_PASSWORD, REGISTER_POST, USER } from '../../../src/routes';
import { Lang, Notification, UserMini } from '../../../src/types';
import config from '../config';
import { auth, db, functions } from '../firebase';
import { getDigestContent } from './digestMail';
import { getNotificationMailContent } from './notificationMail';
import { sendMail } from './sendMail';
import { generateUrl } from './service';
import {
    getActivationMail,
    getNotificationMail,
    getResetEmail,
    getVerifyEmailTemplate,
    getWeeklyDigestMail,
} from './templates';

export type Recipient = UserMini & { email: string; lang: Lang };

type AuthHandlerParams = { origin: string; continuePath: string; lang: Lang };

export const sendEmailVerification = functions.https.onCall(
    async ({ origin, continuePath, lang }: AuthHandlerParams, context) => {
        const userId = context.auth?.uid;

        if (!userId) {
            throw new Error(`User not logged in.`);
        }

        const user = await auth.getUser(userId);

        if (!user.email) {
            throw new Error(`User ${userId} has no email to verify.`);
        }

        const verificationLink = await auth.generateEmailVerificationLink(user.email, { url: origin + continuePath });
        const params = new URL(verificationLink).searchParams;
        const url = new URL(origin + REGISTER_POST);
        url.search = params.toString();

        const { html, subject } = getVerifyEmailTemplate({
            recipientName: user.displayName || user.email,
            lang,
            link: url.toString(),
        });

        await sendMail({ html, subject, to: { email: user.email, id: userId } });
    }
);

export const sendPasswordResetMail = functions.https.onCall(
    async ({ email, origin, continuePath, lang }: AuthHandlerParams & { email: string }) => {
        let user;

        try {
            user = await auth.getUserByEmail(email);
        } catch (error) {
            return;
        }

        const resetLink = await auth.generatePasswordResetLink(email, { url: origin + continuePath });

        const params = new URL(resetLink).searchParams;
        const url = new URL(origin + FORGOT_PASSWORD);
        url.search = params.toString();

        const { html, subject } = getResetEmail({
            recipientName: user.displayName || user.email!,
            lang,
            link: url.toString(),
        });

        await sendMail({ html, subject, to: { email: user.email!, id: user.uid } });
    }
);

export const sendActivationMail = functions.firestore
    .document('/userProperties/{userId}')
    .onUpdate(async (change, context) => {
        if (!(change.before.data()?.enabled === false && change.after.data()?.enabled === true)) {
            return;
        }

        const userId = context.params.userId;
        const authUser = await auth.getUser(userId);
        const userSettingsSnap = await db.collection('userSettings').doc(userId).get();

        const lang: Lang = userSettingsSnap.data()?.lang || langA;

        const { html, subject } = getActivationMail({
            recipientName: authUser.displayName || authUser.email!,
            lang,
            link: config.origin.main,
        });

        await sendMail({ html, subject, to: { email: authUser.email!, id: userId } });
    });

type DigestMailConfig = {
    from: Date;
    to: Date;
    limit: number;
    intro: {
        [langA]: string;
        [langB]: string;
    };
};

export const sendWeeklyDigestMail = async (recipients: Recipient[], config: DigestMailConfig) => {
    const digestContent = await getDigestContent(config.from, config.to, config.limit);

    for (const recipient of recipients) {
        logger.info(`Sending digest mail to user ${recipient.id}`);
        const { html, subject } = getWeeklyDigestMail(
            {
                recipientName: recipient.displayName,
                lang: recipient.lang,
                link: generateUrl(USER, { userId: recipient.id }),
            },
            config.intro[recipient.lang],
            digestContent[recipient.lang]
        );
        await sendMail({ html, subject, to: recipient });
    }
};

export const sendNotificationMail = async (recipient: Recipient, notifications: Notification[]) => {
    const { content, subject, message } = await getNotificationMailContent(notifications, recipient.lang);
    const { html } = getNotificationMail(recipient, message, content);
    await sendMail({ html, subject, to: recipient });
};
