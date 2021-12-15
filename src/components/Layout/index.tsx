import { OverlayProvider } from '@react-aria/overlays';
import clsx from 'clsx';
import React, { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, Link, NavLink, useHistory, useLocation } from 'react-router-dom';
import { useUser, useUserProperties } from '../../hooks/appContext';
import { collections } from '../../hooks/data';
import { useCollection } from '../../hooks/fetch';
import {
    ABOUT,
    ADMIN,
    CODE_OF_CONDUCT,
    IMPRINT,
    MANIFESTO,
    NEWS,
    PRIVACY,
    TERMS,
    TERM_SIDEBAR,
    TEXT_CHECKER,
} from '../../routes';
import { useDomId } from '../../useDomId';
import { useLaunched } from '../../useLaunched';
import { ContentWarning } from '../ContentWarning';
import LinkButton from '../LinkButton';
import Notifications from '../Notifications';
import { TopMenu } from '../TopMenu';
import Footer from './Footer';
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
    const history = useHistory();
    const location = useLocation();
    const user = useUser();

    useEffect(() => {
        document.body.classList.toggle(s.bodyMenuOpen, menuOpen);
    }, [menuOpen]);

    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    useEffect(() => {
        if (history.action === 'PUSH' && !location.hash) {
            window.scrollTo(0, 0);
        }
    }, [history.action, location.hash, location.pathname]);

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
                    {user && <Notifications userId={user.id} />}
                </div>
                <div id={id('menu')} className={clsx(s.menus, { [s.open]: menuOpen })}>
                    <div className={s.header}>
                        <Link className={s.logo} to="/">
                            <img className={s.logoImg} src={Logo} alt={t('nav.logoAlt')} />
                        </Link>
                    </div>
                    <div className={s.topRightMenu}>
                        <TopMenu />
                        {user && <Notifications userId={user.id} />}
                    </div>
                    <Sidebar />
                </div>
                <main className={s.main}>{children}</main>
                <Footer className={s.footer} />
                <div className={s.background} />
                <ContentWarning />
            </div>
        </OverlayProvider>
    );
}

export default Layout;

type LinkItem = {
    to: string;
    label: string;
};

function Sidebar() {
    const { t } = useTranslation();
    const launched = useLaunched();
    const userProperties = useUserProperties();

    return (
        <div className={s.sidebar}>
            <nav className={s.sidebarInner}>
                {launched && (
                    <>
                        <NavItem to={TEXT_CHECKER} label={t('textChecker.title')} />
                        <NavItem to={MANIFESTO} label={'Manifesto'} />
                        <NavItem to={TERMS} label={t('common.entities.term.value_plural')} />
                        <Suspense fallback={null}>
                            <SidebarTerms />
                        </Suspense>
                    </>
                )}
                <NavItem to={ABOUT} label={t('nav.about')} />
                <NavItem to={CODE_OF_CONDUCT} label={t('nav.coc')} />
                {launched && <NavItem to={NEWS} label={t('nav.news')} />}
            </nav>
            <footer className={s.sidebarInner}>
                {userProperties?.admin && <NavItem to={ADMIN} label="admin" />}
                <NavItem to={IMPRINT} label={t('nav.imprint')} />
                <NavItem to={PRIVACY} label={t('nav.privacyPolicy')} />
            </footer>
        </div>
    );
}

function SidebarNav({ links }: { links: LinkItem[] }) {
    return (
        <>
            {links.map(link => (
                <NavItem key={link.to} {...link} />
            ))}
        </>
    );
}

function NavItem({ to, label }: LinkItem) {
    return (
        <NavLink className={s.sidebarLink} activeClassName={s.sidebarLinkActive} to={to}>
            {label}
        </NavLink>
    );
}

function SidebarTerms() {
    const getTerms = useCollection(collections.terms.where('adminTags.showInSidebar', '==', true));
    const sidebarTerms = [...getTerms()].sort((termA, termB) => termA.value.localeCompare(termB.value, termA.lang));
    const links = sidebarTerms.map(term => ({
        label: term.value,
        to: generatePath(TERM_SIDEBAR, { termId: term.id }),
    }));

    return <SidebarNav links={links} />;
}
