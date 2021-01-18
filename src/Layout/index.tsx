import s from './style.module.css';

type Props = {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    topRightMenu?: React.ReactNode;
};

function Layout({ children, sidebar, topRightMenu }: Props) {
    return (
        <div className={s.container}>
            <div className={s.sidebar}>
                <div className={s.sidebarInner}>
                    <div className={s.sidebarInnerInner}>{sidebar}</div>
                </div>
            </div>
            <div className={s.topRightMenu}>{topRightMenu}</div>
            <main className={s.main}>{children}</main>
        </div>
    );
}

export default Layout;
