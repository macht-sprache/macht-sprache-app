import { Link } from 'react-router-dom';
import { Lang } from '../types';
import s from './style.module.css';

type Props = {
    children: React.ReactNode;
    subLine?: React.ReactNode;
    mainLang?: Lang;
    topHeading?: {
        lang?: Lang;
        to: string;
        inner: React.ReactNode;
    }[];
};

export default function Header({ children, subLine, mainLang, topHeading }: Props) {
    return (
        <header className={s.header}>
            {topHeading &&
                topHeading.map((heading, index) => {
                    return (
                        <h2 className={s.topHeading} key={index} lang={heading.lang}>
                            <Link to={heading.to} className={s.topHeadingLink}>
                                {heading.inner}
                            </Link>
                        </h2>
                    );
                })}
            <h1 className={s.heading} lang={mainLang}>
                <span className={s.headingInner}>{children}</span>
            </h1>
            {subLine}
        </header>
    );
}
