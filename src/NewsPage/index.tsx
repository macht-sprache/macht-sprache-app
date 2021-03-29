import { useTranslation } from 'react-i18next';
import Header from '../Header';
import { Columns } from '../Layout/Columns';
import { NewsFeed } from '../NewsFeed';

export function NewsPage() {
    const { t } = useTranslation();

    return (
        <>
            <Header subLine={t('newsFeed.subLine')}>{t('home.news')}</Header>
            <Columns>
                <NewsFeed />
            </Columns>
        </>
    );
}
