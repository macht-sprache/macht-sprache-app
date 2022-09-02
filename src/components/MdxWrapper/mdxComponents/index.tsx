import { MDXComponents } from 'mdx/types';
import React, { createContext, useCallback, useContext } from 'react';
import Button, { ButtonAnchor, ButtonContainer } from '../../Form/Button';
import CollapsableSection, { CollapsableSectionContainer } from '../../Layout/CollapsableSection';
import Link from '../../Link';
import PullQuote from '../../PullQuote';
import TermExample from '../../TermExample';
import TermExampleContainer from '../../TermExampleContainer';
import s from './style.module.css';

const mdxLinkBaseContext = createContext(() => window.location.href);

export const MdxLinkBaseProvider: React.FC<{ base: string }> = ({ base, children }) => {
    const getBase = useCallback(() => new URL(base, process.env.REACT_APP_MAIN_ORIGIN ?? window.location.origin).href, [
        base,
    ]);
    return <mdxLinkBaseContext.Provider value={getBase}>{children}</mdxLinkBaseContext.Provider>;
};

const MdxLink = (props: React.ComponentProps<'a'>) => {
    const base = useContext(mdxLinkBaseContext)();
    const origin = process.env.REACT_APP_MAIN_ORIGIN ?? window.location.origin;
    const url = new URL(props.href ?? '', base);

    if (url.origin === origin) {
        return (
            <Link {...props} to={url.href.replace(origin, '')}>
                {props.children}
            </Link>
        );
    }

    // eslint-disable-next-line jsx-a11y/anchor-has-content
    return <a rel="noopener noreferrer" {...props} />;
};

const components: MDXComponents = {
    Button: props => <Button {...props} />,
    ButtonAnchor,
    ButtonContainer,
    CollapsableSection,
    CollapsableSectionContainer,
    TermExample,
    TermExampleContainer,
    PullQuote,
    p: ({ children }) => <p className={s.paragraph}>{children}</p>,
    h2: ({ children }) => <h2 className={s.heading_2}>{children}</h2>,
    h3: ({ children }) => <h3 className={s.heading_3}>{children}</h3>,
    li: ({ children }) => <li className={s.li}>{children}</li>,
    ul: ({ children }) => <ul className={s.ul}>{children}</ul>,
    Columns: ({ children }) => <div className={s.columns}>{children}</div>,
    a: MdxLink,
};

export default components;
