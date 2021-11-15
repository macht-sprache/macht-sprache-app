import escapeRegExp from 'lodash/escapeRegExp';
import { memo } from 'react';
import { Redact } from '../RedactSensitiveTerms';

type Props = {
    text: string;
    highlighted: string[];
};

function TextWithHighlights({ text, highlighted }: Props) {
    if (!highlighted.length) {
        return <>{text}</>;
    }

    const regExp = new RegExp(`\\b(${highlighted.map(escapeRegExp).join('|')})\\b`);
    return (
        <>
            {text.split(regExp).map((part, i) =>
                regExp.test(part) ? (
                    <strong key={i}>
                        <Redact>{part}</Redact>
                    </strong>
                ) : (
                    <Redact key={i}>{part}</Redact>
                )
            )}
        </>
    );
}

export default memo(TextWithHighlights);
