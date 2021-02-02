import s from './style.module.css';

type Props = {
    children: React.ReactNode;
    subLine?: React.ReactNode;
    subHeading?: React.ReactNode;
    mainLang?: string;
};

export default function Header({ children, subLine, mainLang, subHeading }: Props) {
    return (
        <header className={s.header}>
            {subHeading && <h2 className={s.subHeading}>{subHeading}</h2>}
            <h1 className={subHeading ? s.headingWithSubheading : s.heading}>
                <span className={s.headingInner} lang={mainLang}>
                    {children}
                </span>
            </h1>
            {subLine}
        </header>
    );
}
