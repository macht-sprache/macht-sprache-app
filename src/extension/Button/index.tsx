import clsx from 'clsx';
import React from 'react';
import { Status } from '../types';
import s from './style.module.css';

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    status?: Status;
    hasResult: boolean;
}

export function Button({ className, status, hasResult, ...props }: Props) {
    return (
        <button
            className={clsx(s.button, className, { [s.loading]: status === 'loading', [s.noResult]: !hasResult })}
            aria-label="macht.sprache."
            {...props}
        ></button>
    );
}
