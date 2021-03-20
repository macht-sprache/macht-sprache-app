import { useLang } from '../useLang';
import type firebase from 'firebase';
import { Lang } from '../types';

type formatDateProps = {
    date: Date | firebase.firestore.Timestamp;
};

export function FormatDate({ date }: formatDateProps) {
    const [lang] = useLang();
    return <>{formatDate(date, lang)}</>;
}

export const formatDate = (date: formatDateProps['date'], lang: Lang) =>
    new Intl.DateTimeFormat(lang, { dateStyle: 'short', timeStyle: 'short' }).format(
        date instanceof Date ? date : date.toDate()
    );
