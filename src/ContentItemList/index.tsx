import { ContentItemLinkWrapper } from '../ContentItemLinkWrapper';
import { Comment } from '../types';
import s from './style.module.css';

export function ContentItemList({ items }: { items: Comment[] }) {
    return (
        <div className={s.container}>
            {items.map(comment => (
                <ContentItemLinkWrapper key={comment.id} comment={comment} />
            ))}
        </div>
    );
}
