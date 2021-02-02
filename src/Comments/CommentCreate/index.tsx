import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useUser } from '../../authHooks';
import Button from '../../Form/Button';
import { Textarea } from '../../Form/Input';
import InputContainer from '../../Form/InputContainer';
import s from './style.module.css';

type CommentCreateProps = {
    onCreate: (newComment: string) => Promise<unknown>;
};

export function CommentCreate({ onCreate }: CommentCreateProps) {
    const user = useUser();
    const [submitting, setSubmitting] = useState(false);
    const [comment, setComment] = useState('');
    const { t } = useTranslation();

    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        onCreate(comment)
            .then(() => setComment(''))
            .catch(error => console.error(error))
            .finally(() => setSubmitting(false));
    };

    if (!user) {
        return (
            <div>
                <Trans
                    t={t}
                    i18nKey="comment.registerToAdd"
                    components={{ LoginLink: <Link to="/login" />, SignUpLink: <Link to="/signup" /> }}
                />
            </div>
        );
    }

    return (
        <form className={s.form} onSubmit={onSubmit}>
            <InputContainer>
                <Textarea
                    value={comment}
                    disabled={submitting}
                    onChange={value => {
                        setComment(value.target.value);
                    }}
                    label={t('common.entities.comment.add')}
                />
            </InputContainer>
            <div className={s.buttonWrapper}>
                <Button type="submit" disabled={!comment || submitting}>
                    {t('common.entities.comment.action')}
                </Button>
            </div>
        </form>
    );
}
