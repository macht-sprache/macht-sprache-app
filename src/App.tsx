import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ElementTestPage from './ElementTestPage';
import HomePage from './HomePage';
import Layout from './Layout';
import LoginPage from './LoginPage';
import Nav from './Nav';
import RegisterPage from './RegisterPage';
import TermPage from './TermPage';
import { TopMenu } from './TopMenu';
import { useLangCssVars } from './useLangCssVars';
import { TranslationProvider } from './i18n/config';
import { useEnsureUserEntity, UserProvider } from './authHooks';

function App() {
    useLangCssVars();
    const user = useEnsureUserEntity();

    return (
        <UserProvider value={user}>
            <TranslationProvider>
                <Router>
                    <Layout sidebar={<Nav />} topRightMenu={<TopMenu />}>
                        <Switch>
                            <Route path="/" exact>
                                <HomePage />
                            </Route>
                            <Route path="/signup" exact>
                                <RegisterPage />
                            </Route>
                            <Route path="/login" exact>
                                <LoginPage />
                            </Route>
                            <Route path="/term/:termId" exact>
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
