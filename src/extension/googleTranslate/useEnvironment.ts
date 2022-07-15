import isEqual from 'lodash/isEqual';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getUpdateableResult, INITIAL_ENV } from '../common';
import { CheckerResult, OnUpdate, TranslatorEnvironment } from '../types';
import { useRenderButton } from './button';
import { TRANSLATED_TEXT_ELEMENT_SELECTOR } from './constants';
import { useRenderGenderHint } from './genderHint';
import { useRenderOriginalOverlay } from './originalOverlay';
import { useRenderTranslationOverlay } from './translationOverlay';

const useStableElements = () => {
    return useMemo(() => {
        const originalSide = document.querySelector('c-wiz[role="main"] textarea')?.closest<HTMLElement>('c-wiz');
        const translatedSide = document.querySelector<HTMLElement>('c-wiz[role="main"] c-wiz[role="region"]');
        return {
            originalSide: originalSide ?? undefined,
            translatedSide: translatedSide ?? undefined,
        };
    }, []);
};

export const useGoogleTranslateEnvironment = (onOpenGenderModal: () => void) => {
    const [env, setEnv] = useState<TranslatorEnvironment>(INITIAL_ENV);
    const { originalSide, translatedSide } = useStableElements();

    const checkerResultRef = useRef<CheckerResult>({ status: 'inactive' });
    const openModalRef = useRef<(startPos: number) => void>(() => {});
    const envRef = useRef<TranslatorEnvironment>(INITIAL_ENV);

    const renderOriginalOverlay = useRenderOriginalOverlay(originalSide);
    const renderGenderHint = useRenderGenderHint(originalSide);
    const renderTranslationOverlay = useRenderTranslationOverlay(translatedSide);
    const renderButton = useRenderButton(translatedSide);

    const render = useCallback(
        (newEnv: TranslatorEnvironment, newResult: CheckerResult) => {
            const translationResult = getUpdateableResult(newEnv.translation, newResult.translation);
            const originalResult = getUpdateableResult(newEnv.original, newResult.original);

            renderGenderHint({ ...originalResult, onOpenGenderModal });
            renderOriginalOverlay(originalResult);
            renderTranslationOverlay({ ...translationResult, openModal: openModalRef.current });
            renderButton({
                status: newResult.status,
                results: translationResult.tokens?.length ?? 0,
            });
        },
        [onOpenGenderModal, renderButton, renderGenderHint, renderOriginalOverlay, renderTranslationOverlay]
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
        const originalTextArea = originalSide?.querySelector<HTMLTextAreaElement>('textarea');

        const update = () => {
            const translatedTextElement = translatedSide?.querySelector<HTMLElement>(TRANSLATED_TEXT_ELEMENT_SELECTOR);
            const translatedTextArea = translatedSide?.querySelector<HTMLTextAreaElement>('textarea');

            const newEnv: TranslatorEnvironment = {
                translation: {
                    lang: translatedTextElement?.dataset.language ?? '',
                    text: translatedTextArea?.value ?? '',
                },
                original: {
                    lang: translatedTextElement?.dataset.originalLanguage ?? '',
                    text: originalTextArea?.value ?? '',
                },
            };

            if (isEqual(envRef.current, newEnv)) {
                return;
            }

            envRef.current = newEnv;
            render(newEnv, checkerResultRef.current);
            setEnv(newEnv);
        };

        originalTextArea?.addEventListener('input', update);

        const translatedAreaObserver = new MutationObserver(update);
        if (translatedSide) {
            translatedAreaObserver.observe(translatedSide, { childList: true, subtree: true });
        }

        update();

        return () => {
            translatedAreaObserver.disconnect();
            originalTextArea?.removeEventListener('input', update);
        };
    }, [render, originalSide, translatedSide]);

    return { env, onUpdate };
};
