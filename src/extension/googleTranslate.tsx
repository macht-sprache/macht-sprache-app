import './setup';
// import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
// import { Button } from './Button';
import { useGoogleTranslatedEnvironment } from './hooks';
// import { TranslationOverlay } from './TranslationOverlay';
import { Checker, OnUpdate } from './Checker';
import { useCallback } from 'react';

const reactRootElement = document.createElement('div');
document.body.append(reactRootElement);

function App() {
    const translatorEnv = useGoogleTranslatedEnvironment();
    const onUpdate = useCallback<OnUpdate>((status, matches, openModal) => {
        // update google translate UI here
        console.log('onUpdate', status, matches);
    }, []);

    // const [buttonContainer, setButtonContainer] = useState<HTMLElement | null>();
    // const buttonRow = translatedText?.el?.lastChild as HTMLElement;

    // useEffect(() => {
    //     if (buttonRow) {
    //         const container = document.createElement('div');
    //         buttonRow.prepend(container);
    //         setButtonContainer(container);
    //     } else {
    //         setButtonContainer(null);
    //     }
    // }, [buttonRow]);

    return (
        <>
            <Checker env={translatorEnv} onUpdate={onUpdate} />
            {/* {buttonContainer && ReactDOM.createPortal(<Button />, buttonContainer)}
            {translatedText.el && <TranslationOverlay parentElement={translatedText.el} text={translatedText.text} />} */}
        </>
    );
}

ReactDOM.render(<App />, reactRootElement);
