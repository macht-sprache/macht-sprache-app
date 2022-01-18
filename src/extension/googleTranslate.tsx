import './setup';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import { useGoogleTranslatedEnvironment } from './hooks';
import { Button } from './Button';
import { TranslationOverlay } from './TranslationOverlay';
import { Checker, OnUpdate } from './Checker';
import { useCallback, useEffect, useState } from 'react';
import { Status } from './types';
import { MatchGroup } from '../components/TextChecker/TextCheckerResult/hooks';

const reactRootElement = document.createElement('div');
document.body.append(reactRootElement);

function App() {
    const translatorEnv = useGoogleTranslatedEnvironment();
    const [status, setStatus] = useState<Status>();
    const [matches, setMatches] = useState<MatchGroup[]>();
    const onUpdate = useCallback<OnUpdate>((status, matches, openModal) => {
        setStatus(status);
        setMatches(matches);
        // update google translate UI here
        console.log('onUpdate', status, matches);
    }, []);

    const buttonRow = translatorEnv?.el?.lastChild as HTMLElement;
    const [buttonContainer, setButtonContainer] = useState<HTMLElement>();

    useEffect(() => {
        if (buttonRow) {
            const container = document.createElement('div');
            buttonRow.prepend(container);
            setButtonContainer(container);
        }
    }, [buttonRow]);

    useEffect(() => {
        if (buttonContainer) {
            buttonContainer.innerHTML = ReactDOMServer.renderToStaticMarkup(<Button status={status} />);
        }
    }, [buttonContainer, status]);

    return (
        <>
            <Checker env={translatorEnv} onUpdate={onUpdate} />
            <TranslationOverlay matches={matches} env={translatorEnv} />
        </>
    );
}

ReactDOM.render(<App />, reactRootElement);
