import s from './style.module.css';
import { useTranslations } from '../dataHooks';
import { Trans, useTranslation } from 'react-i18next';
import { TermWithLang } from '../TermWithLang';
import { Term } from '../types';
import { ButtonContainer, ButtonLink } from '../Form/Button';
import { ColumnHeading } from '../Layout/Columns';

export function TranslationsList({ term }: { term: Term }) {
    const [translations] = useTranslations(term.id);
    const { t } = useTranslation();
    const addTermLink = `/term/${term.id}/translation/add`;
    const commentCount = translations ? translations.length : 0;

    return (
        <div>
            <ColumnHeading>
                {commentCount} {t('common.entities.translation.value', { count: commentCount })}
            </ColumnHeading>
            {translations === undefined && <>{t('common.loading')}</>}
            {translations && translations.length === 0 && (
                <div>
                    <Trans
                        t={t}
                        i18nKey="translationList.empty"
                        values={{ term: term.value }}
                        components={{ TermWithLang: <TermWithLang lang={term.lang}>foo</TermWithLang> }}
                    />
                    <ButtonContainer align="left">
                        <ButtonLink to={addTermLink}>{t('common.entities.translation.add')}</ButtonLink>
                    </ButtonContainer>
                </div>
            )}
            {translations && translations.length > 0 && (
                <>
                    <ul className={s.list}>
                        {translations.map(translation => (
                            <li key={translation.id}>{translation.value}</li>
                        ))}
                    </ul>
                    <ButtonContainer align="left">
                        <ButtonLink to={addTermLink}>{t('common.entities.translation.add')}</ButtonLink>
                    </ButtonContainer>
                </>
            )}
        </div>
    );
}
