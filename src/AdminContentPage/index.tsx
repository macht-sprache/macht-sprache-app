import { CommentListWithLinks } from '../Comments/CommentList';
import Header from '../Header';
import { collections } from '../hooks/data';
import { useCollection } from '../hooks/fetch';
import { ColumnHeading, SingleColumn } from '../Layout/Columns';

export default function AdminContentPage() {
    const getComments = useCollection(collections.comments.orderBy('createdAt', 'desc').limit(100));
    return (
        <>
            <Header>Administration – content</Header>
            <SingleColumn>
                <ColumnHeading>Comments (latest 100)</ColumnHeading>
                <CommentListWithLinks comments={getComments()} />
            </SingleColumn>
        </>
    );
}
