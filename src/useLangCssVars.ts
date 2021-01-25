import { useEffect } from 'react';
import { langA, langB } from './languages';

const style = `
[lang=${langA}] {
    --lang-color: var(--colorLangA);
}
[lang=${langB}] {
    --lang-color: var(--colorLangB);
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
