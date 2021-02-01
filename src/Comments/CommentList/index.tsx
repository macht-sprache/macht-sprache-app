import { FormatDate } from '../../FormatDate';
import { Comment } from '../../types';
import s from './style.module.css';

type CommentListProps = {
    comments: Comment[];
};

export function CommentList({ comments }: CommentListProps) {
    return (
        <ul className={s.container}>
            {comments.map(({ id, comment, createdAt, creator }) => {
                return (
                    <li key={id} className={s.comment}>
                        <div className={s.body}>{comment}</div>
                        <div className={s.footer}>
                            <span className={s.creator}>{creator.displayName}</span>
                            <span className={s.date}>
                                <FormatDate date={createdAt.toDate()} />
                            </span>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
