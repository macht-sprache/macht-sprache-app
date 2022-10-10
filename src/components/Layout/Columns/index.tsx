import clsx from 'clsx';
import s from './style.module.css';

type ColumnsProps = {
    children: React.ReactNode;
    reverseOnMobile?: boolean;
    narrower?: boolean;
};

export function Columns({ children, reverseOnMobile, narrower = false }: ColumnsProps) {
    return (
        <div
            className={clsx(s.columnSection, s.columns, {
                [s.reverseOnMobile]: reverseOnMobile,
                [s.narrower]: narrower,
            })}
        >
            {children}
        </div>
    );
}

type ColumnHeadingProps = {
    children: React.ReactNode;
};

export function ColumnHeading({ children }: ColumnHeadingProps) {
    return <h2 className={s.columnHeading}>{children}</h2>;
}

type SingleColumnProps = {
    children: React.ReactNode;
};

/**
 * For pages with only one column that shouldn't spread out too much
 */
export function SingleColumn({ children }: SingleColumnProps) {
    return <div className={clsx(s.columnSection, s.singleColumn)}>{children}</div>;
}

export function FullWidthColumn({ children }: SingleColumnProps) {
    return <div className={s.columnSection}>{children}</div>;
}
