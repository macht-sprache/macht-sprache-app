import type firebase from 'firebase/compat';
import { Lang } from '../../types';

export type DateInput = Date | firebase.firestore.Timestamp;

const dateOptions: Record<'medium' | 'short', Intl.DateTimeFormatOptions> = {
    short: {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
    },
    medium: {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    },
};

export const formatDate = (date: DateInput, lang: Lang, length: 'medium' | 'short' = 'medium') =>
    new Intl.DateTimeFormat(lang, dateOptions[length]).format(date instanceof Date ? date : date.toDate());
