import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser } from '../hooks/appContext';
import { addComment, getCommentsRef } from '../hooks/data';
import { GetList, useCollection } from '../hooks/fetch';
import { ColumnHeading } from '../Layout/Columns';
import { Comment } from '../types';
import { CommentCreate } from './CommentCreate';
import { CommentList } from './CommentList';
import { CommentWrapper } from './CommentWrapper';
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
    const onCreate = async (comment: string) => user && addComment(user, ref, comment);

    return (
        <CommentWrapper>
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
        </CommentWrapper>
    );
}

function CommentListWrapped({ getComments }: { getComments: GetList<Comment> }) {
    return <CommentList comments={getComments()} />;
}
