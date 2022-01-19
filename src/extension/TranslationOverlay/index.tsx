import React, { useEffect, useState } from 'react';
import ReactDOMServer from 'react-dom/server';
import { MatchGroup } from '../../components/TextChecker/TextCheckerResult/hooks';
import { TranslatorEnvironment } from '../types';
import s from './style.module.css';

type Props = {
    env: TranslatorEnvironment;
    matches?: MatchGroup[];
};

export function TranslationOverlay({ env, matches }: Props) {
    const [textOverlay, setTextOverlay] = useState<HTMLElement | null>();

    useEffect(() => {
        if (env.el) {
            const textOverlay = document.createElement('div');
            const textElement = env.el.firstChild as HTMLElement;
            env.el.classList.add(s.parent);
            textOverlay.classList.add(s.overlay);
            textOverlay.classList.add(textElement?.classList.toString());
            textElement?.after(textOverlay);
            setTextOverlay(textOverlay);
        } else {
            setTextOverlay(null);
        }
    }, [env.el]);

    useEffect(() => {
        if (textOverlay) {
            if (!!matches?.length && env.text) {
                textOverlay.innerHTML = ReactDOMServer.renderToString(<Overlay text={env.text} matches={matches} />);
            } else {
                textOverlay.innerHTML = '';
            }
        }
    }, [env.text, matches, textOverlay]);

    return null;
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
