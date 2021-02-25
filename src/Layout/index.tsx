import { useTranslation } from 'react-i18next';
import { Link, NavLink, useLocation } from 'react-router-dom';
import s from './style.module.css';
import Logo from './logo.svg';
import { Terms } from '../Terms';
import { TopMenu } from '../TopMenu';
import { ABOUT, IMPRINT, CODE_OF_CONDUCT } from '../routes';
import LinkButton from '../LinkButton';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useLaunched } from '../useLaunched';
import { OverlayProvider } from '@react-aria/overlays';

type Props = {
    children: React.ReactNode;
};

function Layout({ children }: Props) {
    const { t } = useTranslation();
    const [domIdMenu] = useState('idMenu_' + Math.random());
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const [loggedInOrLaunched] = useLaunched();

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
                        <img className={s.mobileHeaderBarLogoImage} src={Logo} alt={t('nav.logoAlt')} />
                    </Link>
                    <LinkButton
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-expanded={menuOpen}
                        aria-controls={domIdMenu}
                    >
                        Menu
                    </LinkButton>
                </div>
                <div id={domIdMenu} className={clsx(s.sidebar, { [s.open]: menuOpen })}>
                    <div className={s.header}>
                        <Link className={s.logo} to="/">
                            <img className={s.logoImg} src={Logo} alt={t('nav.logoAlt')} />
                        </Link>
                    </div>
                    <div className={s.topRightMenu}>
                        <TopMenu />
                    </div>
                    {loggedInOrLaunched && (
                        <Terms
                            classNames={{
                                terms: s.terms,
                                termsInner: s.termsInner,
                                termsControl: s.termsControl,
                                termsControlInner: s.termsControlInner,
                            }}
                        />
                    )}
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
    const [launched] = useLaunched();

    let footerLinks = [
        {
            to: IMPRINT,
            label: t('nav.imprint'),
        },
        {
            to: CODE_OF_CONDUCT,
            label: t('nav.coc'),
        },
    ];

    if (launched) {
        footerLinks = [
            ...footerLinks,
            {
                to: ABOUT,
                label: t('nav.about'),
            },
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
