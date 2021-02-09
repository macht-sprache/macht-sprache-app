import s from './style.module.css';

type TermWithLangProps = {
    children?: React.ReactNode;
    lang: string;
};

export function TermWithLang({ children, lang }: TermWithLangProps) {
    return (
        <span className={s.term} lang={lang}>
            {children}
        </span>
    );
}
