import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import s from './style.module.css';
import Logo from './logo.svg';

type Props = {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    topRightMenu?: React.ReactNode;
};

function Layout({ children, sidebar, topRightMenu }: Props) {
    const { t } = useTranslation();
    return (
        <div className={s.container}>
            <div className={s.sidebar}>
                <div className={s.header}>
                    <Link className={s.logo} to="/">
                        <img className={s.logoImg} src={Logo} alt={t('nav.logoAlt')} />
                    </Link>
                </div>
                <div className={s.sidebarInner}>
                    <div className={s.sidebarInnerInner}>{sidebar}</div>
                </div>
            </div>
            <div className={s.topRightMenu}>{topRightMenu}</div>
            <main className={s.main}>{children}</main>
            <div className={s.background} />
        </div>
    );
}

export default Layout;
