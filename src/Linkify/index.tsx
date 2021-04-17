import LinkifyIt from 'linkify-it';
import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { removeHttpsWwwPageParams, trimString } from '../utils';
import s from './style.module.css';

const linkify = new LinkifyIt();

type Props = {
    children: string;
};

function Linkify({ children }: Props) {
    const parts = (linkify.match(children) || []).reduce<React.ReactNode[]>((acc, cur, index, array) => {
        const prevIndex = array[index - 1]?.lastIndex || 0;
        acc.push(children.substring(prevIndex, cur.index), <LinkWrapper key={index} url={cur.url} />);

        if (index === array.length - 1) {
            acc.push(children.substring(cur.lastIndex));
        }

        return acc;
    }, []);
    return <>{parts.length ? parts : children}</>;
}

function LinkWrapper(props: { url: string }) {
    const url = useMemo(() => {
        try {
            return new URL(props.url);
        } catch {
            return null;
        }
    }, [props.url]);
    const linkText = trimString(removeHttpsWwwPageParams(props.url));

    if (url?.origin === window.location.origin) {
        return (
            <InternalLink url={url} className={s.link}>
                {linkText}
            </InternalLink>
        );
    } else {
        return (
            <a target="_blank" href={props.url} rel="noopener noreferrer" className={s.link}>
                {linkText}
            </a>
        );
    }
}

const InternalLink: React.FC<{ url: URL; className: string }> = ({ url, className, children }) => (
    <Link to={url.toString().replace(url.origin, '')} className={className}>
        {children}
    </Link>
);

export default memo(Linkify);
