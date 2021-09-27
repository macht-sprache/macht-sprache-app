import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import { useWpPosts } from '../../hooks/wp';
import { MACHT_SPRACHE_TAGS, NewsFeed } from '../../components/NewsFeed';
import PageTitle from '../../components/PageTitle';
import s from './style.module.css';

export function NewsPage() {
    const { t } = useTranslation();
    const getPosts = useWpPosts(MACHT_SPRACHE_TAGS, 100);

    return (
        <>
            <PageTitle title={t('home.news')} />
            <Header subLine={t('newsFeed.subLine')}>{t('home.news')}</Header>
            <div className={s.feed}>
                <Suspense fallback={t('common.loading')}>
                    <NewsFeed getPosts={getPosts} />
                </Suspense>
            </div>
        </>
    );
}
