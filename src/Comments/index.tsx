import { Suspense, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { useUser } from '../hooks/appContext';
import { addComment, getCommentsRef } from '../hooks/data';
import { GetList, useCollection } from '../hooks/fetch';
import { ColumnHeading } from '../Layout/Columns';
import { Comment } from '../types';
import { CommentCreate } from './CommentCreate';
import { CommentList } from './CommentList';
import { getCommentDomId } from './service';
import s from './style.module.css';

type Props = {
    entityRef: Comment['ref'];
    commentCount: number;
    headingHint?: React.ReactNode;
    placeholder?: string;
};

export default function Comments({ entityRef: ref, commentCount, headingHint, placeholder }: Props) {
    const user = useUser();
    const getComments = useCollection(getCommentsRef(ref));
    const { t } = useTranslation();
    const history = useHistory();
    const onCreate = useCallback(
        async (comment: string) => {
            if (!user) {
                return;
            }
            const newCommentRef = await addComment(user, ref, comment);
            history.replace('#' + getCommentDomId(newCommentRef.id));
        },
        [history, ref, user]
    );

    return (
        <div>
            <ColumnHeading>
                <div className={s.heading}>
                    <div className={s.headingMain}>
                        {commentCount} {t('common.entities.comment.value', { count: commentCount })}
                    </div>
                    {headingHint && (
                        <>
                            <span className={s.headingHint}>{headingHint}</span>
                        </>
                    )}
                </div>
            </ColumnHeading>
            <Suspense fallback={null}>
                <CommentListWrapped getComments={getComments} />
                <CommentCreate placeholder={placeholder} onCreate={onCreate} />
            </Suspense>
        </div>
    );
}

function CommentListWrapped({ getComments }: { getComments: GetList<Comment> }) {
    return <CommentList comments={getComments()} />;
}
