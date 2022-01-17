export type TranslatorEnvironment = {
    lang?: string;
    text?: string;
    originalLang?: string;
    el?: HTMLElement;
};

export type Status = 'loading' | 'inactive' | 'idle';
