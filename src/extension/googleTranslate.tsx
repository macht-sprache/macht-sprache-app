import './setup';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import { useGoogleTranslatedEnvironment } from './hooks';
import { Button } from './Button';
import { TranslationOverlay } from './TranslationOverlay';
import { Checker, OnUpdate } from './Checker';
import { useCallback, useEffect, useState } from 'react';
import { CheckerResult, Status } from './types';
import { MatchGroup } from '../components/TextChecker/TextCheckerResult/hooks';
import { Lang } from '../types';

const reactRootElement = document.createElement('div');
document.body.append(reactRootElement);

function App() {
    // setState (translatorenv (text, languages))
    // setState (text w/ matches, lang)
    const { env, onUpdate } = useGoogleTranslatedEnvironment();

    // const buttonRow = translatorEnv?.el?.lastChild as HTMLElement;
    // const [buttonContainer, setButtonContainer] = useState<HTMLElement>();

    // useEffect(() => {
    //     // console.log('adding container', buttonRow);
    //     if (buttonRow) {
    //         const container = document.createElement('div');
    //         buttonRow.prepend(container);
    //         setButtonContainer(container);
    //     }
    // // }, [buttonRow, translatorEnv?.el]);

    // useEffect(() => {
    //     // console.log('updating html', buttonContainer);
    //     if (buttonContainer) {
    //         buttonContainer.innerHTML = ReactDOMServer.renderToStaticMarkup(<Button status={status} />);
    //     }
    // }, [buttonContainer, status]);

    return (
        <>
            <Checker env={env} onUpdate={onUpdate} />
            {/* <TranslationOverlay matches={matches} env={translatorEnv} /> */}
        </>
    );
}

ReactDOM.render(<App />, reactRootElement);
