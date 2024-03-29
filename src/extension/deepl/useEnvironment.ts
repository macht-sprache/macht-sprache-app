import isEqual from 'lodash/isEqual';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getUpdateableResult, INITIAL_ENV } from '../common';
import { CheckerResult, OnUpdate, TranslatorEnvironment } from '../types';
import { useRenderButton } from './button';
import { useRenderGenderHint } from './genderHint';
import { useRenderOriginalOverlay } from './originalOverlay';
import { useRenderTranslationOverlay } from './translationOverlay';

const useStableElements = () => {
    return useMemo(() => {
        const originalSide = document.querySelector<HTMLElement>('[dl-test="translator-source"]');
        const translatedSide = document.querySelector<HTMLElement>('[dl-test="translator-target"]');
        return {
            originalSide: originalSide ?? undefined,
            translatedSide: translatedSide ?? undefined,
        };
    }, []);
};

export const useDeeplEnvironment = (onOpenGenderModal: () => void) => {
    const [env, setEnv] = useState<TranslatorEnvironment>(INITIAL_ENV);
    const { originalSide, translatedSide } = useStableElements();

    const checkerResultRef = useRef<CheckerResult>({ status: 'inactive' });
    const openModalRef = useRef<(startPos: number) => void>(() => {});
    const envRef = useRef<TranslatorEnvironment>(INITIAL_ENV);

    const renderButton = useRenderButton(translatedSide);
    const renderTranslationOverlay = useRenderTranslationOverlay(translatedSide);
    const renderOriginalOverlay = useRenderOriginalOverlay(originalSide);
    const renderGenderHint = useRenderGenderHint(originalSide);

    const render = useCallback(
        (newEnv: TranslatorEnvironment, newResult: CheckerResult) => {
            const translationResult = getUpdateableResult(newEnv.translation, newResult.translation);
            const originalResult = getUpdateableResult(newEnv.original, newResult.original);

            renderTranslationOverlay({ ...translationResult, openModal: openModalRef.current });
            renderOriginalOverlay(originalResult);
            renderButton({
                status: newResult.status,
                results: translationResult.tokens?.length ?? 0,
            });
            renderGenderHint({ ...originalResult, onOpenGenderModal });
        },
        [renderButton, renderOriginalOverlay, renderTranslationOverlay]
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
        const translatedTextArea = translatedSide?.querySelector<HTMLTextAreaElement>('textarea');
        const translatedDummyElement = translatedSide?.querySelector('#target-dummydiv');

        const update = () => {
            const newEnv: TranslatorEnvironment = {
                translation: {
                    lang: translatedTextArea?.lang.split('-')[0] ?? '',
                    text: translatedTextArea?.value ?? '',
                },
                original: {
                    lang: originalTextArea?.lang.split('-')[0] ?? '',
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
        translatedTextArea?.addEventListener('input', update);

        const translatedAreaObserver = new MutationObserver(update);
        if (translatedDummyElement) {
            translatedAreaObserver.observe(translatedDummyElement, { childList: true, characterData: true });
        }

        update();

        return () => {
            translatedAreaObserver.disconnect();
            originalTextArea?.removeEventListener('input', update);
            translatedTextArea?.removeEventListener('input', update);
        };
    }, [originalSide, translatedSide, render]);

    return { env, onUpdate };
};
