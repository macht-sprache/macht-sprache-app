import { useTranslation } from 'react-i18next';
import { useUser } from '../authHooks';
import { addComment, useComments } from '../dataHooks';
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
    const [comments] = useComments(ref);
    const { t } = useTranslation();
    const commentCount = comments ? comments.length : 0;
    const onCreate = async (comment: string) => user && addComment(user, ref, comment);

    return (
        <CommentWrapper>
            <ColumnHeading>
                {commentCount} {t('common.entities.comment.value', { count: commentCount })}
            </ColumnHeading>
            <CommentList comments={comments || []} />
            {user && <CommentCreate onCreate={onCreate} />}
        </CommentWrapper>
    );
}
