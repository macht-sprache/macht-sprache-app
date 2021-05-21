import { useMatomo } from '@datapunt/matomo-tracker-react';
import { useEffect, createContext, useState, useCallback, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useRedacted } from '../RedactSensitiveTerms';

const pageTitleContext = createContext<{
    setPageTitle: (title: string, pathname: string) => void;
    setNotificationCount: (count: number) => void;
}>({ setPageTitle: () => {}, setNotificationCount: () => {} });

export const useSetNotificationCountForPageTitle = () => useContext(pageTitleContext).setNotificationCount;

export const PageTitleProvider: React.FC = ({ children }) => {
    const { t } = useTranslation();
    const { trackPageView } = useMatomo();
    const [{ title, notifications, pathname }, setState] = useState({
        title: '',
        notifications: 0,
        pathname: '',
    });

    useEffect(() => {
        document.title = [
            notifications && `(${notifications})`,
            [title, t('name') !== title && t('name')].filter(part => !!part).join(' – '),
        ]
            .filter(part => !!part)
            .join(' ');
    }, [notifications, title, t]);

    useEffect(() => {
        const faviconLinkSvg = document.getElementById('faviconSvg') as HTMLLinkElement;
        const faviconLinkPng = document.getElementById('faviconPng') as HTMLLinkElement;

        if (notifications) {
            faviconLinkSvg.href = '/favicon-notification.svg';
            faviconLinkPng.href = '/favicon-notification.png';
        } else {
            faviconLinkSvg.href = '/favicon.svg';
            faviconLinkPng.href = '/favicon.png';
        }
    }, [notifications]);

    useEffect(() => {
        if (title) {
            if (process.env.NODE_ENV === 'development') {
                console.log('Tracking page view:', title, window.location.href);
            }
            trackPageView({
                documentTitle: title,
                href: window.location.href,
            });
        }
        // we only want to track when the pathname changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    const setPageTitle = useCallback(
        (title: string, pathname: string) => setState(prev => ({ ...prev, title, pathname })),
        []
    );

    const setNotificationCount = useCallback(
        (notifications: number) => setState(prev => ({ ...prev, notifications })),
        []
    );

    const context = useMemo(() => ({ setPageTitle, setNotificationCount }), [setNotificationCount, setPageTitle]);

    return <pageTitleContext.Provider value={context}>{children}</pageTitleContext.Provider>;
};

type Props = {
    title: string;
};

export default function PageTitle({ title }: Props) {
    const { pathname } = useLocation();
    const { setPageTitle } = useContext(pageTitleContext);
    const pageTitle = useRedacted(title, true);

    useEffect(() => {
        setPageTitle(pageTitle, pathname);
        return () => setPageTitle('', pathname);
    }, [pageTitle, pathname, setPageTitle]);

    return null;
}
