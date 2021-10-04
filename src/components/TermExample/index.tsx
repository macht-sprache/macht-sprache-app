import { collections } from '../../hooks/data';
import { GetList, useCollection } from '../../hooks/fetch';
import { Lang, Term } from '../../types';
import { TermItem } from '../Terms/TermItem';

type Props = {
    term: string;
    lang: Lang;
};

export default function TermExample({ term, lang }: Props) {
    const getTerms = useCollection(collections.terms.where('value', '==', term));

    return <Inner getTerms={getTerms} lang={lang} />;
}

type InnerProps = {
    getTerms: GetList<Term>;
    lang: Lang;
};

function Inner({ getTerms, lang }: InnerProps) {
    const terms = getTerms();

    if (terms.length > 1) {
        if (!lang) {
            return <>this term exists in multiple versions. please specify the language!</>;
        }
        const term = terms.find(term => term.lang === lang);

        if (term) {
            return <TermItem term={term} size="medium" />;
        }
    }

    if (terms.length === 1) {
        return <TermItem term={terms[0]} size="medium" />;
    }

    return <>term not found</>;
}
