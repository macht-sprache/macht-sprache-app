import { useLang } from '../../useLang';
import { DateInput, formatDate } from './service';

type formatDateProps = {
    date: DateInput;
};

export function FormatDate({ date }: formatDateProps) {
    const [lang] = useLang();
    return <>{formatDate(date, lang)}</>;
}

export function FormatDateShort({ date }: formatDateProps) {
    const [lang] = useLang();
    return <span title={formatDate(date, lang)}>{formatDate(date, lang, 'short')}</span>;
}

export { formatDate };
