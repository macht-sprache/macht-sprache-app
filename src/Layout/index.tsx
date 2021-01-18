import s from './style.module.css';

type Props = {
    title: string;
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    topRightMenu?: React.ReactNode;
};

function Layout({ title, children, sidebar, topRightMenu }: Props) {
    return (
        <div className={s.container}>
            <div className={s.sidebar}>
                <div className={s.sidebarInner}>
                    <div className={s.sidebarInnerInner}>
                        <div className={s.logo}>macht.sprache.</div>
                        {sidebar}
                    </div>
                </div>
            </div>
            <div className={s.topRightMenu}>{topRightMenu}</div>
            <main className={s.main}>
                <h1>{title}</h1>
                {children}
            </main>
        </div>
    );
}

export default Layout;
