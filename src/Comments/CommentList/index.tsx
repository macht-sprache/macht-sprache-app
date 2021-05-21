import { useLocation } from 'react-router-dom';
import { Comment } from '../../types';
import { CommentItem } from '../CommentItem';
import { getCommentIdFromHash } from '../service';
import s from './style.module.css';

type CommentListProps = {
    comments: Comment[];
};

export function CommentList({ comments }: CommentListProps) {
    const location = useLocation();
    const targetCommentId = getCommentIdFromHash(location.hash);

    if (!comments.length) {
        return null;
    }

    return (
        <div className={s.container}>
            {comments.map(comment => {
                return <CommentItem key={comment.id} comment={comment} isTarget={targetCommentId === comment.id} />;
            })}
        </div>
    );
}
