import ReactDOMServer from 'react-dom/server';
import { CSS_CONTEXT_CLASS_NAME } from '../../constants';
import { PersonToken } from '../../types';
import { getUseRenderElement, injectedElementFactory } from '../injectedElementFactory';
import { renderTokenChildren } from './overlay';
import s from './style.module.css';

const getOriginalOverlay = (stableParent: HTMLElement) => {
    const el = document.createElement('div');
    el.classList.add(s.originalOverlay, CSS_CONTEXT_CLASS_NAME);

    const updateStyle = () => {
        const textarea = stableParent.querySelector('textarea');
        if (textarea) {
            const textareaStyles = getComputedStyle(textarea);
            el.style.fontSize = textareaStyles.getPropertyValue('font-size');
            el.style.lineHeight = textareaStyles.getPropertyValue('line-height');
        }
    };

    const observer = new MutationObserver(records => {
        records.forEach(() => {
            updateStyle();
        });
    });

    return injectedElementFactory<{ text: string; tokens: PersonToken[] }>({
        stableParent,
        createElement: () => el,
        attachElement: (el, parent) => {
            const textarea = parent.querySelector('textarea');
            const containerToObserve = document.getElementById('dl_translator');

            if (textarea && containerToObserve) {
                observer.observe(containerToObserve, { attributes: true });
                el.classList.add(...Array.from(textarea.classList));
                textarea.after(el);
                updateStyle();
            }
        },
        destroy: () => observer.disconnect(),
        validateInput: ({ text, tokens }) => (text && tokens?.length ? { text, tokens } : null),
        render: ({ text, tokens }, el) => {
            el.innerHTML = ReactDOMServer.renderToString(<OriginalOverlay text={text} tokens={tokens} />);
        },
    });
};

export const useRenderOriginalOverlay = getUseRenderElement(getOriginalOverlay);

function OriginalOverlay({ text, tokens }: { text: string; tokens: PersonToken[] }) {
    return (
        <>
            {renderTokenChildren(text, tokens, substring => (
                <span className={s.originalHighlight}>{substring}</span>
            ))}
        </>
    );
}
