import { useTranslation } from 'react-i18next';
import { useUser } from '../hooks/appContext';
import { addComment, useComments } from '../hooks/data';
import { ColumnHeading } from '../Layout/Columns';
import { Comment } from '../types';
import { CommentCreate } from './CommentCreate';
import { CommentList } from './CommentList';
import { CommentWrapper } from './CommentWrapper';

type Props = {
    entityRef: Comment['ref'];
};

export default function Comments({ entityRef: ref }: Props) {
    const user = useUser();
    const comments = useComments(ref);
    const { t } = useTranslation();
    const commentCount = comments.length;
    const onCreate = async (comment: string) => user && addComment(user, ref, comment);

    return (
        <CommentWrapper>
            <ColumnHeading>
                {commentCount} {t('common.entities.comment.value', { count: commentCount })}
            </ColumnHeading>
            <CommentList comments={comments} />
            <CommentCreate onCreate={onCreate} />
        </CommentWrapper>
    );
}
