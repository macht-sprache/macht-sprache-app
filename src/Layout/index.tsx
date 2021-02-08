import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router-dom';
import s from './style.module.css';
import Logo from './logo.svg';
import Nav from '../Nav';
import { TopMenu } from '../TopMenu';
import { ABOUT, IMPRINT, CODE_OF_CONDUCT } from '../routes';

type Props = {
    children: React.ReactNode;
};

function Layout({ children }: Props) {
    const { t } = useTranslation();

    const FOOTER_LINKS = [
        {
            to: ABOUT,
            label: t('nav.about'),
        },
        {
            to: IMPRINT,
            label: t('nav.imprint'),
        },
        {
            to: CODE_OF_CONDUCT,
            label: t('nav.coc'),
        },
    ];

    return (
        <div className={s.container}>
            <div className={s.sidebar}>
                <div className={s.header}>
                    <Link className={s.logo} to="/">
                        <img className={s.logoImg} src={Logo} alt={t('nav.logoAlt')} />
                    </Link>
                </div>
                <div className={s.sidebarInner}>
                    <div className={s.sidebarInnerInner}>
                        <Nav />
                    </div>
                </div>
                <footer className={s.footer}>
                    <div className={s.footerInner}>
                        {FOOTER_LINKS.map(({ to, label }, index) => (
                            <NavLink key={index} className={s.footerLink} activeClassName={s.footerLinkActive} to={to}>
                                {label}
                            </NavLink>
                        ))}
                    </div>
                </footer>
            </div>
            <div className={s.topRightMenu}>
                <TopMenu />
            </div>
            <main className={s.main}>{children}</main>
            <div className={s.background} />
        </div>
    );
}

export default Layout;
