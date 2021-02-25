import { Lang, Term, Translation } from '../types';
import s from './style.module.css';

type TermWithLangProps = {
    term: Term | Translation;
};

export function TermWithLang({ term }: TermWithLangProps) {
    return <WrappedInLangColor lang={term.lang}>{term.value}</WrappedInLangColor>;
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
