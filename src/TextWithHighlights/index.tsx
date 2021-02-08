import { Fragment, memo } from 'react';
import escapeRegExp from 'lodash.escaperegexp';

type Props = {
    text: string;
    highlighted: string[];
};

function TextWithHighlights({ text, highlighted }: Props) {
    const regExp = new RegExp(`(${highlighted.map(escapeRegExp).join('|')})`);
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
