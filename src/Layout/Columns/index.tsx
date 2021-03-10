import clsx from 'clsx';
import s from './style.module.css';

type ColumnsProps = {
    children: React.ReactNode;
    reverseOnMobile?: boolean;
};

export function Columns({ children, reverseOnMobile }: ColumnsProps) {
    return <div className={clsx(s.columns, { [s.reverseOnMobile]: reverseOnMobile })}>{children}</div>;
}

type ColumnHeadingProps = {
    children: React.ReactNode;
};

export function ColumnHeading({ children }: ColumnHeadingProps) {
    return <h2 className={s.columnHeading}>{children}</h2>;
}
