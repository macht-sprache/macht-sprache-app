import React from 'react';
import s from './style.module.css';

type Props = {
    children: React.ReactNode;
    span?: number;
};

export default function BlankBox({ children, span = 4 }: Props) {
    return (
        <div className={s.container} style={{ gridColumn: `span ${span}` }}>
            {children}
        </div>
    );
}
