import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { FormatDate } from '../FormatDate';
import { getNotificationsRef } from '../hooks/data';
import { GetList, useCollection } from '../hooks/fetch';
import { TermWithLang } from '../TermWithLang';
import { Notification } from '../types';
import { useDomId } from '../useDomId';
import { ReactComponent as Bell } from './bell-regular.svg';
import s from './style.module.css';

type Props = {
    userId: string;
};

type MenuProps = {
    userId: string;
    getNotifications: GetList<Notification>;
};

export default function Notifications({ userId }: Props) {
    const getNotifications = useCollection(getNotificationsRef(userId));
    return (
        <Suspense fallback={<NotificationButton />}>
            <NotificationsMenu userId={userId} getNotifications={getNotifications} />
        </Suspense>
    );
}

function NotificationsMenu({ userId, getNotifications }: MenuProps) {
    const notifications = getNotifications();
    const hasUnseen = useHasUnseen(notifications);

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
                        <NotificationList notifications={notifications} />
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

function NotificationList({ notifications }: { notifications: Notification[] }) {
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
        <Link to="TODO" className={s.notification}>
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
    return useMemo(() => notifications.some(notification => notification.seenAt === null), [notifications]);
}
