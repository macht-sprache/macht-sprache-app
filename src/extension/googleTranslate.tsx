import './setup';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import { useGoogleTranslatedEnvironment } from './hooks';
import { Button } from './Button';
// import { TranslationOverlay } from './TranslationOverlay';
import { Checker, OnUpdate } from './Checker';
import { useCallback, useEffect } from 'react';

const reactRootElement = document.createElement('div');
document.body.append(reactRootElement);

function App() {
    const translatorEnv = useGoogleTranslatedEnvironment();
    const onUpdate = useCallback<OnUpdate>((status, matches, openModal) => {
        // update google translate UI here
        console.log('onUpdate', status, matches);
    }, []);

    const buttonRow = translatorEnv?.el?.lastChild as HTMLElement;

    useEffect(() => {
        if (buttonRow) {
            buttonRow.insertAdjacentHTML('afterbegin', ReactDOMServer.renderToStaticMarkup(<Button />));
        }
    }, [buttonRow]);

    return (
        <>
            <Checker env={translatorEnv} onUpdate={onUpdate} />
            {/* {translatedText.el && <TranslationOverlay parentElement={translatedText.el} text={translatedText.text} />} */} */}
        </>
    );
}

ReactDOM.render(<App />, reactRootElement);
