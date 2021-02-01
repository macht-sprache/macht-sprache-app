import s from './style.module.css';
import { useTranslations } from '../dataHooks';
import { Trans, useTranslation } from 'react-i18next';
import { TermWithLang } from '../TermWithLang';
import { Term } from '../types';

export function TranslationsList({ term }: { term: Term }) {
    const [translations] = useTranslations(term.id);
    const { t } = useTranslation();

    if (translations === undefined) {
        return <>{t('common.loading')}</>;
    }

    if (translations.length === 0) {
        return (
            <div>
                <Trans
                    t={t}
                    i18nKey="translationList.empty"
                    values={{ term: term.value }}
                    components={{ TermWithLang: <TermWithLang lang={term.lang}>foo</TermWithLang> }}
                />
            </div>
        );
    }

    return (
        <ul className={s.list}>
            {translations.map(translation => (
                <li key={translation.id}>{translation.value}</li>
            ))}
        </ul>
    );
}
