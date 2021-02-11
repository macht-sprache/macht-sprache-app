import escapeRegExp from 'lodash.escaperegexp';
import { Fragment, memo } from 'react';

type Props = {
    text: string;
    highlighted: string[];
};

function TextWithHighlights({ text, highlighted }: Props) {
    const regExp = new RegExp(`\\b(${highlighted.map(escapeRegExp).join('|')})\\b`);
    return (
        <>
            {text
                .split(regExp)
                .map((part, i) =>
                    regExp.test(part) ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>
                )}
        </>
    );
}

export default memo(TextWithHighlights);
