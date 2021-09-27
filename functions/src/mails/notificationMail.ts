import { htmlToText } from 'html-to-text';
import escape from 'lodash.escape';
import type { MJMLJsonObject } from 'mjml-core';
import { Lang, Notification } from '../../../src/types';
import { formatDate } from '../../../src/components/FormatDate/service';
import { TFunc, translate } from './i18n';
import {
    addTracking,
    getRedactSensitiveTerms,
    getUrlForComment,
    getUrlForRef,
    Redact,
    addSearchParams,
} from './service';
import { getTermWithLang } from './templates';

export async function getNotificationMailContent(
    notifications: Notification[],
    lang: Lang
): Promise<{ subject: string; message: string; content: MJMLJsonObject[] }> {
    const t = translate(lang);
    const redact = await getRedactSensitiveTerms();
    return {
        subject: getSubject(t, redact, notifications),
        message: notifications.length === 1 ? t('notifications.message') : t('notifications.message_plural'),
        content: [getWrapper(notifications.map(getNotificationItem(t, redact, lang)))],
    };
}

const getSubject = (t: TFunc, redact: Redact, notifications: Notification[]) => {
    if (notifications.length === 1) {
        const notification = notifications[0];
        return htmlToText(
            t(`notifications.messages.${notification.type}` as const, {
                user: notification.actor.displayName,
                parent: escape(redact(notification.parent.name)),
            })
        );
    }
    return t('notifications.genericSubject', { count: notifications.length.toString() });
};

const getWrapper = (children: MJMLJsonObject[]): MJMLJsonObject => ({
    tagName: 'mj-section',
    attributes: {
        padding: '0 25px',
    },
    children: [
        {
            tagName: 'mj-column',
            attributes: {
                border: '2px solid black',
                padding: '8px 16px',
            },
            children,
        },
    ],
});

const getNotificationItem = (t: TFunc, redact: Redact, lang: Lang) => (notification: Notification): MJMLJsonObject => ({
    tagName: 'mj-text',
    attributes: {
        padding: '8px 0',
        'line-height': 1.5,
    },
    content: `<a class="link" href="${track(
        addSearchParams(getUrlForNotification(notification), { notification: notification.id })
    )}">
    <span style="display: inline-block; text-decoration: none">
        ${formatDate(notification.createdAt, lang)}
    </span><br>
    <span style="font-weight: bold">
        ${t(`notifications.messages.${notification.type}` as const, {
            user: notification.actor.displayName,
            parent: getTermWithLang(redact(notification.parent.name), notification.parent.lang),
        })}
    </span>
</a>`,
});

const getUrlForNotification = (notification: Notification) => {
    switch (notification.type) {
        case 'CommentAddedNotification':
        case 'CommentLikedNotification':
            return getUrlForComment(notification.parent.ref, notification.entityRef.id);
        case 'TranslationAddedNotification':
        case 'TranslationExampleAddedNotification':
            return getUrlForRef(notification.entityRef);
    }
};

const track = addTracking('Notification');
