import LinkifyIt from 'linkify-it';
import { memo } from 'react';
import { removeHttpsWwwPageParams, trimString } from '../utils';
import s from './style.module.css';

const linkify = new LinkifyIt();

type Props = {
    children: string;
};

function Linkify({ children }: Props) {
    const parts = (linkify.match(children) || []).reduce<React.ReactNode[]>((acc, cur, index, array) => {
        const prevIndex = array[index - 1]?.lastIndex || 0;
        acc.push(
            children.substring(prevIndex, cur.index),
            <a key={index} target="_blank" href={cur.url} rel="noopener noreferrer" className={s.link}>
                {trimString(removeHttpsWwwPageParams(cur.url))}
            </a>
        );

        if (index === array.length - 1) {
            acc.push(children.substring(cur.lastIndex));
        }

        return acc;
    }, []);
    return <>{parts.length ? parts : children}</>;
}

export default memo(Linkify);
