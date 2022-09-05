import { useTranslation } from 'react-i18next';
import { ButtonAnchor, ButtonLink } from '../../../components/Form/Button';
import { MANIFESTO, TERMS, TEXT_CHECKER } from '../../../routes';
import s from './style.module.css';
import React from 'react';
import textCheckerIllustration from './textChecker.svg';
import termsAndDiscussion from './termsDiscussionHorizontal.svg';
import googleDeepL from './googleDeepL.svg';
import manifestoIllustration from './manifesto.svg';

export default function TextCheckerAd() {
    const { t } = useTranslation();

    return (
        <>
            <Box
                title={t('home.ad.textchecker.title')}
                buttons={
                    <>
                        <ButtonLink
                            to={{ pathname: TEXT_CHECKER, state: { lang: 'en', text: '' } }}
                            size="large"
                            className={s.buttonEn}
                            primary
                        >
                            {t('home.ad.textchecker.ctaEn')}
                        </ButtonLink>
                        <ButtonLink
                            to={{ pathname: TEXT_CHECKER, state: { lang: 'de', text: '' } }}
                            size="large"
                            className={s.buttonDe}
                            primary
                        >
                            {t('home.ad.textchecker.ctaDe')}
                        </ButtonLink>
                    </>
                }
                image={textCheckerIllustration}
            >
                <p>{t('home.ad.textchecker.text')}</p>
            </Box>
            <Box
                title={t('home.ad.terms.title')}
                buttons={
                    <>
                        <ButtonLink primary to={TERMS} size="large">
                            {t('home.ad.terms.button')}
                        </ButtonLink>
                    </>
                }
                image={termsAndDiscussion}
            >
                <p>{t('home.ad.terms.text')}</p>
            </Box>
            <Box
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
            </Box>
            <Box
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
            </Box>
        </>
    );
}

function Box({
    children,
    title,
    buttons,
    image,
}: {
    children?: React.ReactNode;
    title: React.ReactNode;
    buttons?: React.ReactNode;
    image?: string;
}) {
    return (
        <section className={s.box}>
            <div>
                <h1 className={s.boxTitle}>{title}</h1>
                <div className={s.boxText}>{children}</div>
                {buttons && <div className={s.buttons}>{buttons}</div>}
            </div>
            {image && <img className={s.image} src={image} alt="" />}
        </section>
    );
}
