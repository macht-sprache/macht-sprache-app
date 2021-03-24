import { useTranslation } from 'react-i18next';
import Header from '../Header';
import { ColumnHeading, Columns, SingleColumn } from '../Layout/Columns';
import { NewsFeed } from '../NewsFeed';

export function NewsPage() {
    const { t } = useTranslation();

    return (
        <>
            <Header>macht.sprache.</Header>
            <ColumnHeading>{t('home.news')}</ColumnHeading>
            <Columns>
                <NewsFeed />
            </Columns>
        </>
    );
}
