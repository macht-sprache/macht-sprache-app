import { Lang, Token } from '../types';

export const INITIAL_ENV = {
    translation: {
        lang: '',
        text: '',
    },
    original: {
        lang: '',
        text: '',
    },
};

export const getUpdateableResult = <T extends Token>(
    env: { text?: string; lang?: string },
    result?: { text: string; lang: Lang; tokens: T[] }
): Partial<{ text: string; lang: Lang; tokens: T[] }> => {
    if (!result || !env.text || env.lang !== result.lang) {
        return {};
    }

    return {
        text: env.text,
        lang: result.lang,
        tokens: result.tokens.filter(token => {
            const [start, end] = token.pos;
            const envMatch = env.text?.substring(start, end);
            const resultMatch = result.text.substring(start, end);
            return envMatch === resultMatch;
        }),
    };
};
