import { generatePath, useParams } from 'react-router-dom';
import Comments from '../Comments';
import { collections, useTerm, useTranslationEntity } from '../hooks/data';
import Header from '../Header';
import { Columns } from '../Layout/Columns';
import { TERM } from '../routes';
import TranslationExamplesList from '../TranslationExamplesList';
import { RatingWidgetContainer } from '../Rating/RatingWidget';
import s from './style.module.css';

export function TranslationPage() {
    const { termId, translationId } = useParams<{ termId: string; translationId: string }>();
    const term = useTerm(termId);
    const translation = useTranslationEntity(translationId);

    return (
        <>
            <Header
                mainLang={translation.lang}
                topHeading={[
                    {
                        to: generatePath(TERM, { termId: term.id }),
                        inner: term.value,
                        lang: term.lang,
                    },
                ]}
            >
                {translation.value}
                <div className={s.rating}>
                    <RatingWidgetContainer term={term} translation={translation} />
                </div>
            </Header>
            <Columns>
                <TranslationExamplesList term={term} translation={translation} />
                <Comments entityRef={collections.translations.doc(translation.id)} />
            </Columns>
        </>
    );
}
