import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { Lang } from '../types';
import s from './style.module.css';

type Props = {
    children: React.ReactNode;
    subLine?: React.ReactNode;
    mainLang?: Lang;
    topHeading?: {
        lang?: Lang;
        to?: string;
        inner: React.ReactNode;
    }[];
    capitalize?: boolean;
};

export default function Header({ children, subLine, mainLang, topHeading, capitalize = false }: Props) {
    return (
        <header className={s.header}>
            <div>
                {topHeading &&
                    topHeading.map((heading, index) => {
                        return (
                            <h2
                                className={clsx(s.topHeading, { [s.capitalize]: capitalize })}
                                key={index}
                                lang={heading.lang}
                            >
                                {heading.to ? (
                                    <Link to={heading.to} className={s.topHeadingLink}>
                                        {heading.inner}
                                    </Link>
                                ) : (
                                    <>{heading.inner}</>
                                )}
                            </h2>
                        );
                    })}
                <h1 className={s.heading} lang={mainLang}>
                    <span
                        className={clsx(s.headingInner, {
                            [s.hasBackground]: !!mainLang,
                            [s.capitalize]: capitalize,
                        })}
                    >
                        {children}
                    </span>
                </h1>
                <div className={s.subline}>{subLine}</div>
            </div>
        </header>
    );
}
