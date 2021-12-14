import { useLang } from '../../useLang';
import { DateInput, formatDate } from './service';

type formatDateProps = {
    date: DateInput;
    length?: 'medium' | 'short';
};

export function FormatDate({ date, length = 'medium' }: formatDateProps) {
    const [lang] = useLang();

    if (length === 'short') {
        return <span title={formatDate(date, lang)}>{formatDate(date, lang, 'short')}</span>;
    }

    return <>{formatDate(date, lang)}</>;
}

export { formatDate };
