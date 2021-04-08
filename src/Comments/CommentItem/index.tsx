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
import HeartSolid from './heart-solid.svg';
import HeartEmpty from './heart-regular.svg';
import { ModalDialog } from '../../ModalDialog';

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
    const [liked, setLiked] = useState(false);
    const [likeOverlayOpen, setLikeOverlayOpen] = useState(false);

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
                            <LinkButton className={s.likeButton} onClick={() => setLiked(!liked)}>
                                <img src={liked ? HeartSolid : HeartEmpty} alt="" className={s.likeIcon} />
                            </LinkButton>{' '}
                            <LinkButton className={s.likeButton} onClick={() => setLikeOverlayOpen(true)}>
                                {liked ? 4 : 3} likes
                            </LinkButton>
                            {' | '}
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
            {likeOverlayOpen && (
                <ModalDialog title="Likes" onClose={() => setLikeOverlayOpen(false)}>
                    Timur
                    <br />
                    Kolja
                    <br />
                    Lucy
                    <br />
                </ModalDialog>
            )}
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
