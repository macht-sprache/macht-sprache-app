import { Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { FirebaseAppProvider } from 'reactfire';
import AddTermPage from './AddTermPage';
import { AddTranslationExamplePage } from './AddTranslationExamplePage';
import AddTranslationPage from './AddTranslationPage';
import ElementTestPage from './ElementTestPage';
import ErrorBoundary from './ErrorBoundary';
import { app } from './firebase';
import HomePage from './HomePage';
import { HomePagePreLaunch } from './HomePagePreLaunch';
import { AppContextProvider } from './hooks/auth';
import { TranslationProvider } from './i18n/config';
import Layout from './Layout';
import LoginPage from './LoginPage';
import { NotFoundPage } from './NotFoundPage';
import PageLoadingState from './PageLoadingState';
import RegisterPage from './RegisterPage';
import RegisterPostPage from './RegisterPostPage';
import * as routes from './routes';
import { StaticContentPage } from './StaticContentPage';
import TermPage from './TermPage';
import { TranslationExamplePage } from './TranslationExamplePage';
import { TranslationPage } from './TranslationPage';
import { LangProvider } from './useLang';
import { useLangCssVars } from './useLangCssVars';
import { useLaunched } from './useLaunched';

function App() {
    useLangCssVars();

    return (
        <FirebaseAppProvider firebaseApp={app} suspense>
            <AppContextProvider>
                <TranslationProvider>
                    <LangProvider>
                        <AppRouter />
                    </LangProvider>
                </TranslationProvider>
            </AppContextProvider>
        </FirebaseAppProvider>
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
                            <Route path={routes.TERM_ADD} exact>
                                <AddTermPage />
                            </Route>
                            <Route path={routes.TERM} exact>
                                <TermPage />
                            </Route>
                            <Route path={routes.TRANSLATION_ADD} exact>
                                <AddTranslationPage />
                            </Route>
                            <Route path={routes.TRANSLATION} exact>
                                <TranslationPage />
                            </Route>
                            <Route path={routes.TRANSLATION_EXAMPLE_ADD} exact>
                                <AddTranslationExamplePage />
                            </Route>
                            <Route path={routes.TRANSLATION_EXAMPLE} exact>
                                <TranslationExamplePage />
                            </Route>
                            <Route path={routes.ABOUT} exact>
                                <StaticContentPage slugs={{ en: 'about-case-sensitive', de: 'ueber-macht-sprache' }} />
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

export default App;
