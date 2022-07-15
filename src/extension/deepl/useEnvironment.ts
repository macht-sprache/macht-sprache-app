import isEqual from 'lodash/isEqual';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getUpdateableResult, INITIAL_ENV } from '../common';
import { CheckerResult, OnUpdate, TranslatorEnvironment } from '../types';

const useStableElements = () => {
    return useMemo(() => {
        const originalSide = document.querySelector('[dl-test="translator-source"]');
        const translatedSide = document.querySelector('[dl-test="translator-target"]');
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

    const render = useCallback((newEnv: TranslatorEnvironment, newResult: CheckerResult) => {
        const translationResult = getUpdateableResult(newEnv.translation, newResult.translation);
        const originalResult = getUpdateableResult(newEnv.original, newResult.original);

        console.log('would render', translationResult, originalResult);
    }, []);

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

            console.log('update', newEnv);

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
