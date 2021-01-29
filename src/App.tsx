import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { useEnsureUserEntity, UserProvider } from './authHooks';
import ElementTestPage from './ElementTestPage';
import HomePage from './HomePage';
import { TranslationProvider } from './i18n/config';
import Layout from './Layout';
import LoginPage from './LoginPage';
import Nav from './Nav';
import RegisterPage from './RegisterPage';
import RegisterPostPage from './RegisterPostPage';
import * as routes from './routes';
import TermPage from './TermPage';
import { TopMenu } from './TopMenu';
import { useLangCssVars } from './useLangCssVars';

function App() {
    useLangCssVars();
    const user = useEnsureUserEntity();

    return (
        <UserProvider value={user}>
            <TranslationProvider>
                <Router>
                    <Layout sidebar={<Nav />} topRightMenu={<TopMenu />}>
                        <Switch>
                            <Route path={routes.HOME} exact>
                                <HomePage />
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
                            <Route path={routes.TERM} exact>
                                <TermPage />
                            </Route>
                            <Route path="/elementTest" exact>
                                <ElementTestPage />
                            </Route>
                        </Switch>
                    </Layout>
                </Router>
            </TranslationProvider>
        </UserProvider>
    );
}

export default App;
