import { useTranslation } from 'react-i18next';
import Header from '../Header';
import { ColumnHeading, Columns } from '../Layout/Columns';
import { NewsFeed } from '../NewsFeed';
import { useWpPage } from '../useWpHooks';

const ABOUT_SLUGS = { en: 'about-case-sensitive', de: 'ueber-macht-sprache' };

export function HomePagePreLaunch() {
    const { t } = useTranslation();
    const { response } = useWpPage(ABOUT_SLUGS);

    return (
        <>
            <Header>macht.sprache.</Header>
            <Columns>
                <div>
                    <ColumnHeading>{t('home.about')}</ColumnHeading>
                    <div dangerouslySetInnerHTML={{ __html: response ? response.body : t('common.loading') }} />
                </div>
                <div>
                    <ColumnHeading>{t('home.news')}</ColumnHeading>
                    <NewsFeed />
                </div>
            </Columns>
        </>
    );
}
