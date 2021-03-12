import { useTranslation } from 'react-i18next';
import Header from '../Header';
import { ColumnHeading, SingleColumn } from '../Layout/Columns';
import { NewsFeed } from '../NewsFeed';

export function NewsPage() {
    const { t } = useTranslation();

    return (
        <>
            <Header>macht.sprache.</Header>
            <SingleColumn>
                <ColumnHeading>{t('home.news')}</ColumnHeading>
                <NewsFeed />
            </SingleColumn>
        </>
    );
}
