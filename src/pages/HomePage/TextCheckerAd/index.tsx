import { useTranslation } from 'react-i18next';
import { ButtonLink } from '../../../components/Form/Button';
import { EXTENSION, TERMS, TEXT_CHECKER } from '../../../routes';
import s from './style.module.css';
import React from 'react';
import textCheckerIllustration from './textChecker.svg';
import termsAndDiscussion from './termsDiscussionHorizontal.svg';
import googleDeepL from './googleDeepL.svg';

export default function TextCheckerAd() {
    const { t } = useTranslation();

    return (
        <>
            <Box
                title={t('home.ad.textchecker.title')}
                buttons={
                    <>
                        <ButtonLink to={TEXT_CHECKER}>{t('home.ad.textchecker.ctaEn')}</ButtonLink>
                        <ButtonLink to={TEXT_CHECKER}>{t('home.ad.textchecker.ctaDe')}</ButtonLink>
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
                        <ButtonLink to={TERMS}>{t('home.ad.terms.all')}</ButtonLink>
                        <ButtonLink to={TERMS}>{t('home.ad.terms.de')}</ButtonLink>
                        <ButtonLink to={TERMS}>{t('home.ad.terms.en')}</ButtonLink>
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
                        <ButtonLink to={EXTENSION}>{t('home.ad.extension.chrome')}</ButtonLink>
                        <ButtonLink to={EXTENSION}>{t('home.ad.extension.firefox')}</ButtonLink>
                    </>
                }
                image={googleDeepL}
            >
                <p>{t('home.ad.extension.text')}</p>
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
