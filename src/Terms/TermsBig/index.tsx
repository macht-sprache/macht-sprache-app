import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonLink } from '../../Form/Button';
import { useUser } from '../../hooks/appContext';
import { GetList } from '../../hooks/fetch';
import { LoginHint } from '../../LoginHint';
import { TERM_ADD } from '../../routes';
import { Lang, Term } from '../../types';
import { useLang } from '../../useLang';
import { LangFilter } from '../LangFilter';
import { TermItem } from '../TermItem';
import s from './style.module.css';

type Props = {
    getTerms: GetList<Term>;
};

export function TermsBig({ getTerms }: Props) {
    const [langFilter, setLangFilter] = useState<Lang>();
    const [lang] = useLang();
    const { t } = useTranslation();
    const user = useUser();

    const terms = getTerms();
    const sortedTerms = terms
        .filter(term => !langFilter || langFilter === term.lang)
        .sort(({ value: valueA }, { value: valueB }) => valueA.localeCompare(valueB, lang));

    return (
        <>
            <div className={s.filters}>
                <LangFilter langFilter={langFilter} setLangFilter={setLangFilter} />

                {user && (
                    <ButtonLink size="small" to={TERM_ADD}>
                        {t('common.entities.term.add')}
                    </ButtonLink>
                )}
            </div>
            <div className={s.terms}>
                {sortedTerms.map(term => (
                    <TermItem key={term.id} term={term} size="small" />
                ))}
            </div>
        </>
    );
}
