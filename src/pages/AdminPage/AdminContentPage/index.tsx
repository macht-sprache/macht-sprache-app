import { ColumnHeading, FullWidthColumn } from '../../../components/Layout/Columns';
import { TermItem } from '../../../components/Terms/TermItem';
import { TranslationItem } from '../../../components/TranslationsList';
import { collections } from '../../../hooks/data';
import { useCollection, useDocument } from '../../../hooks/fetch';
import { Term, Translation } from '../../../types';
import s from './style.module.css';

export default function AdminContentPage() {
    const getTerms = useCollection(collections.terms.orderBy('createdAt', 'desc').limit(10));
    const getTranslations = useCollection(collections.translations.orderBy('createdAt', 'desc').limit(10));

    return (
        <>
            <FullWidthColumn>
                <ColumnHeading>Latest 10 Terms</ColumnHeading>
                <ListTerms terms={getTerms()} />
            </FullWidthColumn>
            <FullWidthColumn>
                <ColumnHeading>Latest 10 Translations</ColumnHeading>
                <ListTranslations translations={getTranslations()} />
            </FullWidthColumn>
        </>
    );
}

function ListTerms({ terms }: { terms: Term[] }) {
    return (
        <div className={s.items}>
            {terms.map(term => (
                <TermItem key={term.id} term={term} size="small" showMeta />
            ))}
        </div>
    );
}

function ListTranslations({ translations }: { translations: Translation[] }) {
    return (
        <div className={s.items}>
            {translations.map(translation => (
                <TranslationItemWithoutTerm key={translation.id} translation={translation} />
            ))}
        </div>
    );
}

function TranslationItemWithoutTerm({ translation }: { translation: Translation }) {
    const getTerm = useDocument(collections.terms.doc(translation.term.id));

    return <TranslationItem translation={translation} term={getTerm()} showMeta />;
}
