import { useLang } from '../useLang';

type formatDateProps = {
    date: Date;
};

export function FormatDate({ date }: formatDateProps) {
    const [lang] = useLang();

    if (!date) {
        return null;
    }

    const formattedDate = new Intl.DateTimeFormat(lang, { dateStyle: 'short', timeStyle: 'short' }).format(date);
    return <>{formattedDate}</>;
}
