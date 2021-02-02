import { generatePath, Link, useParams } from 'react-router-dom';
import { useTerm, useTranslationEntity } from '../dataHooks';
import Header from '../Header';
import { TERM } from '../routes';
import s from './style.module.css';

export function TranslationPage() {
    const { termId, translationId } = useParams<{ termId: string; translationId: string }>();
    const [term] = useTerm(termId);
    const [translation] = useTranslationEntity(translationId);

    return (
        <>
            <Header
                mainLang={translation?.lang}
                subHeading={
                    <Link
                        lang={term?.lang}
                        className={s.termLink}
                        to={term ? generatePath(TERM, { termId: term.id }) : '/'}
                    >
                        {term?.value}
                    </Link>
                }
            >
                {translation?.value}
            </Header>
        </>
    );
}
