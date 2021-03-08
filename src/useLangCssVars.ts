import { useEffect } from 'react';
import { langA, langB } from './languages';
import { Lang } from './types';

const DOMINANT_LANG_CLASS_NAME = 'dominantLanguageColor';

const style = `
[lang=${langA}] {
    --lang-color: var(--colorLangA);
}
[lang=${langB}] {
    --lang-color: var(--colorLangB);
}
.${DOMINANT_LANG_CLASS_NAME}-${langA} {
    --dominantLanguageColor: var(--colorLangA);
}
.${DOMINANT_LANG_CLASS_NAME}-${langB} {
    --dominantLanguageColor: var(--colorLangB);
}
`;

export function useLangCssVars() {
    useEffect(() => {
        const styleEl = document.createElement('style');
        styleEl.innerHTML = style;
        document.head.appendChild(styleEl);
        return () => {
            document.head.removeChild(styleEl);
        };
    }, []);
}

export function getDominantLanguageClass(lang: Lang) {
    return `${DOMINANT_LANG_CLASS_NAME}-${lang}`;
}
