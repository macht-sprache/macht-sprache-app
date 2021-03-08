import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { Lang } from '../types';
import { useLang } from '../useLang';
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
    rating?: React.ReactNode;
    capitalize?: boolean;
};

export default function Header({ children, subLine, mainLang, topHeading, rating, capitalize = true }: Props) {
    const [lang] = useLang();

    return (
        <header className={s.header}>
            {topHeading &&
                topHeading.map((heading, index) => {
                    return (
                        <h2
                            className={clsx(s.topHeading, { [s.capitalize]: capitalize })}
                            key={index}
                            lang={heading.lang}
                        >
                            <Link to={heading.to} className={s.topHeadingLink}>
                                {heading.inner}
                            </Link>
                        </h2>
                    );
                })}
            <h1 className={s.heading} lang={mainLang}>
                <span className={clsx(s.headingInner, { [s.hasBackground]: !!mainLang, [s.capitalize]: capitalize })}>
                    {children}
                </span>
                {rating && (
                    <div lang={lang} className={s.rating}>
                        {rating}
                    </div>
                )}
            </h1>
            {subLine}
        </header>
    );
}
