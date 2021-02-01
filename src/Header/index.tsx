import s from './style.module.css';

type Props = {
    children: React.ReactNode;
    subLine?: React.ReactNode;
    mainLang?: string;
};

export default function Header({ children, subLine, mainLang }: Props) {
    return (
        <>
            <h1 className={s.heading}>
                <span className={s.headingInner} lang={mainLang}>
                    {children}
                </span>
            </h1>
            {subLine}
        </>
    );
}
