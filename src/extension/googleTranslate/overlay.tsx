import React, { Fragment } from 'react';
import ReactDOMServer from 'react-dom/server';
import { MatchGroup } from '../../components/TextChecker/TextCheckerResult/hooks';
import { CSS_CONTEXT_CLASS_NAME } from '../../constants';
import { Lang, PersonToken, Token } from '../../types';
import { getDominantLanguageClass } from '../../useLangCssVars';
import { renderGenderHint } from './genderHint';
import s from './style.module.css';

type Props = {
    el?: HTMLElement | null;
    text?: string;
    tokens?: MatchGroup[];
    lang?: Lang;
};

let textOverlay: HTMLElement | null = null;

export function isOverlay(el: Node) {
    return el === textOverlay;
}

export function renderOverlay({ el, tokens, text, lang }: Props, openModal: (startPos: number) => void) {
    if (!el) {
        return;
    }

    el.classList.add(s.parent);

    if (!textOverlay || !el.contains(textOverlay)) {
        const textElement = el.firstElementChild;
        textOverlay = document.createElement('div');
        textOverlay.classList.add(s.overlay);
        textOverlay.classList.add(textElement?.classList?.toString() ?? '');
        el.appendChild(textOverlay);
    }

    if (!!tokens?.length && text) {
        textOverlay.innerHTML = ReactDOMServer.renderToString(<Overlay text={text} matches={tokens} lang={lang} />);
        textOverlay.onclick = (event: MouseEvent) => {
            if (!(event.target instanceof HTMLElement)) {
                return;
            }
            const startIndex = parseInt(event.target.dataset.start ?? '');
            openModal(startIndex);
        };
    } else {
        textOverlay.innerHTML = '';
        textOverlay.onclick = null;
    }
}

let originalOverlayEl: HTMLElement | null = null;
const getOriginalOverlayEl = (textarea: HTMLTextAreaElement) => {
    const googleClone = textarea.nextElementSibling;

    if (!googleClone) {
        return null;
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
    renderGenderHint(el, tokens);

    if (!el) {
        return;
    }

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

function Overlay({ text, matches, lang }: { text: string; matches: MatchGroup[]; lang?: Lang }) {
    return (
        <div className={CSS_CONTEXT_CLASS_NAME}>
            <div className={getDominantLanguageClass(lang)}>
                {renderTokenChildren(text, matches, (substring, match) => (
                    <HighlightedPhrase start={match.pos[0]}>{substring}</HighlightedPhrase>
                ))}
            </div>
        </div>
    );
}

function HighlightedPhrase({ start, children }: { children: React.ReactNode; start: number }) {
    return (
        <button className={s.highlightedPhrase} data-start={start}>
            {children}
        </button>
    );
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

function renderTokenChildren<T extends Token>(
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
