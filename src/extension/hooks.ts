import { useCallback, useEffect, useRef, useState } from 'react';
import { isButton, renderButton } from './googleTranslate/button';
import { isOverlay, renderOverlay } from './googleTranslate/overlay';
import { CheckerResult, OnUpdate, TranslatorEnvironment } from './types';

const TRANSLATED_TEXT_ELEMENT_SELECTOR = '[data-language][data-original-language]';

export const useGoogleTranslatedEnvironment = () => {
    const elRef = useRef<HTMLElement>();
    const [env, setEnv] = useState<TranslatorEnvironment>({});
    const checkerResultRef = useRef<CheckerResult>({ status: 'inactive' });
    const openModalRef = useRef<(startPos: number) => void>(() => {});
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
        renderOverlay({ el: elRef.current, ...(canUpdate ? newResult : {}) }, openModalRef.current);
        renderButton({ el: elRef.current, status: newResult.status, hasResult: !!newResult.matches?.length });
    }, []);

    const onUpdate: OnUpdate = useCallback(
        (result, openModal) => {
            checkerResultRef.current = { ...checkerResultRef.current, ...result };
            if (openModal) {
                openModalRef.current = openModal;
            }
            render(envRef.current, checkerResultRef.current);
        },
        [render]
    );

    useEffect(() => {
        async function observeTranslator() {
            const translatedTextElementParent = await getTranslatedTextElementParent();
            const observerChildren = new MutationObserver(mutations => {
                if (mutations.every(mutation => isOverlay(mutation.target) || isButton(mutation.target))) {
                    return;
                }
                update();
            });
            observerChildren.observe(translatedTextElementParent, {
                childList: true,
                subtree: true,
            });

            function update() {
                const translatedTextElement = translatedTextElementParent.querySelector(
                    TRANSLATED_TEXT_ELEMENT_SELECTOR
                ) as HTMLElement | null;

                if (!translatedTextElement) {
                    return;
                }

                elRef.current = translatedTextElement;
                const newEnv = {
                    lang: translatedTextElement.dataset.language,
                    originalLang: translatedTextElement.dataset.originalLanguage,
                    text: (translatedTextElement.firstElementChild as HTMLElement | null)?.innerText,
                };
                render(newEnv, checkerResultRef.current);
                setEnv(newEnv);
            }
        }
        observeTranslator();
    }, [render]);

    return { env, onUpdate };
};

const getTranslatedTextElementParent = (): Promise<HTMLElement> =>
    new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
            const translatedTextElement = document.querySelector(TRANSLATED_TEXT_ELEMENT_SELECTOR);
            if (!translatedTextElement) {
                return;
            }

            clearInterval(checkInterval);
            const { parentElement } = translatedTextElement;

            if (parentElement) {
                resolve(parentElement);
            } else {
                reject('parent missing');
            }
        }, 100);
    });
