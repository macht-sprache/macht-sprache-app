import { CommentCreate } from './CommentCreate';
import { CommentList } from './CommentList';
import s from './style.module.css';

type CommentsProps = {
    comments: {
        creator: string;
        comment: string;
        date: Date;
    }[];
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    newComment: string;
    setNewComment: (comment: string) => void;
};

export function Comments({ comments, onSubmit, newComment, setNewComment }: CommentsProps) {
    return (
        <div className={s.container}>
            <CommentList comments={comments} />
            <CommentCreate onSubmit={onSubmit} newComment={newComment} setNewComment={setNewComment} />
        </div>
    );
}
