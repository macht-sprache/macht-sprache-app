import s from './style.module.css';

type Props = {
    children: React.ReactNode;
    subLine?: React.ReactNode;
};

export default function Header({ children, subLine }: Props) {
    return (
        <>
            <h1 className={s.heading}>{children}</h1>
            {subLine}
        </>
    );
}
