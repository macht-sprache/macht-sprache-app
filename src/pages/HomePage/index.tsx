import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { ContentItemList } from '../../components/ContentItemList';
import { ButtonAnchor, ButtonContainer, ButtonLink } from '../../components/Form/Button';
import { ColumnHeading, Columns, FullWidthColumn } from '../../components/Layout/Columns';
import { WpStyle } from '../../components/WpStyle';
import { useUser } from '../../hooks/appContext';
import { collections } from '../../hooks/data';
import { useCollection } from '../../hooks/fetch';
import { useWpPage } from '../../hooks/wp';
import { ABOUT, TERMS, TEXT_CHECKER } from '../../routes';
import { RegisterForm } from '../RegisterPage';
import { HomePageHeader } from './Header';
import googleDeepL from './Illustrations/googleDeepL.svg';
import termsAndDiscussion from './Illustrations/termsDiscussionHorizontal.svg';
import textCheckerIllustration from './Illustrations/textChecker.svg';
import { IllustrationSection } from './IllustrationSection';
import { LogoBar } from './LogoBar';
import s from './style.module.css';

const ABOUT_SLUGS = {
    en: 'about-macht-sprache-short-version-landing-page',
    de: 'ueber-macht-sprache-kurzversion-startseite',
};

export default function Home() {
    const user = useUser();
    const { t } = useTranslation();

    return (
        <>
            <HomePageHeader />
            <FullWidthColumn>
                <IllustrationSection
                    title={t('home.sections.textchecker.title')}
                    buttons={
                        <>
                            <ButtonLink to={{ pathname: TEXT_CHECKER }} size="large" primary>
                                {t('home.sections.textchecker.button')}
                            </ButtonLink>
                        </>
                    }
                    image={textCheckerIllustration}
                >
                    <p>{t('home.sections.textchecker.text')}</p>
                </IllustrationSection>
                <IllustrationSection
                    title={t('home.sections.terms.title')}
                    buttons={
                        <>
                            <ButtonLink primary to={TERMS} size="large">
                                {t('home.sections.terms.buttonBrowse')}
                            </ButtonLink>
                        </>
                    }
                    image={termsAndDiscussion}
                >
                    <p>{t('home.sections.terms.text')}</p>
                </IllustrationSection>
                <IllustrationSection
                    title={t('home.sections.extension.title')}
                    buttons={
                        <>
                            <ButtonAnchor
                                primary
                                target="_blank"
                                href="https://chrome.google.com/webstore/detail/machtsprache-for-sensitiv/dichlnekfmanlagciihdnkgiefppilol/"
                                size="large"
                            >
                                {t('home.sections.extension.chrome')}
                            </ButtonAnchor>
                            <ButtonAnchor
                                primary
                                target="_blank"
                                href="https://addons.mozilla.org/en-GB/firefox/addon/macht-sprache/"
                                size="large"
                            >
                                {t('home.sections.extension.firefox')}
                            </ButtonAnchor>
                        </>
                    }
                    image={googleDeepL}
                >
                    <p>{t('home.sections.extension.text')}</p>
                </IllustrationSection>
                <LogoBar />
            </FullWidthColumn>
            <Columns>
                <Suspense fallback={null}>
                    <LatestActivity />
                </Suspense>
                <About />
            </Columns>
            {!user && (
                <FullWidthColumn>
                    <section className={s.finalCTA}>
                        <div className={s.finalCTABox}>
                            <h1 className={s.finalCTAHeading}>{t('home.signup')}</h1>
                            <RegisterForm />
                        </div>
                    </section>
                </FullWidthColumn>
            )}
        </>
    );
}

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
