import { ContentItemList } from '../ContentItemList';
import Header from '../Header';
import { collections } from '../hooks/data';
import { useCollection } from '../hooks/fetch';
import { ColumnHeading, SingleColumn } from '../Layout/Columns';

export default function AdminCommentsPage() {
    const getComments = useCollection(collections.comments.orderBy('createdAt', 'desc').limit(100));
    return (
        <>
            <Header>Administration – comments</Header>
            <SingleColumn>
                <ColumnHeading>Comments (latest 100)</ColumnHeading>
                <ContentItemList items={getComments()} />
            </SingleColumn>
        </>
    );
}
