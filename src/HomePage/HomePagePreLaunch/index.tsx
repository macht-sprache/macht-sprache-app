import { useTranslation } from 'react-i18next';
import { ColumnHeading, Columns } from '../../Layout/Columns';
import { NewsFeed } from '../../NewsFeed';
import { useWpPage } from '../../useWpHooks';
import { HomePageHeader } from '../Header';

const ABOUT_SLUGS = {
    en: 'about-macht-sprache-short-version-landing-page',
    de: 'ueber-macht-sprache-kurzversion-startseite',
};

export function HomePagePreLaunch() {
    const { t } = useTranslation();
    const { response } = useWpPage(ABOUT_SLUGS);

    return (
        <>
            <HomePageHeader />
            <Columns>
                <div>
                    <ColumnHeading>{t('home.news')}</ColumnHeading>
                    <NewsFeed />
                </div>
                <div>
                    <ColumnHeading>{t('home.about')}</ColumnHeading>
                    <div dangerouslySetInnerHTML={{ __html: response ? response.body : t('common.loading') }} />
                </div>
            </Columns>
        </>
    );
}
