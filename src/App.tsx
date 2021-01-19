import Layout from './Layout';
import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom';
import HomePage from './HomePage';
import Nav from './Nav';
import TermPage from './TermPage';
import ElementTestPage from './ElementTestPage';
import RegisterPage from './RegisterPage';
import LoginPage from './LoginPage';

function App() {
    return (
        <Router>
            <Layout
                sidebar={<Nav />}
                topRightMenu={
                    <>
                        <Link to="/signup">Sign up</Link> <Link to="/login">Login</Link>
                    </>
                }
            >
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
    );
}

export default App;
