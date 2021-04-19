import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentItemList } from '../ContentItemList';
import { ButtonContainer, ButtonLink } from '../Form/Button';
import { useUser } from '../hooks/appContext';
import { collections } from '../hooks/data';
import { useCollection } from '../hooks/fetch';
import { ColumnHeading, Columns } from '../Layout/Columns';
import { ABOUT, TERMS } from '../routes';
import { Terms } from '../Terms/TermsSmall';
import { TermsWeekHighlights } from '../Terms/TermsWeekHighlights';
import { useWpPage } from '../useWpHooks';
import { WpStyle } from '../WpStyle';
import { HomePageHeader } from './Header';
import s from './style.module.css';

const ABOUT_SLUGS = {
    en: 'about-macht-sprache-short-version-landing-page',
    de: 'ueber-macht-sprache-kurzversion-startseite',
};

export default function Home() {
    const { t } = useTranslation();
    const getTerms = useCollection(collections.terms.where('adminTags.hideFromList', '==', false));
    const user = useUser();

    return (
        <>
            <HomePageHeader />
            <ColumnHeading>{t('home.termsOfTheWeek')}</ColumnHeading>
            <Columns>
                <TermsWeekHighlights />
            </Columns>
            <Columns>
                <div>
                    {user ? (
                        <Suspense fallback={null}>
                            <LatestActivity />
                        </Suspense>
                    ) : (
                        <About />
                    )}
                </div>
                <div>
                    <ColumnHeading>{t('common.entities.term.all')}</ColumnHeading>
                    <Suspense fallback={null}>
                        <Terms getTerms={getTerms} />
                        <div className={s.button}>
                            <ButtonContainer align="left">
                                <ButtonLink to={TERMS}>{t('home.viewAllTerms')}</ButtonLink>
                            </ButtonContainer>
                        </div>
                    </Suspense>
                    {user ? (
                        <About />
                    ) : (
                        <Suspense fallback={null}>
                            <LatestActivity />
                        </Suspense>
                    )}
                </div>
            </Columns>
        </>
    );
}

function About() {
    const { response } = useWpPage(ABOUT_SLUGS);
    const { t } = useTranslation();

    return (
        <>
            <ColumnHeading>{t('home.about')}</ColumnHeading>
            <WpStyle body={response?.body} />
            <ButtonContainer align="left">
                <ButtonLink to={ABOUT}>{t('home.moreAbout')}</ButtonLink>
            </ButtonContainer>
        </>
    );
}

function LatestActivity() {
    const { t } = useTranslation();
    const getComments = useCollection(collections.comments.orderBy('createdAt', 'desc').limit(10));
    const getTerms = useCollection(collections.terms.orderBy('createdAt', 'desc').limit(5));
    const getTranslations = useCollection(collections.translations.orderBy('createdAt', 'desc').limit(5));
    const getTranslationExamples = useCollection(collections.translationExamples.orderBy('createdAt', 'desc').limit(5));

    return (
        <>
            <ColumnHeading>{t('common.activity')}</ColumnHeading>
            <ContentItemList
                comments={getComments()}
                terms={getTerms()}
                translations={getTranslations()}
                translationExamples={getTranslationExamples()}
            />
        </>
    );
}
