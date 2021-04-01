import { useMatomo } from '@datapunt/matomo-tracker-react';
import { OverlayProvider } from '@react-aria/overlays';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ContentWarning } from '../ContentWarning';
import { useUserProperties } from '../hooks/appContext';
import LinkButton from '../LinkButton';
import { ABOUT, ADMIN, CODE_OF_CONDUCT, IMPRINT, NEWS, PRIVACY, TERMS } from '../routes';
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
    const { trackPageView } = useMatomo();

    useEffect(() => {
        document.body.classList.toggle(s.bodyMenuOpen, menuOpen);
    }, [menuOpen]);

    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    useEffect(() => {
        trackPageView({ href: location.pathname });
    }, [trackPageView, location]);

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
                <div id={id('menu')} className={clsx(s.menus, { [s.open]: menuOpen })}>
                    <div className={s.header}>
                        <Link className={s.logo} to="/">
                            <img className={s.logoImg} src={Logo} alt={t('nav.logoAlt')} />
                        </Link>
                    </div>
                    <div className={s.topRightMenu}>
                        <TopMenu />
                    </div>
                    <Sidebar />
                </div>
                <main className={s.main}>{children}</main>
                <div className={s.background} />
                <ContentWarning />
            </div>
        </OverlayProvider>
    );
}

export default Layout;

function Sidebar() {
    const { t } = useTranslation();
    const launched = useLaunched();
    const userProperties = useUserProperties();

    let mainLinks = [
        {
            to: ABOUT,
            label: t('nav.about'),
        },
        {
            to: CODE_OF_CONDUCT,
            label: t('nav.coc'),
        },
    ];

    let footerLinks = [
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
        mainLinks = [
            {
                to: TERMS,
                label: t('common.entities.term.value_plural'),
            },
            {
                to: NEWS,
                label: t('nav.news'),
            },
            ...mainLinks,
        ];
    }

    if (userProperties?.admin) {
        mainLinks.push({
            to: ADMIN,
            label: 'administration',
        });
    }

    return (
        <div className={s.sidebar}>
            <nav className={s.sidebarInner}>
                <SidebarNav links={mainLinks} />
            </nav>
            <footer className={s.sidebarInner}>
                <SidebarNav links={footerLinks} />
            </footer>
        </div>
    );
}

function SidebarNav({ links }: { links: { to: string; label: string }[] }) {
    return (
        <>
            {links.map(({ to, label }, index) => (
                <NavLink key={index} className={s.sidebarLink} activeClassName={s.sidebarLinkActive} to={to}>
                    {label}
                </NavLink>
            ))}
        </>
    );
}
