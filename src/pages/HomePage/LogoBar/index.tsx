import React from 'react';
import { useTranslation } from 'react-i18next';
import { langA, langB } from '../../../languages';
import deeptech from './Logos/deeptech.png';
import goethe from './Logos/goethe.svg';
import PTF from './Logos/PrototypeFund.svg';
import senatEn from './Logos/senat_en.svg';
import senatDe from './Logos/senat_de.svg';
import wikimedia from './Logos/wikimedia-de-logo.svg';
import s from './style.module.css';
import { useLang } from '../../../useLang';

type Logo = {
    img: string | { [langA]: string; [langB]: string };
    label: string;
};

const logosSupporters: Logo[] = [
    {
        img: PTF,
        label: 'Prototype Fund',
    },
    {
        img: {
            [langA]: senatEn,
            [langB]: senatDe,
        },
        label: 'Senate Department of Culture and Europe Berlin',
    },
    {
        img: deeptech,
        label: 'Deep Tech Award 2022',
    },
    {
        img: wikimedia,
        label: 'Unlock – a project by Wikimedia Deutschland e.V.',
    },
];

const logosPartners: Logo[] = [
    {
        img: goethe,
        label: 'Goethe Institut',
    },
];

export function LogoBar() {
    const { t } = useTranslation();

    return (
        <section className={s.container}>
            <div className={s.inner}>
                <LogoSection title={t('home.logos.supporters')} logos={logosSupporters} />
                <LogoSection title={t('home.logos.coorporationPartners')} logos={logosPartners} />
            </div>
        </section>
    );
}

export function LogoSection({ logos, title }: { logos: Logo[]; title: React.ReactNode }) {
    const [lang] = useLang();

    return (
        <div className={s.logoSection}>
            <h1 className={s.heading}>{title}</h1>
            <ul className={s.logos}>
                {logos.map(({ img, label }) => (
                    <li className={s.logoWrapper} key={label}>
                        <img
                            className={s.logo}
                            src={typeof img === 'string' ? img : img[lang]}
                            alt={label}
                            title={label}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}
