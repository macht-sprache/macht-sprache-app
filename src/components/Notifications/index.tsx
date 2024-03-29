import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, Link, useLocation } from 'react-router-dom';
import { getCommentDomId } from '../Comments/service';
import { db, Timestamp } from '../../firebase';
import { FormatDate } from '../FormatDate';
import { getNotificationsRef } from '../../hooks/data';
import { GetList, useCollection } from '../../hooks/fetch';
import { addSearchParam } from '../../hooks/location';
import { useSetNotificationCountForPageTitle } from '../PageTitle';
import { TERM, TRANSLATION_EXAMPLE_REDIRECT, TRANSLATION_REDIRECT } from '../../routes';
import { TermWithLang } from '../TermWithLang';
import { DocReference, Notification, Term, Translation, TranslationExample } from '../../types';
import { useDomId } from '../../useDomId';
import { ReactComponent as Bell } from './bell-regular.svg';
import s from './style.module.css';

type Props = {
    userId: string;
};

type MenuProps = {
    userId: string;
    getNotifications: GetList<Notification>;
};

const NOTIFICATION_PARAM = 'notification';

export default function Notifications({ userId }: Props) {
    const getNotifications = useCollection(getNotificationsRef(userId).orderBy('createdAt', 'desc').limit(25));
    return (
        <Suspense fallback={<NotificationButton />}>
            <NotificationsMenu userId={userId} getNotifications={getNotifications} />
        </Suspense>
    );
}

function NotificationsMenu({ userId, getNotifications }: MenuProps) {
    const notifications = getNotifications();
    const hasUnseen = useHasUnseen(notifications);
    useMarkRead(userId, notifications);

    const { t } = useTranslation();
    const id = useDomId();

    const { isOpen, toggleIsOpen, ref } = useMenuOpenState();

    return (
        <div className={s.container} ref={ref}>
            <NotificationButton
                unseen={hasUnseen}
                isOpen={isOpen}
                ariaControls={id('overlay')}
                onClick={toggleIsOpen}
            />
            {isOpen && (
                <div className={s.overlay} id={id('overlay')}>
                    {notifications.length ? (
                        <NotificationList userId={userId} notifications={notifications} />
                    ) : (
                        <div className={s.empty}>{t('notifications.noNotifications')}</div>
                    )}
                </div>
            )}
        </div>
    );
}

function NotificationButton({
    unseen,
    isOpen,
    ariaControls,
    onClick,
}: {
    unseen?: boolean;
    isOpen?: boolean;
    ariaControls?: string;
    onClick?: () => void;
}) {
    const { t } = useTranslation();
    return (
        <button
            onClick={onClick}
            disabled={!onClick}
            className={s.button}
            aria-expanded={isOpen}
            aria-controls={ariaControls}
            aria-label={`${t('notifications.buttonLabel.label')}${unseen ? t('notifications.buttonLabel.unread') : ''}`}
        >
            <Bell />
            {unseen && <div className={s.unreadDot} />}
        </button>
    );
}

function NotificationList({ userId, notifications }: { notifications: Notification[]; userId: string }) {
    useMarkSeen(userId, notifications);
    return (
        <div className={s.notificationList}>
            {notifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
            ))}
        </div>
    );
}

function NotificationItem({ notification }: { notification: Notification }) {
    const { t } = useTranslation();
    return (
        <Link to={getLink(notification)} className={notification.readAt ? s.notification : s.unreadNotification}>
            <div className={s.date}>
                <FormatDate date={notification.createdAt} />
            </div>
            <div>
                <Trans
                    t={t}
                    i18nKey={`notifications.messages.${notification.type}` as const}
                    values={{ user: notification.actor.displayName }}
                    components={{
                        Parent: (
                            <TermWithLang term={{ value: notification.parent.name, lang: notification.parent.lang }} />
                        ),
                    }}
                />
            </div>
        </Link>
    );
}

function useMenuOpenState() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const toggleIsOpen = useCallback(() => setIsOpen(prev => !prev), []);
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            setIsOpen(false);
        }
    }, []);
    const handleWindowClick = useCallback((event: MouseEvent) => {
        const clickInside = event.target instanceof Node && ref.current?.contains(event.target);
        if (!clickInside) {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('mousedown', handleWindowClick);
        } else {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousedown', handleWindowClick);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousedown', handleWindowClick);
        };
    }, [isOpen, handleKeyDown, handleWindowClick]);

    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    return { isOpen, toggleIsOpen, ref };
}

function useHasUnseen(notifications: Notification[]) {
    const unseenCount = useMemo(() => notifications.filter(notification => notification.seenAt === null).length, [
        notifications,
    ]);
    const setNotificationCountForPageTitle = useSetNotificationCountForPageTitle();

    useEffect(() => setNotificationCountForPageTitle(unseenCount), [unseenCount, setNotificationCountForPageTitle]);
    useEffect(() => () => setNotificationCountForPageTitle(0), [setNotificationCountForPageTitle]);

    return !!unseenCount;
}

function useMarkSeen(userId: string, notifications: Notification[]) {
    useEffect(() => {
        const unseen = notifications.filter(notification => notification.seenAt === null);
        if (!unseen.length) {
            return;
        }
        const batch = db.batch();
        const collectionRef = getNotificationsRef(userId);
        const seenAt = Timestamp.now();
        unseen.forEach(notification => batch.update(collectionRef.doc(notification.id), { seenAt }));
        batch.commit();
    }, [notifications, userId]);
}

function useMarkRead(userId: string, notifications: Notification[]) {
    const { search } = useLocation();
    const notification = useMemo(() => {
        const notificationId = new URLSearchParams(search).get(NOTIFICATION_PARAM);
        return (notificationId && notifications.find(notification => notification.id === notificationId)) || null;
    }, [notifications, search]);

    useEffect(() => {
        if (!notification || (notification.seenAt && notification.readAt)) {
            return;
        }

        const now = Timestamp.now();
        const update: Partial<Notification> = {
            seenAt: notification.seenAt || now,
            readAt: notification.readAt || now,
        };

        getNotificationsRef(userId).doc(notification.id).update(update);
    }, [notification, userId]);
}

function getLink(notification: Notification) {
    return addSearchParam(getBaseLink(notification), [NOTIFICATION_PARAM, notification.id]);
}

function getBaseLink(notification: Notification) {
    switch (notification.type) {
        case 'CommentAddedNotification':
        case 'CommentLikedNotification':
            return getLinkForComment(notification.parent.ref, notification.entityRef.id);
        case 'TranslationAddedNotification':
        case 'TranslationExampleAddedNotification':
            return getLinkForRef(notification.entityRef);
    }
}

function getLinkForComment(parentRef: DocReference<Term | Translation | TranslationExample>, commentId: string) {
    return `${getLinkForRef(parentRef)}#${getCommentDomId(commentId)}`;
}

function getLinkForRef(ref: DocReference<Term | Translation | TranslationExample>) {
    switch (ref.parent.id) {
        case 'terms':
            return generatePath(TERM, { termId: ref.id });
        case 'translations':
            return generatePath(TRANSLATION_REDIRECT, { translationId: ref.id });
        case 'translationExamples':
            return generatePath(TRANSLATION_EXAMPLE_REDIRECT, { translationExampleId: ref.id });
        default:
            console.error(`Unexpected parentId ${ref.parent.id}`);
            return '';
    }
}
