import s from './style.module.css';
import { useTranslations } from '../dataHooks';
import { Trans, useTranslation } from 'react-i18next';
import { TermWithLang } from '../TermWithLang';
import { Term } from '../types';
import { ButtonContainer, ButtonLink } from '../Form/Button';
import { ColumnHeading } from '../Layout/Columns';
import { Link } from 'react-router-dom';
import { useUser } from '../authHooks';

export function TranslationsList({ term }: { term: Term }) {
    const [translations] = useTranslations(term.id);
    const { t } = useTranslation();
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
                    <AddTranslationButton termId={term.id} />
                </div>
            )}
            {translations && translations.length > 0 && (
                <>
                    <ul className={s.list}>
                        {translations.map(translation => (
                            <li key={translation.id}>{translation.value}</li>
                        ))}
                    </ul>
                    <AddTranslationButton termId={term.id} />
                </>
            )}
        </div>
    );
}

function AddTranslationButton({ termId }: { termId: string }) {
    const { t } = useTranslation();
    const user = useUser();

    if (!user) {
        return (
            <Trans
                t={t}
                i18nKey="translationList.registerToAdd"
                components={{ LoginLink: <Link to="/login" />, SignUpLink: <Link to="/signup" /> }}
            />
        );
    }

    return (
        <ButtonContainer align="left">
            <ButtonLink to={`/term/${termId}/translation/add`}>{t('common.entities.translation.add')}</ButtonLink>
        </ButtonContainer>
    );
}
