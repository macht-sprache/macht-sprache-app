import { useCallback, useEffect, useRef, useState } from 'react';
import { OnUpdate } from './Checker';
import { isButton, renderButton } from './googleTranslate/button';
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
        const textToCheck = newResult.text?.substring(
            0,
            newResult.matches?.length && newResult.matches[newResult.matches.length - 1].pos[1]
        );
        const canUpdate = newEnv.lang === newResult.lang && textToCheck && newEnv.text?.startsWith(textToCheck);
        renderOverlay({ el: elRef.current, ...(canUpdate ? newResult : {}) });

        renderButton({ el: elRef.current, status: newResult.status, hasResult: !!newResult.matches?.length });
    }, []);

    const onUpdate: OnUpdate = useCallback(
        (result: CheckerResult) => {
            checkerResultRef.current = { ...checkerResultRef.current, ...result };
            render(envRef.current, checkerResultRef.current);
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
            if (mutations.every(mutation => isOverlay(mutation.target) || isButton(mutation.target))) {
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
                };

                render(newEnv, checkerResultRef.current);
                setEnv(newEnv);
            }
        }
    }, [render]);

    return { env, onUpdate };
};
