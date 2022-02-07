import { useEffect, useMemo, useRef, useState } from 'react';
import { analyzeText } from '../../functions';
import { langA, langB } from '../../languages';
import { Lang, TextToken } from '../../types';
import { OnUpdate, TranslatorEnvironment } from '../types';

export const useConvertEnv = ({
    lang,
    originalLang,
    text,
}: TranslatorEnvironment): { translatedLang: Lang; text: string } | null =>
    useMemo(() => {
        const langs = [langA, langB];
        if (lang && langs.includes(lang) && originalLang && langs.includes(originalLang) && text) {
            return {
                translatedLang: lang as Lang,
                text: text,
            };
        }
        return null;
    }, [lang, originalLang, text]);

export const useAnalyzedText = (lang: Lang, text: string, onUpdate: OnUpdate) => {
    const [analyzedText, setAnalyzedText] = useState<TextToken[]>();
    const timeoutRef = useRef<number>();
    const cacheMapRef = useRef<Map<string, Promise<TextToken[]>>>(new Map());

    useEffect(() => {
        onUpdate({ status: 'loading' });
        let isCurrent = true;
        window.clearTimeout(timeoutRef.current);
        const cacheKey = [text, lang].join('-');
        const cacheMap = cacheMapRef.current;
        const cachedPromise = cacheMap.get(cacheKey);
        const handleSuccess = (analyzedText: TextToken[]) => {
            if (isCurrent) {
                setAnalyzedText(analyzedText);
            }
        };
        const handleFail = () => {
            if (isCurrent) {
                onUpdate({ status: 'idle' });
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
            }, 500);
        }

        return () => {
            isCurrent = false;
        };
    }, [lang, onUpdate, text]);

    return analyzedText;
};
