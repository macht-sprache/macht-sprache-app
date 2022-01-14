import clsx from 'clsx';
import React from 'react';
import styles from './style.module.css';

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {}

export function Button({ className, ...props }: Props) {
    return <button className={clsx(styles.button, className)} aria-label="macht.sprache." {...props}></button>;
}
