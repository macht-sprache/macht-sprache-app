import { useLang } from '../../useLang';
import { DateInput, formatDate } from './service';

type formatDateProps = {
    date: DateInput;
};

export function FormatDate({ date }: formatDateProps) {
    const [lang] = useLang();
    return <>{formatDate(date, lang)}</>;
}

export { formatDate };
