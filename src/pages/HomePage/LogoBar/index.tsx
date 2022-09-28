import s from './style.module.css';
import PTF from './Logos/PrototypeFund.svg';
import senat from './Logos/senat_en.svg';
import goethe from './Logos/goethe.svg';
import deeptech from './Logos/deeptech.png';
import wikimedia from './Logos/wikimedia-de-logo.svg';
import { useTranslation } from 'react-i18next';
import React from 'react';

type Logo = { img: string; label: string };

const logosSupporters: Logo[] = [
    {
        img: PTF,
        label: 'Prototype Fund',
    },
    {
        img: senat,
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
    return (
        <div className={s.logoSection}>
            <h1 className={s.heading}>{title}</h1>
            <ul className={s.logos}>
                {logos.map(({ img, label }) => (
                    <li className={s.logoWrapper} key={img}>
                        <img className={s.logo} src={img} alt={label} title={label} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
