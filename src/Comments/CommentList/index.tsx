import { formatDate } from '../../formatDate';
import s from './style.module.css';

type CommentListProps = {
    comments: {
        creator: string;
        comment: string;
        date: Date;
    }[];
};

export function CommentList({ comments }: CommentListProps) {
    return (
        <ul className={s.container}>
            {comments.map(({ comment, date, creator }, index) => {
                return (
                    <li key={index} className={s.comment}>
                        <div className={s.body}>{comment}</div>
                        <div className={s.footer}>
                            <span className={s.creator}>{creator}</span>
                            <span className={s.date}>{formatDate({ date })}</span>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
