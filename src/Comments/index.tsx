import { CommentList } from './CommentList';

type CommentsProps = {
    comments: {
        creator: string;
        comment: string;
        date: Date;
    }[];
};

export function Comments({ comments }: CommentsProps) {
    return (
        <>
            <CommentList comments={comments} />
        </>
    );
}
