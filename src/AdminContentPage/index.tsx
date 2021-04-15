import Header from '../Header';
import { collections } from '../hooks/data';
import { useCollection } from '../hooks/fetch';
import { ColumnHeading, FullWidthColumn } from '../Layout/Columns';
import { TermItem } from '../Terms/TermItem';
import { Term } from '../types';
import s from './style.module.css';

export default function AdminContentPage() {
    const getTerms = useCollection(collections.terms.orderBy('createdAt', 'desc').limit(10));

    return (
        <>
            <Header>Administration – content</Header>
            <FullWidthColumn>
                <ColumnHeading>Latest 10 Terms</ColumnHeading>
                <ListTerms terms={getTerms()} />
            </FullWidthColumn>
        </>
    );
}

function ListTerms({ terms }: { terms: Term[] }) {
    const sortedTerms = terms;
    return (
        <div className={s.terms}>
            {sortedTerms.map(term => (
                <TermItem key={term.id} term={term} size="small" showMeta />
            ))}
        </div>
    );
}
