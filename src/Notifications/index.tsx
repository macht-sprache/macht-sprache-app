import s from './style.module.css';
import { ReactComponent as Bell } from './bell-regular.svg';
import { useCallback, useEffect, useRef, useState } from 'react';
import { UserMini } from '../types';
import { FormatDate } from '../FormatDate';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

type Notification = {
    type: 'TERM' | 'TRANSLATION' | 'COMMENT' | 'LIKE';
    value?: string;
    user: UserMini;
    date: Date;
    id: number;
    link: string;
};

const NOTIFICATION_DUMMIES: Notification[] = [
    {
        user: {
            id: 'dfsdf',
            displayName: 'Lucy',
        },
        type: 'TERM',
        value: 'Obdachloser',
        id: 1,
        date: new Date('Fri Apr 23 2021 17:17:22 GMT+0200 (Central European Summer Time)'),
        link: '/',
    },
    {
        user: {
            id: 'dfsdf',
            displayName: 'Kolja',
        },
        type: 'LIKE',
        id: 2,
        date: new Date('Fri Apr 23 2021 12:11:22 GMT+0200 (Central European Summer Time)'),
        link: '/',
    },
    {
        user: {
            id: 'dfsdf',
            displayName: 'Anna',
        },
        type: 'COMMENT',
        value: 'Obdachloser',
        id: 3,
        date: new Date('Fri Apr 22 2021 17:32:22 GMT+0200 (Central European Summer Time)'),
        link: '/',
    },
];

export default function Notifications() {
    const location = useLocation();
    const [hasUnread, setHasUnread] = useState(true);
    const [isOpen, setIsOpen] = useState(true);
    const overlay = useRef<HTMLDivElement>(null);
    const notifications = NOTIFICATION_DUMMIES;

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        },
        [setIsOpen]
    );

    const handleWindowClick = useCallback(
        (event: MouseEvent) => {
            const clickInside = overlay.current?.contains(event.target as Node);
            if (!clickInside) {
                setIsOpen(false);
            }
        },
        [setIsOpen]
    );

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('mousedown', handleWindowClick);
        }
        if (!isOpen) {
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
    }, [location]);

    const onOpen = () => {
        setHasUnread(false);
        setIsOpen(!isOpen);
    };

    return (
        <div className={s.container}>
            <button onClick={onOpen} className={s.button}>
                <Bell />
                {hasUnread && <div className={s.unreadDot} />}
            </button>
            {isOpen && (
                <div ref={overlay} className={s.overlay}>
                    {notifications.length ? (
                        <NotificationList notifications={notifications} />
                    ) : (
                        <div className={s.empty}>no notifcations</div>
                    )}
                </div>
            )}
        </div>
    );
}

function NotificationList({ notifications }: { notifications: Notification[] }) {
    return (
        <div className={s.notificationList}>
            {notifications.map(notification => (
                <NotificationItem key={notification.id} {...notification} />
            ))}
        </div>
    );
}

function NotificationItem({ type, user, date, link, value }: Notification) {
    const { t } = useTranslation();
    return (
        <Link to={link} className={s.notification}>
            <div className={s.date}>
                <FormatDate date={date} />
            </div>
            <div>
                <Trans
                    t={t}
                    i18nKey={`notifications.messages.${type}` as const}
                    values={{ user: user.displayName, item: value }}
                />
            </div>
        </Link>
    );
}
