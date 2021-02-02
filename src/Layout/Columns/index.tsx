import s from './style.module.css';

type ColumnsProps = {
    children: React.ReactNode;
};

export function Columns({ children }: ColumnsProps) {
    return <div className={s.columns}>{children}</div>;
}
