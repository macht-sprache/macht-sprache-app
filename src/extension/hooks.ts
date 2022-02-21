import { useCallback, useEffect, useRef, useState } from 'react';
import { MatchGroup } from '../components/TextChecker/TextCheckerResult/hooks';
import { PersonToken } from '../types';
import { useRenderButton } from './googleTranslate/button';
import { TRANSLATED_TEXT_ELEMENT_SELECTOR } from './googleTranslate/constants';
import { useRenderGenderHint } from './googleTranslate/genderHint';
import { useRenderOriginalOverlay } from './googleTranslate/originalOverlay';
import { useRenderTranslationOverlay } from './googleTranslate/translationOverlay';
import { CheckerResult, OnUpdate, TranslatorEnvironment } from './types';

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
    const [stableElements, setStableElements] = useState<
        Partial<{ originalSide: HTMLElement; translatedSide: HTMLElement }>
    >({});

    useEffect(() => {
        async function init() {
            const originalSide = document.querySelector('c-wiz[role="main"] textarea')?.closest<HTMLElement>('c-wiz');
            const translatedSide = document.querySelector<HTMLElement>('c-wiz[role="main"] c-wiz[role="region"]');
            setStableElements({
                originalSide: originalSide ?? undefined,
                translatedSide: translatedSide ?? undefined,
            });
        }

        init();
    }, []);

    return stableElements;
};

export const useGoogleTranslatedEnvironment = () => {
    const [env, setEnv] = useState<TranslatorEnvironment>(INITIAL_ENV);
    const { originalSide, translatedSide } = useStableElements();

    const elRef = useRef<HTMLElement>();
    const textareaElRef = useRef<HTMLTextAreaElement>();
    const checkerResultRef = useRef<CheckerResult>({ status: 'inactive' });
    const openModalRef = useRef<(startPos: number) => void>(() => {});
    const envRef = useRef<TranslatorEnvironment>(INITIAL_ENV);

    const renderOriginalOverlay = useRenderOriginalOverlay(originalSide);
    const renderGenderHint = useRenderGenderHint(originalSide);
    const renderTranslationOverlay = useRenderTranslationOverlay(translatedSide);
    const renderButton = useRenderButton(translatedSide);

    useEffect(() => {
        envRef.current = env;
    }, [env]);

    const render = useCallback(
        (newEnv: TranslatorEnvironment, newResult: CheckerResult) => {
            const canUpdateTranslationOverlay = canUpdateOverlay(newEnv.translation, newResult.translation);
            const canUpdateOriginalOverlay = canUpdateOverlay(newEnv.original, newResult.original);

            renderGenderHint(canUpdateOriginalOverlay ? newResult.original : {});

            renderTranslationOverlay(
                canUpdateTranslationOverlay ? { ...newResult.translation, openModal: openModalRef.current } : {}
            );
            renderOriginalOverlay({
                ...(canUpdateOriginalOverlay ? newResult.original : {}),
            });
            renderButton({
                status: newResult.status,
                results: newResult.translation?.tokens.length ?? 0,
            });
        },
        [renderButton, renderGenderHint, renderOriginalOverlay, renderTranslationOverlay]
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
            const observerChildren = new MutationObserver(update);
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
