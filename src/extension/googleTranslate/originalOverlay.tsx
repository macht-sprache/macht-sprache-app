import { useEffect, useMemo } from 'react';
import ReactDOMServer from 'react-dom/server';
import { CSS_CONTEXT_CLASS_NAME } from '../../constants';
import { PersonToken } from '../../types';
import { injectedElementFactory } from '../injectedElementFactory';
import { renderTokenChildren } from './overlay';
import s from './style.module.css';

const getOriginalOverlay = (stableParent: HTMLElement) => {
    const el = document.createElement('div');
    el.classList.add(s.originalOverlay, CSS_CONTEXT_CLASS_NAME);

    const updateStyle = (textarea: HTMLTextAreaElement) => {
        const textareaStyles = getComputedStyle(textarea);
        el.style.fontSize = textareaStyles.getPropertyValue('font-size');
        el.style.lineHeight = textareaStyles.getPropertyValue('line-height');
    };
    const textareaObserver = new MutationObserver(records => {
        records.forEach(({ target }) => {
            if (target instanceof HTMLTextAreaElement) {
                updateStyle(target);
            }
        });
    });

    return injectedElementFactory<{ text: string; tokens: PersonToken[] }>({
        stableParent,
        createElement: () => el,
        attachElement: (el, parent) => {
            const textarea = parent.querySelector('textarea');
            const googleClone = textarea?.nextElementSibling;
            if (googleClone) {
                el.classList.add(...Array.from(googleClone.classList));
                googleClone.after(el);
            }
            if (textarea) {
                textareaObserver.observe(textarea, { attributes: true });
                updateStyle(textarea);
            }
        },
        destroy: () => textareaObserver.disconnect(),
        validateInput: ({ text, tokens }) => (text && tokens?.length ? { text, tokens } : null),
        render: ({ text, tokens }, el, parent) => {
            el.innerHTML = ReactDOMServer.renderToString(<OriginalOverlay text={text} tokens={tokens} />);
        },
    });
};

export function useRenderOriginalOverlay(parent?: HTMLElement) {
    const { render, destroy } = useMemo(() => {
        if (parent) {
            return getOriginalOverlay(parent);
        } else {
            return { render: () => {}, destroy: () => {} };
        }
    }, [parent]);

    useEffect(() => destroy, [destroy]);

    return render;
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
