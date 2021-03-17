import clsx from 'clsx';
import { FormatDate } from '../../FormatDate';
import { Comment } from '../../types';
import { trimString } from '../../utils';
import s from './style.module.css';

type CommentItemProps = {
    comment: Comment;
    size?: 'small' | 'medium';
};

export function CommentItem({ comment: { comment, createdAt, creator }, size = 'medium' }: CommentItemProps) {
    return (
        <div className={clsx(s.comment, s[size])}>
            <div className={s.body}>{size === 'medium' ? comment : trimString(comment, 100)}</div>
            <div className={s.footer}>
                <span className={s.date}>{size === 'medium' && <FormatDate date={createdAt.toDate()} />}</span>
                <span className={s.creator}>
                    <span className={s.creatorInner}>{creator.displayName}</span>
                </span>
            </div>
        </div>
    );
}
