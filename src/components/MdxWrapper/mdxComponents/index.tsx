import { MDXProviderComponents } from '@mdx-js/react';
import { HashLink } from 'react-router-hash-link';
import Button, { ButtonAnchor, ButtonContainer } from '../../Form/Button';
import CollapsableSection from '../../Layout/CollapsableSection';
import PullQuote from '../../PullQuote';
import TermExample from '../../TermExample';
import TermExampleContainer from '../../TermExampleContainer';
import s from './style.module.css';

const components: MDXProviderComponents = {
    Button: props => <Button {...props} />,
    ButtonAnchor,
    ButtonContainer,
    CollapsableSection,
    TermExample,
    TermExampleContainer,
    PullQuote,
    p: ({ children }) => <p className={s.paragraph}>{children}</p>,
    h2: ({ children }) => <h2 className={s.heading_2}>{children}</h2>,
    h3: ({ children }) => <h3 className={s.heading_3}>{children}</h3>,
    li: ({ children }) => <li className={s.li}>{children}</li>,
    ul: ({ children }) => <ul className={s.ul}>{children}</ul>,
    Columns: ({ children }) => <div className={s.columns}>{children}</div>,
    a: ({ href, ...props }) => {
        if (href?.startsWith('/')) {
            return (
                <HashLink to={href} title={props.title}>
                    {props.children}
                </HashLink>
            );
        }
        // eslint-disable-next-line jsx-a11y/anchor-has-content
        return <a href={href} {...props} />;
    },
};

export default components;
