import { Redact } from '../RedactSensitiveTerms';
import { Lang } from '../types';
import s from './style.module.css';

type TermWithLangProps = {
    term: { value: string; lang: Lang };
};

export function TermWithLang({ term }: TermWithLangProps) {
    return (
        <WrappedInLangColor lang={term.lang}>
            <Redact>{term.value}</Redact>
        </WrappedInLangColor>
    );
}

type WrappedInLangColorProps = {
    lang: Lang;
    children?: React.ReactNode;
};

export function WrappedInLangColor({ lang, children }: WrappedInLangColorProps) {
    return (
        <span className={s.term} lang={lang}>
            {children}
        </span>
    );
}
