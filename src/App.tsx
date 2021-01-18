import Layout from './Layout';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './HomePage';
import Nav from './Nav';
import TermPage from './TermPage';
import ElementTestPage from './ElementTestPage';

function App() {
    return (
        <Router>
            <Layout sidebar={<Nav />} topRightMenu={<a href="/">Login</a>}>
                <Switch>
                    <Route path="/" exact>
                        <HomePage />
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
