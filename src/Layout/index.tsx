import { OverlayProvider } from '@react-aria/overlays';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useLocation } from 'react-router-dom';
import LinkButton from '../LinkButton';
import { ABOUT, CODE_OF_CONDUCT, IMPRINT, NEWS, PRIVACY, TERMS } from '../routes';
import { TopMenu } from '../TopMenu';
import { useDomId } from '../useDomId';
import { useLaunched } from '../useLaunched';
import Logo from './logo.svg';
import LogoSmall from './logo_small.svg';
import s from './style.module.css';

type Props = {
    children: React.ReactNode;
};

function Layout({ children }: Props) {
    const { t } = useTranslation();
    const id = useDomId();
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        document.body.classList.toggle(s.bodyMenuOpen, menuOpen);
    }, [menuOpen]);

    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    return (
        <OverlayProvider>
            <div className={s.container}>
                <div className={s.mobileHeaderBar}>
                    <Link className={s.mobileHeaderBarLogo} to="/">
                        <img className={s.mobileHeaderBarLogoImage} src={LogoSmall} alt={t('nav.logoAlt')} />
                    </Link>
                    <LinkButton
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-expanded={menuOpen}
                        aria-controls={id('menu')}
                    >
                        Menu
                    </LinkButton>
                </div>
                <div id={id('menu')} className={clsx(s.sidebar, { [s.open]: menuOpen })}>
                    <div className={s.header}>
                        <Link className={s.logo} to="/">
                            <img className={s.logoImg} src={Logo} alt={t('nav.logoAlt')} />
                        </Link>
                    </div>
                    <div className={s.topRightMenu}>
                        <TopMenu />
                    </div>
                    <Footer />
                </div>
                <main className={s.main}>{children}</main>
                <div className={s.background} />
            </div>
        </OverlayProvider>
    );
}

export default Layout;

function Footer() {
    const { t } = useTranslation();
    const launched = useLaunched();

    let footerLinks = [
        {
            to: ABOUT,
            label: t('nav.about'),
        },
        {
            to: CODE_OF_CONDUCT,
            label: t('nav.coc'),
        },
        {
            to: IMPRINT,
            label: t('nav.imprint'),
        },
        {
            to: PRIVACY,
            label: t('nav.privacyPolicy'),
        },
    ];

    if (launched) {
        footerLinks = [
            {
                to: TERMS,
                label: t('common.entities.term.value_plural'),
            },
            {
                to: NEWS,
                label: t('nav.news'),
            },
            ...footerLinks,
        ];
    }

    return (
        <footer className={s.footer}>
            <div className={s.footerInner}>
                {footerLinks.map(({ to, label }, index) => (
                    <NavLink key={index} className={s.footerLink} activeClassName={s.footerLinkActive} to={to}>
                        {label}
                    </NavLink>
                ))}
            </div>
        </footer>
    );
}
