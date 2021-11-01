import type firebase from 'firebase/compat';
import { Lang } from '../../types';

export type DateInput = Date | firebase.firestore.Timestamp;

const dateOptions: Intl.DateTimeFormatOptions = {
    year: '2-digit',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
};

export const formatDate = (date: DateInput, lang: Lang) =>
    new Intl.DateTimeFormat(lang, dateOptions).format(date instanceof Date ? date : date.toDate());
