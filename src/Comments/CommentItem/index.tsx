import clsx from 'clsx';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmModal from '../../ConfirmModal';
import { formatDate, FormatDate } from '../../FormatDate';
import { useAppContext } from '../../hooks/appContext';
import { addLike, deleteComment, getLikesRef, updateComment } from '../../hooks/data';
import { useCollection, useDocument } from '../../hooks/fetch';
import LinkButton from '../../LinkButton';
import { ModalDialog } from '../../ModalDialog';
import { Comment, User } from '../../types';
import { useLang } from '../../useLang';
import { UserInlineDisplay } from '../../UserInlineDisplay';
import { trimString } from '../../utils';
import { CommentEdit } from '../CommentEdit';
import { ReactComponent as HeartEmpty } from './heart-regular.svg';
import { ReactComponent as HeartSolid } from './heart-solid.svg';
import { ReactComponent as Pencil } from './pencil-alt-solid.svg';
import { ReactComponent as Trash } from './trash-alt-regular.svg';
import s from './style.module.css';

type CommentItemProps = {
    comment: Comment;
    size?: 'small' | 'medium';
};

export function CommentItem({
    comment: { id, comment, createdAt, creator, edited, likeCount },
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
                            <Likes id={id} user={user} likeCount={likeCount} />
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
                                    <LinkButton
                                        onClick={() => setEditOpen(true)}
                                        title={t('common.entities.comment.editAction')}
                                        className={s.metaButton}
                                    >
                                        <Pencil className={s.metaIcon} />
                                    </LinkButton>
                                </>
                            )}
                            {canDelete && (
                                <>
                                    {' '}
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

function Likes({ id, user, likeCount }: { id: string; user?: User; likeCount: number }) {
    const { t } = useTranslation();
    const [likeOverlayOpen, setLikeOverlayOpen] = useState(false);
    return (
        <>
            <Suspense fallback={null}>{user && <MetaButton id={id} user={user} />}</Suspense>{' '}
            <LinkButton disabled={!likeCount} onClick={() => setLikeOverlayOpen(true)}>
                {likeCount} {t('common.entities.like.value', { count: likeCount })}
            </LinkButton>
            <Suspense fallback={null}>
                {likeOverlayOpen && <LikeOverlay id={id} onClose={() => setLikeOverlayOpen(false)} />}
            </Suspense>
        </>
    );
}

function MetaButton({ id, user }: { id: string; user: User }) {
    const { t } = useTranslation();
    const likeRef = getLikesRef(id).doc(user.id);
    const getLike = useDocument(likeRef);
    const liked = !!getLike(true);
    const toggleLike = () => (liked ? likeRef.delete() : addLike(user, likeRef));

    return (
        <>
            <LinkButton
                onClick={toggleLike}
                className={s.metaButton}
                title={liked ? t('common.entities.like.remove') : t('common.entities.like.add')}
            >
                {liked ? <HeartSolid className={s.metaIcon} /> : <HeartEmpty className={s.metaIcon} />}
            </LinkButton>
        </>
    );
}

function LikeOverlay({ id, onClose }: { id: string; onClose: () => void }) {
    const { t } = useTranslation();
    const getLikes = useCollection(getLikesRef(id));
    return (
        <ModalDialog title={t('common.entities.like.value_plural')} onClose={onClose}>
            <ul>
                {getLikes().map(like => (
                    <li key={like.creator.id}>
                        <UserInlineDisplay {...like.creator} />
                    </li>
                ))}
            </ul>
        </ModalDialog>
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
            {onClick => (
                <LinkButton onClick={onClick} title={t('common.formNav.delete')} className={s.metaButton}>
                    <Trash className={s.metaIcon} />
                </LinkButton>
            )}
        </ConfirmModal>
    );
}
