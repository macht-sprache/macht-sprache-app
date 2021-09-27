import { ContentItemList } from '../../components/ContentItemList';
import { SimpleHeader } from '../../components/Header';
import { collections } from '../../hooks/data';
import { useCollection } from '../../hooks/fetch';
import { ColumnHeading, SingleColumn } from '../../components/Layout/Columns';

export default function AdminCommentsPage() {
    const getComments = useCollection(collections.comments.orderBy('createdAt', 'desc').limit(100));
    return (
        <>
            <SimpleHeader>Administration – comments</SimpleHeader>
            <SingleColumn>
                <ColumnHeading>Comments (latest 100)</ColumnHeading>
                <ContentItemList comments={getComments()} />
            </SingleColumn>
        </>
    );
}
