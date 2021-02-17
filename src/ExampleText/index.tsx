import clsx from 'clsx';
import TextWithHighlights from '../TextWithHighlights';
import { BaseSnippet, Lang } from '../types';
import s from './style.module.css';

type ExampleTextProps = { lang: Lang; snippet: BaseSnippet; className?: string };

export function ExampleText({ lang, snippet, className }: ExampleTextProps) {
    return (
        <div lang={lang} className={clsx(s.container, className)}>
            <TextWithHighlights text={snippet.text} highlighted={snippet.matches} />
        </div>
    );
}
