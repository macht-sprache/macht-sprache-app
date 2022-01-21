import { useCallback, useEffect, useRef, useState } from 'react';
import { OnUpdate } from './Checker';
import { isOverlay, renderOverlay } from './googleTranslate/overlay';
import { CheckerResult, TranslatorEnvironment } from './types';

const TRANSLATED_TEXT_ELEMENT_SELECTOR = '[data-language][data-original-language]';

export const useGoogleTranslatedEnvironment = () => {
    const elRef = useRef<HTMLElement>();
    const [env, setEnv] = useState<TranslatorEnvironment>({});
    const checkerResultRef = useRef<CheckerResult>({ status: 'inactive' });
    const envRef = useRef<TranslatorEnvironment>({});

    useEffect(() => {
        envRef.current = env;
    }, [env]);

    const render = useCallback((newEnv: TranslatorEnvironment, newResult: CheckerResult) => {
        const canUpdate = newEnv.lang === newResult.lang && newEnv.text === newResult.text;
        renderOverlay({ el: elRef.current, ...(canUpdate ? newResult : {}) });
    }, []);

    const onUpdate: OnUpdate = useCallback(
        (result: CheckerResult) => {
            checkerResultRef.current = result;
            render(envRef.current, result);
        },
        [render]
    );

    useEffect(() => {
        let translatedTextElementParent: HTMLElement | null = null;
        const initializeInterval = setInterval(initialize, 100);

        function initialize() {
            const translatedTextElement = document.querySelector(TRANSLATED_TEXT_ELEMENT_SELECTOR);
            if (!translatedTextElement) {
                return;
            }
            clearInterval(initializeInterval);
            translatedTextElementParent = translatedTextElement.parentNode as HTMLElement;
            const observerChildren = new MutationObserver(observeChildren);
            observerChildren.observe(translatedTextElementParent, {
                childList: true,
                subtree: true,
            });
            update();
        }

        const observeChildren: MutationCallback = mutations => {
            if (mutations.every(mutation => isOverlay(mutation.target))) {
                return;
            }
            update();
        };

        function update() {
            const translatedTextElement = translatedTextElementParent!.querySelector(
                TRANSLATED_TEXT_ELEMENT_SELECTOR
            ) as HTMLElement;
            if (translatedTextElement) {
                elRef.current = translatedTextElement;
                console.log('setting');
                const newEnv = {
                    lang: translatedTextElement.dataset.language,
                    originalLang: translatedTextElement.dataset.originalLanguage,
                    // @ts-ignore
                    text: translatedTextElement.firstChild?.innerText,
                    // el: translatedTextElement,
                };

                render(newEnv, checkerResultRef.current);
                setEnv(newEnv);
            }
        }
    }, [render]);

    return { env, onUpdate };
};
