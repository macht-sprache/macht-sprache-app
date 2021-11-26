import { ContentItemList } from '../../../components/ContentItemList';
import { ColumnHeading, SingleColumn } from '../../../components/Layout/Columns';
import { collections } from '../../../hooks/data';
import { useCollection } from '../../../hooks/fetch';

export default function AdminCommentsPage() {
    const getComments = useCollection(collections.comments.orderBy('createdAt', 'desc').limit(100));
    return (
        <>
            <SingleColumn>
                <ColumnHeading>Comments (latest 100)</ColumnHeading>
                <ContentItemList comments={getComments()} />
            </SingleColumn>
        </>
    );
}
