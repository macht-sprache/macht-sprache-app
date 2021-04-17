import LinkifyIt from 'linkify-it';
import { memo, Suspense, useMemo } from 'react';
import { Link, matchPath } from 'react-router-dom';
import { collections } from '../hooks/data';
import { useDocument } from '../hooks/fetch';
import { TERM, TERM_SIDEBAR, TRANSLATION, TRANSLATION_SIDEBAR } from '../routes';
import { TermWithLang } from '../TermWithLang';
import { DocReference, Term, Translation } from '../types';
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
        const defaultLink = (
            <InternalLink url={url} className={s.link}>
                {linkText}
            </InternalLink>
        );
        const entityRef = getEntityRef(url.pathname);

        if (entityRef) {
            return (
                <Suspense fallback={defaultLink}>
                    <EntityLink url={url} fallback={defaultLink} entityRef={entityRef} />
                </Suspense>
            );
        }

        return defaultLink;
    } else {
        return (
            <a target="_blank" href={props.url} rel="noopener noreferrer" className={s.link}>
                {linkText}
            </a>
        );
    }
}

const InternalLink: React.FC<{ url: URL; className?: string }> = ({ url, className, children }) => (
    <Link to={url.toString().replace(url.origin, '')} className={className}>
        {children}
    </Link>
);

function EntityLink({
    url,
    fallback,
    entityRef,
}: {
    url: URL;
    fallback: React.ReactNode;
    entityRef: DocReference<Term | Translation>;
}) {
    const getEntity = useDocument(entityRef);
    const entity = getEntity(true);

    if (!entity) {
        return <>{fallback}</>;
    }

    return (
        <InternalLink url={url}>
            <TermWithLang term={entity} />
        </InternalLink>
    );
}

const getEntityRef = (path: string) => {
    const termMatch =
        matchPath<{ termId: string }>(path, { path: TERM, exact: true }) ||
        matchPath<{ termId: string }>(path, { path: TERM_SIDEBAR, exact: true });

    if (termMatch) {
        return collections.terms.doc(termMatch.params.termId);
    }

    const translationMatch =
        matchPath<{ translationId: string }>(path, { path: TRANSLATION, exact: true }) ||
        matchPath<{ translationId: string }>(path, { path: TRANSLATION_SIDEBAR, exact: true });

    if (translationMatch) {
        return collections.translations.doc(translationMatch.params.translationId);
    }
};

export default memo(Linkify);
