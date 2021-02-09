import { Trans, useTranslation } from 'react-i18next';
import { generatePath, Link, useParams } from 'react-router-dom';
import Header from '../Header';
import { useTerm, useTranslationEntity } from '../hooks/data';
import { TERM } from '../routes';
import { TermWithLang } from '../TermWithLang';
import s from './style.module.css';

export function AddTranslationExamplePage() {
    const { termId, translationId } = useParams<{ termId: string; translationId: string }>();
    const term = useTerm(termId);
    const translation = useTranslationEntity(translationId);
    const { t } = useTranslation();

    return (
        <>
            <Header
                mainLang={translation.lang}
                subHeading={
                    <Link lang={term.lang} className={s.termLink} to={generatePath(TERM, { termId: term.id })}>
                        {term.value}
                    </Link>
                }
            >
                {translation.value}
            </Header>
            <h2>
                <Trans
                    t={t}
                    i18nKey="translationExample.add"
                    components={{
                        Term: <TermWithLang term={term} />,
                        Translation: <TermWithLang term={translation} />,
                    }}
                />
            </h2>
        </>
    );
}
