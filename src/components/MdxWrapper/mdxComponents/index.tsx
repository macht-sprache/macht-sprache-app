import { MDXProviderComponents } from '@mdx-js/react';
import Button, { ButtonAnchor, ButtonContainer } from '../../Form/Button';
import CollapsableSection, { CollapsableSectionContainer } from '../../Layout/CollapsableSection';
import Link from '../../Link';
import PullQuote from '../../PullQuote';
import TermExample from '../../TermExample';
import TermExampleContainer from '../../TermExampleContainer';
import s from './style.module.css';

const components: MDXProviderComponents = {
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
    a: ({ href, ...props }) => {
        if (href?.startsWith('/')) {
            return (
                <Link to={href} title={props.title}>
                    {props.children}
                </Link>
            );
        }
        // eslint-disable-next-line jsx-a11y/anchor-has-content
        return <a href={href} {...props} />;
    },
};

export default components;
