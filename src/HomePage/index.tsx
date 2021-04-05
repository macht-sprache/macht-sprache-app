import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonContainer, ButtonLink } from '../Form/Button';
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
    const getTerms = useCollection(collections.terms);
    const { response } = useWpPage(ABOUT_SLUGS);

    return (
        <>
            <HomePageHeader />
            <ColumnHeading>{t('home.termsOfTheWeek')}</ColumnHeading>
            <Columns>
                <TermsWeekHighlights />
            </Columns>
            <Columns>
                <div>
                    <Suspense fallback={null}>
                        <ColumnHeading>{t('common.entities.term.all')}</ColumnHeading>
                        <Terms getTerms={getTerms} />
                        <div className={s.button}>
                            <ButtonContainer align="left">
                                <ButtonLink to={TERMS}>{t('home.viewAllTerms')}</ButtonLink>
                            </ButtonContainer>
                        </div>
                    </Suspense>
                </div>
                <div>
                    <ColumnHeading>{t('home.about')}</ColumnHeading>
                    <WpStyle body={response?.body} />
                    <ButtonContainer align="left">
                        <ButtonLink to={ABOUT}>{t('home.moreAbout')}</ButtonLink>
                    </ButtonContainer>
                </div>
            </Columns>
        </>
    );
}
