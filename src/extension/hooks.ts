import { useCallback, useEffect, useRef, useState } from 'react';
import { MatchGroup } from '../components/TextChecker/TextCheckerResult/hooks';
import { PersonToken } from '../types';
import { isButton, renderButton } from './googleTranslate/button';
import { isOverlay, renderOverlay } from './googleTranslate/overlay';
import { CheckerResult, OnUpdate, TranslatorEnvironment } from './types';

const TRANSLATED_TEXT_ELEMENT_SELECTOR = '[data-language][data-original-language]';

const INITIAL_ENV = {
    translation: {
        lang: '',
        text: '',
    },
    original: {
        lang: '',
        text: '',
    },
};

const canUpdateOverlay = (
    env: { text?: string; lang?: string },
    result?: { text: string; lang: string; tokens: MatchGroup[] | PersonToken[] }
) => {
    if (!result) {
        return false;
    }
    const { tokens } = result;
    const textToCheck = result.text.substring(0, tokens.length && tokens[tokens.length - 1].pos[1]);
    return env.lang === result.lang && textToCheck && env.text?.startsWith(textToCheck);
};

export const useGoogleTranslatedEnvironment = () => {
    const elRef = useRef<HTMLElement>();
    const [env, setEnv] = useState<TranslatorEnvironment>(INITIAL_ENV);
    const checkerResultRef = useRef<CheckerResult>({ status: 'inactive' });
    const openModalRef = useRef<(startPos: number) => void>(() => {});
    const envRef = useRef<TranslatorEnvironment>(INITIAL_ENV);

    useEffect(() => {
        envRef.current = env;
    }, [env]);

    const render = useCallback((newEnv: TranslatorEnvironment, newResult: CheckerResult) => {
        const canUpdateTranslationOverlay = canUpdateOverlay(newEnv.translation, newResult.translation);
        renderOverlay(
            { el: elRef.current, ...(canUpdateTranslationOverlay ? newResult.translation : {}) },
            openModalRef.current
        );

        const hasResult = !!(newResult.original?.tokens.length || newResult.translation?.tokens.length);
        renderButton({ el: elRef.current, status: newResult.status, hasResult });
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
                const translatedTextElement = translatedTextElementParent.querySelector<HTMLElement>(
                    TRANSLATED_TEXT_ELEMENT_SELECTOR
                );

                if (!translatedTextElement) {
                    return;
                }

                elRef.current = translatedTextElement;

                const [originalTextArea, translatedTextArea] = Array.from(
                    document.querySelectorAll<HTMLTextAreaElement>('c-wiz[role="main"] textarea')
                );
                const newEnv: TranslatorEnvironment = {
                    translation: {
                        lang: translatedTextElement.dataset.language ?? '',
                        text: translatedTextArea?.value,
                    },
                    original: {
                        lang: translatedTextElement.dataset.originalLanguage ?? '',
                        text: originalTextArea?.value,
                    },
                };

                render(newEnv, checkerResultRef.current);
                setEnv(newEnv);
            }

            update();
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
