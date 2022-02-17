import './setup';
import ReactDOM from 'react-dom';
import { AppContextProviderExtension } from '../hooks/appContext';
import { TranslationProvider } from '../i18n/config';
import { LangProvider } from '../useLang';
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
        <TranslationProvider>
            <LangProvider>
                <App />
            </LangProvider>
        </TranslationProvider>
    </AppContextProviderExtension>,
    reactRootElement
);
