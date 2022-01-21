import ReactDOMServer from 'react-dom/server';
import { MatchGroup } from '../../components/TextChecker/TextCheckerResult/hooks';
import { Lang } from '../../types';
import s from './style.module.css';

type Props = {
    el?: HTMLElement | null;
    text?: string;
    matches?: MatchGroup[];
    lang?: Lang;
};

let textOverlay: HTMLElement | null = null;

export function renderOverlay({ el, matches, lang, text }: Props) {
    if (!el) {
        return;
    }

    el.classList.add(s.parent);
    const textElement = el.firstChild as HTMLElement;

    if (!textOverlay) {
        textOverlay = document.createElement('div');
        textOverlay.classList.add(s.overlay);
        textOverlay.classList.add(textElement?.classList.toString());
        textElement.after(textOverlay);
    }

    if (!!matches?.length && text) {
        textOverlay.innerHTML = ReactDOMServer.renderToString(<Overlay text={text} matches={matches} />);
    } else {
        textOverlay.innerHTML = '';
    }
}

function Overlay({ text, matches }: { text: string; matches: MatchGroup[] }) {
    const children = [
        ...matches.flatMap((matchGroup, index) => {
            const prevEnd = matches[index - 1]?.pos[1] || 0;
            const [start, end] = matchGroup.pos;

            if (prevEnd > start) {
                return [];
            }

            return [
                <span key={index + 'a'}>{text.substring(prevEnd, start)}</span>,
                <HighlightedPhrase key={index + 'b'}>{text.substring(start, end)}</HighlightedPhrase>,
            ];
        }),
        <span key="last">{text.substring(matches[matches.length - 1]?.pos?.[1] || 0)}</span>,
    ];
    return <>{children}</>;
}

function HighlightedPhrase({ children }: { children: React.ReactNode }) {
    return <button className={s.highlightedPhrase}>{children}</button>;
}
