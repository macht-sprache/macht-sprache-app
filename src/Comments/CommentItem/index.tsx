import clsx from 'clsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmModal from '../../ConfirmModal';
import { formatDate, FormatDate } from '../../FormatDate';
import { useAppContext } from '../../hooks/appContext';
import { deleteComment, updateComment } from '../../hooks/data';
import LinkButton from '../../LinkButton';
import { Comment } from '../../types';
import { useLang } from '../../useLang';
import { UserInlineDisplay } from '../../UserInlineDisplay';
import { trimString } from '../../utils';
import { CommentEdit } from '../CommentEdit';
import s from './style.module.css';

type CommentItemProps = {
    comment: Comment;
    size?: 'small' | 'medium';
};

export function CommentItem({
    comment: { id, comment, createdAt, creator, edited },
    size = 'medium',
}: CommentItemProps) {
    const { t } = useTranslation();
    const [lang] = useLang();
    const { user, userProperties } = useAppContext();
    const [editOpen, setEditOpen] = useState(false);
    const canEdit = creator.id === user?.id || userProperties?.admin;
    const canDelete = userProperties?.admin;

    if (user && editOpen) {
        const onSubmit = (newComment: string) => updateComment(user, id, newComment);
        return (
            <CommentEdit
                comment={comment}
                label="Edit Comment"
                submitLabel={t('common.formNav.save')}
                onSubmit={onSubmit}
                onClose={() => setEditOpen(false)}
            />
        );
    }

    return (
        <div className={clsx(s.comment, s[size])}>
            <div className={s.body}>{size === 'medium' ? comment : trimString(comment, 100)}</div>
            <div className={s.footer}>
                <span className={s.meta}>
                    {size === 'medium' && (
                        <>
                            <FormatDate date={createdAt} />
                            {edited && (
                                <>
                                    {' '}
                                    <span title={formatDate(edited.at, lang)}>
                                        ({t('common.entities.comment.edited')})
                                    </span>
                                </>
                            )}
                            {canEdit && (
                                <>
                                    {' | '}
                                    <LinkButton onClick={() => setEditOpen(true)}>
                                        {t('common.entities.comment.editAction')}
                                    </LinkButton>
                                </>
                            )}
                            {canDelete && (
                                <>
                                    {' | '}
                                    <DeleteButton id={id} />
                                </>
                            )}
                        </>
                    )}
                </span>
                <span className={s.creator}>
                    <span className={s.creatorInner}>
                        <UserInlineDisplay {...creator} />
                    </span>
                </span>
            </div>
        </div>
    );
}

function DeleteButton({ id }: { id: string }) {
    const { t } = useTranslation();
    return (
        <ConfirmModal
            title={t('comment.deleteHeading')}
            body={<p>{t('comment.deleteExplanation')}</p>}
            confirmLabel={t('common.formNav.delete')}
            onConfirm={() => deleteComment(id)}
        >
            {onClick => <LinkButton onClick={onClick}>{t('common.formNav.delete')}</LinkButton>}
        </ConfirmModal>
    );
}
