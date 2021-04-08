import { CommentListWithLinks } from '../Comments/CommentList';
import Header from '../Header';
import { collections } from '../hooks/data';
import { GetList, useCollection } from '../hooks/fetch';
import { ColumnHeading, SingleColumn } from '../Layout/Columns';
import { Comment } from '../types';

export default function AdminContentPage() {
    const getComments = useCollection(collections.comments.orderBy('createdAt', 'desc').limit(100));
    return (
        <>
            <Header>Administration – content</Header>
            <SingleColumn>
                <ColumnHeading>Comments (latest 100)</ColumnHeading>
                <Comments getComments={getComments} />
            </SingleColumn>
        </>
    );
}

function Comments({ getComments }: { getComments: GetList<Comment> }) {
    const comments = getComments();

    return (
        <div>
            {comments.map(comment => {
                return <CommentListWithLinks key={comment.id} comments={comments} />;
            })}
        </div>
    );
}
