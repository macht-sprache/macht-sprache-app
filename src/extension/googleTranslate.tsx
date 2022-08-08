import { overlayPortalElement, reactRootElement, shadowRoot } from './setup';
import { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import { AppContextProviderExtension } from '../hooks/appContext';
import { TranslationProvider } from '../i18n/config';
import { LangProvider } from '../useLang';
import { useLangCssVars } from '../useLangCssVars';
import '../vars.css';
import { Checker } from './Checker';
import { useGoogleTranslateEnvironment } from './googleTranslate/useEnvironment';

function App() {
    useLangCssVars();
    useLangCssVars(shadowRoot);
    const [showGenderModal, setShowGenderModal] = useState(false);
    const onCloseGenderModal = useCallback(() => setShowGenderModal(false), []);
    const onOpenGenderModal = useCallback(() => setShowGenderModal(true), []);
    const { env, onUpdate } = useGoogleTranslateEnvironment(onOpenGenderModal);
    return (
        <Checker
            env={env}
            onUpdate={onUpdate}
            showGenderModal={showGenderModal}
            onCloseGenderModal={onCloseGenderModal}
            portalContainer={overlayPortalElement}
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
