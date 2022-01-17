import clsx from 'clsx';
import React from 'react';
import { Status } from '../types';
import s from './style.module.css';

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    status?: Status;
}

export function Button({ className, status, ...props }: Props) {
    return (
        <button
            className={clsx(s.button, className, { [s.loading]: status === 'loading' })}
            aria-label="macht.sprache."
            {...props}
        ></button>
    );
}
