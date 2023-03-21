import ReactDOMServer from 'react-dom/server';
import { MatchGroup } from '../../components/TextChecker/TextCheckerResult/hooks';
import { CSS_CONTEXT_CLASS_NAME } from '../../constants';
import { Lang } from '../../types';
import { getDominantLanguageClass } from '../../useLangCssVars';
import { getUseRenderElement, injectedElementFactory } from '../injectedElementFactory';
import { renderTokenChildren } from './overlay';
import s from './style.module.css';

const getTranslationOverlay = (stableParent: HTMLElement) =>
    injectedElementFactory<{ text: string; tokens: MatchGroup[]; lang: Lang; openModal: (startPos: number) => void }>({
        stableParent,
        createElement: () => {
            const overlay = document.createElement('div');
            overlay.classList.add(s.overlay);
            return overlay;
        },
        attachElement: (el, parent) => {
            const textEl = parent.querySelector('[lang]:not([lang=""])');

            if (!textEl) {
                return;
            }

            const parentPadding = textEl.parentElement ? getComputedStyle(textEl.parentElement).padding : '';

            textEl.parentElement?.classList.add(s.parent);
            el.classList.add(textEl?.classList?.toString() ?? '');
            el.style.setProperty('--parent-padding', parentPadding);
            textEl.parentElement?.appendChild(el);
        },
        validateInput: ({ text, tokens, lang, openModal }) =>
            text && lang && tokens?.length && openModal ? { text, tokens, lang, openModal } : null,
        render: ({ text, tokens, lang, openModal }, el) => {
            el.innerHTML = ReactDOMServer.renderToString(<Overlay text={text} matches={tokens} lang={lang} />);
            el.onclick = (event: MouseEvent) => {
                if (!(event.target instanceof HTMLElement)) {
                    return;
                }
                const startIndex = parseInt(event.target.dataset.start ?? '');
                openModal(startIndex);
            };
        },
    });

export const useRenderTranslationOverlay = getUseRenderElement(getTranslationOverlay);

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
