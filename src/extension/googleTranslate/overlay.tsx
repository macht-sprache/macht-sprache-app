import React, { Fragment } from 'react';
import ReactDOMServer from 'react-dom/server';
import { MatchGroup } from '../../components/TextChecker/TextCheckerResult/hooks';
import { CSS_CONTEXT_CLASS_NAME } from '../../constants';
import { Lang, PersonToken, Token } from '../../types';
import { getDominantLanguageClass } from '../../useLangCssVars';
import s from './style.module.css';

let originalOverlayEl: HTMLElement | null = null;
const getOriginalOverlayEl = (textarea?: HTMLTextAreaElement) => {
    const googleClone = textarea?.nextElementSibling;

    if (!googleClone) {
        return originalOverlayEl;
    }

    if (!originalOverlayEl) {
        originalOverlayEl = document.createElement('div');
        googleClone.after(originalOverlayEl);
    }

    const textareaStyles = getComputedStyle(textarea);
    originalOverlayEl.classList.add(...Array.from(googleClone.classList), s.originalOverlay, CSS_CONTEXT_CLASS_NAME);
    originalOverlayEl.style.fontSize = textareaStyles.getPropertyValue('font-size');
    originalOverlayEl.style.lineHeight = textareaStyles.getPropertyValue('line-height');
    return originalOverlayEl;
};

export function renderOriginalOverlay({
    el,
    text,
    tokens,
}: {
    el?: HTMLTextAreaElement;
    text?: string;
    tokens?: PersonToken[];
}) {
    // renderGenderHint(el, tokens);
    const overlay = getOriginalOverlayEl(el);

    if (!overlay) {
        return;
    }

    if (!!tokens?.length && text) {
        overlay.innerHTML = ReactDOMServer.renderToString(<OriginalOverlay text={text} tokens={tokens} />);
    } else {
        overlay.innerHTML = '';
    }
}

function OriginalOverlay({ text, tokens }: { text: string; tokens: PersonToken[] }) {
    return (
        <>
            {renderTokenChildren(text, tokens, substring => (
                <span className={s.originalHighlight}>{substring}</span>
            ))}
        </>
    );
}

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
