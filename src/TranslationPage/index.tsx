import { generatePath, Link, useParams } from 'react-router-dom';
import Comments from '../Comments';
import { collections, useTerm, useTranslationEntity } from '../hooks/data';
import Header from '../Header';
import { Columns } from '../Layout/Columns';
import { TERM } from '../routes';
import TranslationExamplesList from '../TranslationExamplesList';
import s from './style.module.css';

export function TranslationPage() {
    const { termId, translationId } = useParams<{ termId: string; translationId: string }>();
    const term = useTerm(termId);
    const translation = useTranslationEntity(translationId);

    return (
        <>
            <Header
                mainLang={translation.lang}
                subHeadingLang={term.lang}
                subHeading={
                    <Link className={s.termLink} to={generatePath(TERM, { termId: term.id })}>
                        {term.value}
                    </Link>
                }
            >
                {translation.value}
            </Header>
            <Columns>
                <TranslationExamplesList term={term} translation={translation} />
                <Comments entityRef={collections.translations.doc(translation.id)} />
            </Columns>
        </>
    );
}
