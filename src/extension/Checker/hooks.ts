import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { analyzeText } from '../../functions';
import { langA, langB } from '../../languages';
import { Lang, TextToken } from '../../types';
import { TranslatorEnvironment } from '../types';

export type CheckerInput = {
    original: TextWithLang;
    translation: TextWithLang;
};

type TextWithLang = {
    text: string;
    lang: Lang;
};

export const useConvertEnv = ({ lang, originalLang, text, originalText }: TranslatorEnvironment): CheckerInput | null =>
    useMemo(() => {
        const langs = [langA, langB];
        if (lang && langs.includes(lang) && originalLang && langs.includes(originalLang) && text) {
            return {
                original: {
                    lang: originalLang as Lang,
                    text: originalText ?? '',
                },
                translation: {
                    lang: lang as Lang,
                    text,
                },
            };
        }
        return null;
    }, [lang, originalLang, originalText, text]);

const DEBOUNCE_MS = 500;
const MAX_CACHE_SIZE = 25;

type State = { loading: boolean; analyzedText?: TextToken[] };

export const useAnalyzedText = (lang: Lang, text: string) => {
    const [state, setState] = useState<State>({ loading: false });
    const updateState = useCallback((update: State) => setState(prev => ({ ...prev, ...update })), []);
    const timeoutRef = useRef<number>();
    const cacheMapRef = useRef<Map<string, Promise<TextToken[]>>>(new Map());

    useEffect(() => {
        updateState({ loading: true });
        let isCurrent = true;
        window.clearTimeout(timeoutRef.current);
        const cacheKey = [text, lang].join('-');
        const cacheMap = cacheMapRef.current;
        const cachedPromise = cacheMap.get(cacheKey);
        const handleSuccess = (analyzedText: TextToken[]) => {
            if (isCurrent) {
                updateState({ loading: false, analyzedText });
            }
        };
        const handleFail = () => {
            if (isCurrent) {
                updateState({ loading: false });
            }
        };

        if (cachedPromise) {
            cachedPromise.then(handleSuccess, handleFail);
        } else {
            timeoutRef.current = window.setTimeout(() => {
                const promise = analyzeText(text, lang);
                cacheMap.set(cacheKey, promise);
                promise.catch(() => cacheMap.delete(cacheKey));
                promise.then(handleSuccess, handleFail);
            }, DEBOUNCE_MS);
        }

        ensureCacheMapSize(cacheMap, MAX_CACHE_SIZE);

        return () => {
            isCurrent = false;
        };
    }, [lang, text, updateState]);

    return [state.loading, state.analyzedText] as const;
};

function ensureCacheMapSize(cacheMap: Map<unknown, unknown>, maxSize: number) {
    while (cacheMap.size > maxSize) {
        cacheMap.delete(cacheMap.keys().next().value);
    }
}
