import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { ContentItemList } from '../../components/ContentItemList';
// import { useUser } from '../../hooks/appContext';
import { collections } from '../../hooks/data';
import { useCollection } from '../../hooks/fetch';
import { useWpPage } from '../../hooks/wp';
import { ColumnHeading, Columns, FullWidthColumn } from '../../components/Layout/Columns';
// import { Terms } from '../../components/Terms/TermsSmall';
// import { TermsWeekHighlights } from '../../components/Terms/TermsWeekHighlights';
import { WpStyle } from '../../components/WpStyle';
import { HomePageHeader } from './Header';
import s from './style.module.css';
import { IllustrationSection } from './IllustrationSection';
import { ButtonContainer, ButtonAnchor, ButtonLink } from '../../components/Form/Button';
import textCheckerIllustration from './Illustrations/textChecker.svg';
import termsAndDiscussion from './Illustrations/termsDiscussionHorizontal.svg';
import googleDeepL from './Illustrations/googleDeepL.svg';
import manifestoIllustration from './Illustrations/manifesto.svg';
import { ABOUT, MANIFESTO, REGISTER, TERMS, TEXT_CHECKER } from '../../routes';
import { LogoBar } from './LogoBar';

const ABOUT_SLUGS = {
    en: 'about-macht-sprache-short-version-landing-page',
    de: 'ueber-macht-sprache-kurzversion-startseite',
};

// const EVENT_SLUGS = {
//     en: 'macht-sprache-events-short-version-landing-page',
//     de: 'macht-sprache-veranstaltungen-kurzversion-startseite',
// };

export default function Home() {
    // const user = useUser();
    const { t } = useTranslation();

    return (
        <>
            <HomePageHeader />
            <FullWidthColumn>
                <IllustrationSection
                    title={t('home.ad.textchecker.title')}
                    buttons={
                        <>
                            <ButtonLink to={{ pathname: TEXT_CHECKER }} size="large" primary>
                                {t('home.ad.textchecker.button')}
                            </ButtonLink>
                        </>
                    }
                    image={textCheckerIllustration}
                >
                    <p>{t('home.ad.textchecker.text')}</p>
                </IllustrationSection>
                <IllustrationSection
                    title={t('home.ad.terms.title')}
                    buttons={
                        <>
                            <ButtonLink primary to={TERMS} size="large">
                                {t('home.ad.terms.buttonBrowse')}
                            </ButtonLink>
                            {/* <ButtonLink primary to={REGISTER} size="large">
                            {t('home.ad.terms.buttonRegister')}
                        </ButtonLink> */}
                        </>
                    }
                    image={termsAndDiscussion}
                >
                    <p>{t('home.ad.terms.text')}</p>
                </IllustrationSection>
                <IllustrationSection
                    title={t('home.ad.extension.title')}
                    buttons={
                        <>
                            <ButtonAnchor
                                primary
                                target="_blank"
                                href="https://chrome.google.com/webstore/detail/machtsprache-for-sensitiv/dichlnekfmanlagciihdnkgiefppilol/"
                                size="large"
                            >
                                {t('home.ad.extension.chrome')}
                            </ButtonAnchor>
                            <ButtonAnchor
                                primary
                                target="_blank"
                                href="https://addons.mozilla.org/en-GB/firefox/addon/macht-sprache/"
                                size="large"
                            >
                                {t('home.ad.extension.firefox')}
                            </ButtonAnchor>
                        </>
                    }
                    image={googleDeepL}
                >
                    <p>{t('home.ad.extension.text')}</p>
                </IllustrationSection>
                <LogoBar />
                <IllustrationSection
                    title={t('home.ad.manifesto.title')}
                    buttons={
                        <>
                            <ButtonLink primary to={MANIFESTO} size="large">
                                {t('home.ad.manifesto.read')}
                            </ButtonLink>
                        </>
                    }
                    image={manifestoIllustration}
                >
                    <p>{t('home.ad.manifesto.text')}</p>
                </IllustrationSection>
            </FullWidthColumn>
            <Columns>
                <Suspense fallback={null}>
                    <LatestActivity />
                </Suspense>
                <About />
            </Columns>
            <FullWidthColumn>
                <section className={s.finalCTA}>
                    <div className={s.finalCTABox}>
                        <h1 className={s.finalCTAHeading}>Are you signing up yet?!</h1>
                        <p>Here are some more convincing words to get you to sign up. Please!!</p>
                        <ButtonContainer align="center">
                            <ButtonLink to={REGISTER} primary size="large">
                                Sign up!
                            </ButtonLink>
                        </ButtonContainer>
                    </div>
                </section>
            </FullWidthColumn>
            {/* <TermsWeekHighlights /> */}
            {/* <Columns>
                <div>
                    {user ? (
                        <Suspense fallback={null}>
                            <LatestActivity />
                        </Suspense>
                    ) : (
                        <>
                            <About />
                            <TermsWrapped />
                            <Events />
                        </>
                    )}
                </div>
                <div>
                    {user ? (
                        <>
                            <TermsWrapped />
                            <About />
                            <Events />
                        </>
                    ) : (
                        <Suspense fallback={null}>
                            <LatestActivity />
                        </Suspense>
                    )}
                </div>
            </Columns> */}
        </>
    );
}

// function TermsWrapped() {
//     const { t } = useTranslation();
//     const getTerms = useCollection(collections.terms.where('adminTags.hideFromList', '==', false));

//     return (
//         <Suspense fallback={null}>
//             <ColumnHeading>{t('common.entities.term.all')}</ColumnHeading>
//             <Terms getTerms={getTerms} />
//             <div className={s.button}>
//                 <ButtonContainer align="left">
//                     <ButtonLink to={TERMS}>{t('home.viewAllTerms')}</ButtonLink>
//                 </ButtonContainer>
//             </div>
//         </Suspense>
//     );
// }

function About() {
    const getPage = useWpPage(ABOUT_SLUGS);
    const { t } = useTranslation();

    return (
        <section>
            <ErrorBoundary fallbackRender={() => null}>
                <Suspense fallback={null}>
                    <ColumnHeading>{t('home.about')}</ColumnHeading>
                    <WpStyle body={getPage().body} />
                    <ButtonContainer align="left">
                        <ButtonLink to={ABOUT}>{t('home.moreAbout')}</ButtonLink>
                    </ButtonContainer>
                </Suspense>
            </ErrorBoundary>
        </section>
    );
}

// function Events() {
//     const getPage = useWpPage(EVENT_SLUGS);
//     const { t } = useTranslation();

//     return (
//         <ErrorBoundary fallbackRender={() => null}>
//             <Suspense fallback={null}>
//                 <ColumnHeading>{t('home.events')}</ColumnHeading>
//                 <WpStyle body={getPage().body} />
//             </Suspense>
//         </ErrorBoundary>
//     );
// }

function LatestActivity() {
    const { t } = useTranslation();
    const getComments = useCollection(collections.comments.orderBy('createdAt', 'desc').limit(5));
    const getTerms = useCollection(collections.terms.orderBy('createdAt', 'desc').limit(5));
    const getTranslations = useCollection(collections.translations.orderBy('createdAt', 'desc').limit(5));
    const getTranslationExamples = useCollection(collections.translationExamples.orderBy('createdAt', 'desc').limit(5));

    return (
        <section>
            <ColumnHeading>{t('home.activity')}</ColumnHeading>
            <ContentItemList
                comments={getComments()}
                terms={getTerms()}
                translations={getTranslations()}
                translationExamples={getTranslationExamples()}
                limit={5}
            />
        </section>
    );
}
