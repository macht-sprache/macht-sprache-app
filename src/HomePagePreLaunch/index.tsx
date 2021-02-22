import { useTranslation } from 'react-i18next';
import Header from '../Header';
import { ColumnHeading, Columns } from '../Layout/Columns';
import { NewsFeed } from '../NewsFeed';

export function HomePagePreLaunch() {
    const { t } = useTranslation();

    return (
        <>
            <Header>macht.sprache.</Header>
            <Columns>
                <div>
                    <ColumnHeading>{t('home.about')}</ColumnHeading>
                    <p>somehting about the project here...</p>
                </div>
                <div>
                    <ColumnHeading>{t('home.news')}</ColumnHeading>
                    <NewsFeed />
                </div>
            </Columns>
        </>
    );
}
