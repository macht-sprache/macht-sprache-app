import clsx from 'clsx';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Status } from '../types';
import s from './style.module.css';

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    status?: Status;
    results: number;
    size?: 'google' | 'deepl';
}

export function Button({ className, status, results, size = 'google', ...props }: Props) {
    const { t } = useTranslation();

    if (status === 'inactive') {
        return null;
    }

    return (
        <span
            className={clsx(s.button, className, {
                [s.loading]: status === 'loading',
                [s.noResult]: !results,
                [s.deepl]: (size = 'deepl'),
            })}
            aria-label="macht.sprache."
            title={results ? `${results} ${t('extension.result', { count: results })}` : t('extension.noResults')}
            {...props}
        ></span>
    );
}
