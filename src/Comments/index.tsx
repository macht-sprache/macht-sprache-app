import { useTranslation } from 'react-i18next';
import { useUser } from '../hooks/appContext';
import { addComment, useComments } from '../hooks/data';
import { ColumnHeading } from '../Layout/Columns';
import { Comment } from '../types';
import { CommentCreate } from './CommentCreate';
import { CommentList } from './CommentList';
import { CommentWrapper } from './CommentWrapper';
import s from './style.module.css';

type Props = {
    entityRef: Comment['ref'];
    headingHint?: React.ReactNode;
    placeholder?: string;
};

export default function Comments({ entityRef: ref, headingHint, placeholder }: Props) {
    const user = useUser();
    const comments = useComments(ref);
    const { t } = useTranslation();
    const commentCount = comments.length;
    const onCreate = async (comment: string) => user && addComment(user, ref, comment);

    return (
        <CommentWrapper>
            <ColumnHeading>
                {commentCount} {t('common.entities.comment.value', { count: commentCount })}
                {headingHint && (
                    <>
                        {' '}
                        <span className={s.headingHint}>{headingHint}</span>
                    </>
                )}
            </ColumnHeading>
            <CommentList comments={comments} />
            <CommentCreate placeholder={placeholder} onCreate={onCreate} />
        </CommentWrapper>
    );
}
