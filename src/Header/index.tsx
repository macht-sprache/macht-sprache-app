import { Lang } from '../types';
import s from './style.module.css';

type Props = {
    children: React.ReactNode;
    subLine?: React.ReactNode;
    subHeading?: React.ReactNode;
    mainLang?: Lang;
    subHeadingLang?: Lang;
};

export default function Header({ children, subLine, mainLang, subHeading, subHeadingLang }: Props) {
    return (
        <header className={s.header}>
            {subHeading && (
                <h2 className={s.subHeading} lang={subHeadingLang}>
                    {subHeading}
                </h2>
            )}
            <h1 className={subHeading ? s.headingWithSubheading : s.heading} lang={mainLang}>
                <span className={s.headingInner}>{children}</span>
            </h1>
            {subLine}
        </header>
    );
}
