import { useCallback, useEffect, useRef, useState } from 'react';
import { MatchGroup } from '../components/TextChecker/TextCheckerResult/hooks';
import { PersonToken } from '../types';
import { isButton, renderButton } from './googleTranslate/button';
import { useRenderGenderHint } from './googleTranslate/genderHint';
import { isOverlay, renderOriginalOverlay, renderOverlay } from './googleTranslate/overlay';
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

const useStableElements = () => {
    const [stableElements, setStableElements] = useState<Partial<{ inputTextArea: HTMLTextAreaElement }>>({});

    useEffect(() => {
        async function init() {
            const textarea = document.querySelector<HTMLTextAreaElement>('c-wiz[role="main"] textarea');
            setStableElements({ inputTextArea: textarea ?? undefined });
        }

        init();
    }, []);

    return stableElements;
};

export const useGoogleTranslatedEnvironment = () => {
    const [env, setEnv] = useState<TranslatorEnvironment>(INITIAL_ENV);
    const stableElements = useStableElements();

    const elRef = useRef<HTMLElement>();
    const textareaElRef = useRef<HTMLTextAreaElement>();
    const checkerResultRef = useRef<CheckerResult>({ status: 'inactive' });
    const openModalRef = useRef<(startPos: number) => void>(() => {});
    const envRef = useRef<TranslatorEnvironment>(INITIAL_ENV);

    const renderGenderHint = useRenderGenderHint(stableElements.inputTextArea);

    useEffect(() => {
        envRef.current = env;
    }, [env]);

    const render = useCallback(
        (newEnv: TranslatorEnvironment, newResult: CheckerResult) => {
            const canUpdateTranslationOverlay = canUpdateOverlay(newEnv.translation, newResult.translation);
            const canUpdateOriginalOverlay = canUpdateOverlay(newEnv.original, newResult.original);

            renderGenderHint(canUpdateOriginalOverlay ? newResult.original : {});

            renderOverlay(
                { el: elRef.current, ...(canUpdateTranslationOverlay ? newResult.translation : {}) },
                openModalRef.current
            );
            renderOriginalOverlay({
                el: textareaElRef.current,
                ...(canUpdateOriginalOverlay ? newResult.original : {}),
            });
            renderButton({
                el: elRef.current,
                status: newResult.status,
                results: newResult.translation?.tokens.length ?? 0,
            });
        },
        [renderGenderHint]
    );

    const onUpdate: OnUpdate = useCallback(
        (result, openModal) => {
            checkerResultRef.current =
                result.status === 'inactive' ? result : { ...checkerResultRef.current, ...result };
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
                const [originalTextArea, translatedTextArea] = Array.from(
                    document.querySelectorAll<HTMLTextAreaElement>('c-wiz[role="main"] textarea')
                );

                elRef.current = translatedTextElement ?? undefined;
                textareaElRef.current = originalTextArea;

                const newEnv: TranslatorEnvironment = {
                    translation: {
                        lang: translatedTextElement?.dataset.language ?? '',
                        text: translatedTextArea?.value,
                    },
                    original: {
                        lang: translatedTextElement?.dataset.originalLanguage ?? '',
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
