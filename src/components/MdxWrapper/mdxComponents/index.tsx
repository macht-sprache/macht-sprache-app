import { HashLink } from 'react-router-hash-link';
import Button, { ButtonAnchor, ButtonContainer } from '../../Form/Button';
import CollapsableSection from '../../Layout/CollapsableSection';
import PullQuote from '../../PullQuote';
import TermExample from '../../TermExample';
import TermExampleContainer from '../../TermExampleContainer';
import s from './style.module.css';

const components = {
    Button,
    ButtonAnchor,
    ButtonContainer,
    CollapsableSection,
    TermExample,
    TermExampleContainer,
    PullQuote,
    p: ({ children }: { children: React.ReactNode }) => <p className={s.paragraph}>{children}</p>,
    h2: ({ children }: { children: React.ReactNode }) => <h2 className={s.heading_2}>{children}</h2>,
    h3: ({ children }: { children: React.ReactNode }) => <h3 className={s.heading_3}>{children}</h3>,
    li: ({ children }: { children: React.ReactNode }) => <li className={s.li}>{children}</li>,
    ul: ({ children }: { children: React.ReactNode }) => <ul className={s.ul}>{children}</ul>,
    a: ({
        href,
        ...props
    }: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) => {
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
