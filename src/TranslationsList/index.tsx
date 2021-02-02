import s from './style.module.css';
import { useTranslations } from '../dataHooks';
import { Trans, useTranslation } from 'react-i18next';
import { TermWithLang } from '../TermWithLang';
import { Term } from '../types';
import { ButtonContainer, ButtonLink } from '../Form/Button';
import { ColumnHeading } from '../Layout/Columns';
import { LoginHint } from '../LoginHint';
import { FormatDate } from '../FormatDate';
import { useLang } from '../useLang';
import { Link } from 'react-router-dom';

export function TranslationsList({ term }: { term: Term }) {
    const [translations] = useTranslations(term.id);
    const { t } = useTranslation();
    const commentCount = translations ? translations.length : 0;
    const [lang] = useLang();

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
                    <div className={s.list}>
                        {translations.map(translation => (
                            <article className={s.item} key={translation.id} lang={translation.lang}>
                                <Link to={`/term/${term.id}/translation/${translation.id}`} className={s.link}>
                                    <div className={s.header}>
                                        <h1 className={s.value}>{translation.value}</h1>
                                        <div className={s.meta} lang={lang}>
                                            <FormatDate date={translation.createdAt.toDate()} />
                                        </div>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                    <AddTranslationButton termId={term.id} />
                </>
            )}
        </div>
    );
}

function AddTranslationButton({ termId }: { termId: string }) {
    const { t } = useTranslation();

    return (
        <LoginHint i18nKey="translationList.registerToAdd">
            <ButtonContainer align="left">
                <ButtonLink to={`/term/${termId}/translation/add`}>{t('common.entities.translation.add')}</ButtonLink>
            </ButtonContainer>
        </LoginHint>
    );
}
