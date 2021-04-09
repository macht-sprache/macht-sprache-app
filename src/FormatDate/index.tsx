import { useLang } from '../useLang';
import type firebase from 'firebase';
import { Lang } from '../types';

type formatDateProps = {
    date: Date | firebase.firestore.Timestamp;
};

const dateOptions: Intl.DateTimeFormatOptions = {
    year: '2-digit',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
};

export function FormatDate({ date }: formatDateProps) {
    const [lang] = useLang();
    return <>{formatDate(date, lang)}</>;
}

export const formatDate = (date: formatDateProps['date'], lang: Lang) =>
    new Intl.DateTimeFormat(lang, dateOptions).format(date instanceof Date ? date : date.toDate());
