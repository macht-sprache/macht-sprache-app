import './setup';
import ReactDOM from 'react-dom';
import { AppContextProviderExtension } from '../hooks/appContext';
import { TranslationProviderExtension } from '../i18n/config';
import { useLangCssVars } from '../useLangCssVars';
import '../vars.css';
import { Checker } from './Checker';
import { useGoogleTranslatedEnvironment } from './hooks';

const reactRootElement = document.createElement('div');
document.body.append(reactRootElement);

function App() {
    useLangCssVars();
    const { env, onUpdate } = useGoogleTranslatedEnvironment();
    return <Checker env={env} onUpdate={onUpdate} />;
}

ReactDOM.render(
    <AppContextProviderExtension>
        <TranslationProviderExtension>
            <App />
        </TranslationProviderExtension>
    </AppContextProviderExtension>,
    reactRootElement
);
