import { Suspense } from 'react';
import { BrowserRouter as Router, Redirect, Route, RouteProps, Switch } from 'react-router-dom';
import AddTermPage from './AddTermPage';
import AddTranslationExamplePage from './AddTranslationExamplePage';
import AddTranslationPage from './AddTranslationPage';
import AdminContentPage from './AdminContentPage/lazy';
import AdminCommentsPage from './AdminCommentsPage/lazy';
import AdminPage from './AdminPage/lazy';
import ElementTestPage from './ElementTestPage/lazy';
import ErrorBoundary from './ErrorBoundary';
import ForgotPasswordPage from './ForgotPasswordPage';
import HomePage from './HomePage';
import { HomePagePreLaunch } from './HomePage/HomePagePreLaunch';
import { AppContextProvider, useUser, useUserProperties } from './hooks/appContext';
import { useAddContinueParam } from './hooks/location';
import { TranslationProvider } from './i18n/config';
import Layout from './Layout';
import LoginPage from './LoginPage';
import { NewsPage } from './NewsPage';
import { NotFoundPage } from './NotFoundPage';
import PageLoadingState from './PageLoadingState';
import RegisterPage from './RegisterPage';
import RegisterPostPage from './RegisterPostPage';
import * as routes from './routes';
import { StaticContentPage } from './StaticContentPage';
import TermPage from './TermPage';
import { TermsPage } from './TermsPage';
import TranslationExamplePage from './TranslationExamplePage';
import TranslationExampleRedirect from './TranslationExampleRedirect';
import TranslationPage from './TranslationPage';
import { LangProvider } from './useLang';
import { useLangCssVars } from './useLangCssVars';
import { useLaunched } from './useLaunched';
import UserPage from './UserPage';

function App() {
    useLangCssVars();

    return (
        <AppContextProvider>
            <TranslationProvider>
                <LangProvider>
                    <AppRouter />
                </LangProvider>
            </TranslationProvider>
        </AppContextProvider>
    );
}

function AppRouter() {
    const launched = useLaunched();

    return (
        <Router>
            <Layout>
                <ErrorBoundary>
                    <Suspense fallback={<PageLoadingState />}>
                        <Switch>
                            <Route path={routes.HOME} exact>
                                {launched ? <HomePage /> : <HomePagePreLaunch />}
                            </Route>
                            <Route path={routes.REGISTER} exact>
                                <RegisterPage />
                            </Route>
                            <Route path={routes.REGISTER_POST} exact>
                                <RegisterPostPage />
                            </Route>
                            <Route path={routes.LOGIN} exact>
                                <LoginPage />
                            </Route>
                            <Route path={routes.FORGOT_PASSWORD} exact>
                                <ForgotPasswordPage />
                            </Route>
                            <LoggedInRoute path={routes.TERM_ADD} exact>
                                <AddTermPage />
                            </LoggedInRoute>
                            <LaunchedRoute path={routes.TERMS} exact>
                                <TermsPage />
                            </LaunchedRoute>
                            <LaunchedRoute path={routes.TERM} exact>
                                <TermPage />
                            </LaunchedRoute>
                            <LaunchedRoute path={routes.TERM_SIDEBAR} exact>
                                <TermPage />
                            </LaunchedRoute>
                            <LoggedInRoute path={routes.TRANSLATION_ADD} exact>
                                <AddTranslationPage />
                            </LoggedInRoute>
                            <LoggedInRoute path={routes.TRANSLATION_ADD_SIDEBAR} exact>
                                <AddTranslationPage />
                            </LoggedInRoute>
                            <LaunchedRoute path={routes.TRANSLATION} exact>
                                <TranslationPage />
                            </LaunchedRoute>
                            <LaunchedRoute path={routes.TRANSLATION_SIDEBAR} exact>
                                <TranslationPage />
                            </LaunchedRoute>
                            <LoggedInRoute path={routes.TRANSLATION_EXAMPLE_ADD} exact>
                                <AddTranslationExamplePage />
                            </LoggedInRoute>
                            <LoggedInRoute path={routes.TRANSLATION_EXAMPLE_ADD_SIDEBAR} exact>
                                <AddTranslationExamplePage />
                            </LoggedInRoute>
                            <LaunchedRoute path={routes.TRANSLATION_EXAMPLE} exact>
                                <TranslationExamplePage />
                            </LaunchedRoute>
                            <LaunchedRoute path={routes.TRANSLATION_EXAMPLE_SIDEBAR} exact>
                                <TranslationExamplePage />
                            </LaunchedRoute>
                            <LaunchedRoute path={routes.TRANSLATION_EXAMPLE_REDIRECT} exact>
                                <TranslationExampleRedirect />
                            </LaunchedRoute>
                            <LaunchedRoute path={routes.USER} exact>
                                <UserPage />
                            </LaunchedRoute>
                            <AdminRoute path={routes.ADMIN} exact>
                                <AdminPage />
                            </AdminRoute>
                            <AdminRoute path={routes.ADMIN_CONTENT} exact>
                                <AdminContentPage />
                            </AdminRoute>
                            <AdminRoute path={routes.ADMIN_COMMENTS} exact>
                                <AdminCommentsPage />
                            </AdminRoute>
                            <LaunchedRoute path={routes.NEWS} exact>
                                <NewsPage />
                            </LaunchedRoute>
                            <Route path={routes.ABOUT} exact>
                                <StaticContentPage slugs={{ en: 'about-case-sensitive', de: 'ueber-macht-sprache' }} />
                            </Route>
                            <Route path={routes.PRIVACY} exact>
                                <StaticContentPage
                                    slugs={{ en: 'machtsprache-data-privacy', de: 'machtsprache-datenschutz' }}
                                />
                            </Route>
                            <Route path={routes.CODE_OF_CONDUCT} exact>
                                <StaticContentPage slugs={{ en: 'code-of-conduct', de: 'code-of-conduct' }} />
                            </Route>
                            <Route path={routes.IMPRINT} exact>
                                <StaticContentPage
                                    slugs={{ en: 'macht-sprache-imprint', de: 'macht-sprache-imprint' }}
                                />
                            </Route>

                            <Route path="/elementTest" exact>
                                <ElementTestPage />
                            </Route>

                            <Route>
                                <NotFoundPage />
                            </Route>
                        </Switch>
                    </Suspense>
                </ErrorBoundary>
            </Layout>
        </Router>
    );
}

function LoggedInRoute(props: RouteProps) {
    const user = useUser();

    if (user) {
        return <Route {...props} />;
    }

    return <RedirectToLogin />;
}

function LaunchedRoute(props: RouteProps) {
    const launched = useLaunched();

    if (launched) {
        return <Route {...props} />;
    }

    return <RedirectToLogin />;
}

function AdminRoute(props: RouteProps) {
    const userProperties = useUserProperties();

    if (userProperties?.admin) {
        return <Route {...props} />;
    }

    return <NotFoundPage />;
}

function RedirectToLogin() {
    const addContinueParam = useAddContinueParam();
    return <Redirect to={addContinueParam(routes.LOGIN)} />;
}

export default App;
