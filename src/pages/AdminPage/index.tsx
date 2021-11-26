import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Switch } from 'react-router';
import { NavLink, NavLinkProps } from 'react-router-dom';
import DividedList from '../../components/DividedList';
import Header from '../../components/Header';
import PageTitle from '../../components/PageTitle';
import { ADMIN, ADMIN_COMMENTS, ADMIN_CONTENT } from '../../routes';
import AdminCommentsPage from './AdminCommentsPage';
import AdminContentPage from './AdminContentPage';
import AdminPageGeneral from './AdminGeneralPage';
import style from './style.module.css';

export default function AdminPage() {
    const { t } = useTranslation();
    return (
        <>
            <PageTitle title="Administration" />
            <Header subLine={<Nav />}>Administration</Header>
            <Suspense fallback={t('common.loading')}>
                <Switch>
                    <Route path={ADMIN} exact>
                        <AdminPageGeneral />
                    </Route>
                    <Route path={ADMIN_COMMENTS} exact>
                        <AdminCommentsPage />
                    </Route>
                    <Route path={ADMIN_CONTENT} exact>
                        <AdminContentPage />
                    </Route>
                </Switch>
            </Suspense>
        </>
    );
}

const Nav = () => (
    <DividedList>
        <NavItem to={ADMIN}>General</NavItem>
        <NavItem to={ADMIN_COMMENTS}>Comments</NavItem>
        <NavItem to={ADMIN_CONTENT}>Content</NavItem>
    </DividedList>
);

const NavItem = (props: NavLinkProps) => <NavLink exact activeClassName={style.activeLink} {...props} />;
