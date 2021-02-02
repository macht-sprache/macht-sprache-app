import s from './style.module.css';

type ColumnsProps = {
    children: React.ReactNode;
};

export function Columns({ children }: ColumnsProps) {
    return <div className={s.columns}>{children}</div>;
}

type ColumnHeadingProps = {
    children: React.ReactNode;
};

export function ColumnHeading({ children }: ColumnHeadingProps) {
    return <h2 className={s.columnHeading}>{children}</h2>;
}
