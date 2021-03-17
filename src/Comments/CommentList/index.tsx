import { Comment } from '../../types';
import { CommentItem } from '../CommentItem';
import s from './style.module.css';

type CommentListProps = {
    comments: Comment[];
};

export function CommentList({ comments }: CommentListProps) {
    return (
        <div className={s.container}>
            {comments.map(comment => {
                return <CommentItem key={comment.id} comment={comment} />;
            })}
        </div>
    );
}
