import './setup';
import ReactDOM from 'react-dom';
import { Checker } from './Checker';
import { useGoogleTranslatedEnvironment } from './hooks';
import { TranslationProviderExtension } from '../i18n/config';
import '../vars.css';
import { useLangCssVars } from '../useLangCssVars';

const reactRootElement = document.createElement('div');
document.body.append(reactRootElement);

function App() {
    useLangCssVars();
    const { env, onUpdate } = useGoogleTranslatedEnvironment();

    return (
        <>
            <Checker env={env} onUpdate={onUpdate} />
            {/* <TranslationOverlay matches={matches} env={translatorEnv} /> */}
        </>
    );
}

ReactDOM.render(
    <TranslationProviderExtension>
        <App />
    </TranslationProviderExtension>,
    reactRootElement
);
