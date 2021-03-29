import { useTranslation } from 'react-i18next';
import s from './style.module.css';

type WpStyleProps = {
    body?: string;
};

export function WpStyle({ body }: WpStyleProps) {
    const { t } = useTranslation();

    return (
        <>
            {body ? (
                <div className={s.container} dangerouslySetInnerHTML={{ __html: body }} />
            ) : (
                <>{t('common.loading')}</>
            )}
        </>
    );
}
