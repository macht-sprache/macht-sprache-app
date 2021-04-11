import { useTranslation } from 'react-i18next';
import Header from '../Header';
import { NewsFeed } from '../NewsFeed';
import s from './style.module.css';

export function NewsPage() {
    const { t } = useTranslation();

    return (
        <>
            <Header subLine={t('newsFeed.subLine')}>{t('home.news')}</Header>
            <div className={s.feed}>
                <NewsFeed />
            </div>
        </>
    );
}
