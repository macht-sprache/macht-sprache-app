import './setup';
import { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import { AppContextProviderExtension } from '../hooks/appContext';
import { TranslationProvider } from '../i18n/config';
import { LangProvider } from '../useLang';
import { useLangCssVars } from '../useLangCssVars';
import '../vars.css';
import { Checker } from './Checker';
import { useDeeplEnvironment } from './deepl/useEnvironment';

const reactRootElement = document.createElement('div');
document.body.append(reactRootElement);

function App() {
    useLangCssVars();
    const [showGenderModal, setShowGenderModal] = useState(false);
    const onCloseGenderModal = useCallback(() => setShowGenderModal(false), []);
    const onOpenGenderModal = useCallback(() => setShowGenderModal(true), []);
    const { env, onUpdate } = useDeeplEnvironment(onOpenGenderModal);
    return (
        <Checker
            env={env}
            onUpdate={onUpdate}
            showGenderModal={showGenderModal}
            onCloseGenderModal={onCloseGenderModal}
        />
    );
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
