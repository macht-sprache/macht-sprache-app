import React, { Fragment } from 'react';
import { Token } from '../../types';

export function renderTokenChildren<T extends Token>(
    text: string,
    tokens: T[],
    renderMatch: (substring: string, token: T, index: number) => React.ReactNode
) {
    return [
        ...tokens.flatMap((token, index) => {
            const prevEnd = tokens[index - 1]?.pos[1] || 0;
            const [start, end] = token.pos;

            if (prevEnd > start) {
                return [];
            }

            return [
                <span key={index + 'a'}>{text.substring(prevEnd, start)}</span>,
                <Fragment key={index}>{renderMatch(text.substring(start, end), token, index)}</Fragment>,
            ];
        }),
        <span key="last">{text.substring(tokens[tokens.length - 1]?.pos?.[1] || 0)}</span>,
    ];
}
