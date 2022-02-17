import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { analyzeText, analyzeTextForPersons } from '../../functions';
import { langA, langB } from '../../languages';
import { Lang, PersonToken } from '../../types';
import { TranslatorEnvironment } from '../types';

export type CheckerInput = {
    original: TextWithLang;
    translation: TextWithLang;
};

type TextWithLang = {
    text: string;
    lang: Lang;
};

const DEBOUNCE_MS = 500;
const MAX_CACHE_SIZE = 25;

const personTokenFns: Partial<Record<Lang, (text: string, lang: Lang) => Promise<PersonToken[]>>> = {
    en: analyzeTextForPersons,
};

const isValidCheckerInput = (env: TranslatorEnvironment): env is CheckerInput => {
    const envLangs = new Set([env.original.lang, env.translation.lang]);
    return envLangs.has(langA) && envLangs.has(langB);
};

export const useConvertEnv = (env: TranslatorEnvironment): CheckerInput | null =>
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useMemo(() => (isValidCheckerInput(env) ? env : null), [JSON.stringify(env)]);

type State<T> = { loading: boolean; result?: T };

export const useAnalyzedText = (lang: Lang, text: string) => {
    return useAnalyzeCall(lang, text, analyzeText);
};

export const usePersonTokens = (lang: Lang, text: string) => {
    return useAnalyzeCall(lang, text, personTokenFns[lang]);
};

const useAnalyzeCall = <T>(lang: Lang, text: string, fn?: (text: string, lang: Lang) => Promise<T>) => {
    const [state, setState] = useState<State<T>>({ loading: false });
    const updateState = useCallback((update: State<T>) => setState(prev => ({ ...prev, ...update })), []);
    const timeoutRef = useRef<number>();
    const cacheMapRef = useRef<Map<string, Promise<T>>>(new Map());

    useEffect(() => {
        if (!fn) {
            setState({ loading: false });
        }

        updateState({ loading: true });
        let isCurrent = true;
        window.clearTimeout(timeoutRef.current);
        const cacheKey = [text, lang].join('-');
        const cacheMap = cacheMapRef.current;
        const cachedPromise = cacheMap.get(cacheKey);
        const handleSuccess = (result: T) => {
            if (isCurrent) {
                updateState({ loading: false, result });
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
                const promise = fn(text, lang);
                cacheMap.set(cacheKey, promise);
                promise.catch(() => cacheMap.delete(cacheKey));
                promise.then(handleSuccess, handleFail);
            }, DEBOUNCE_MS);
        }

        ensureCacheMapSize(cacheMap, MAX_CACHE_SIZE);

        return () => {
            isCurrent = false;
        };
    }, [fn, lang, text, updateState]);

    return [state.loading, state.result] as const;
};

function ensureCacheMapSize(cacheMap: Map<unknown, unknown>, maxSize: number) {
    while (cacheMap.size > maxSize) {
        cacheMap.delete(cacheMap.keys().next().value);
    }
}
