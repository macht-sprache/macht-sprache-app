import { useState } from 'react';
import Button from '../../Form/Button';
import { Textarea } from '../../Form/Input';
import InputContainer from '../../Form/InputContainer';
import s from './style.module.css';

type CommentCreateProps = {
    onCreate: (newComment: string) => Promise<unknown>;
};

export function CommentCreate({ onCreate }: CommentCreateProps) {
    const [submitting, setSubmitting] = useState(false);
    const [comment, setComment] = useState('');

    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        onCreate(comment)
            .then(() => setComment(''))
            .catch(error => console.error(error))
            .finally(() => setSubmitting(false));
    };

    return (
        <form className={s.form} onSubmit={onSubmit}>
            <InputContainer>
                <Textarea
                    value={comment}
                    disabled={submitting}
                    onChange={value => {
                        setComment(value.target.value);
                    }}
                    label="Add your comment"
                />
            </InputContainer>
            <div className={s.buttonWrapper}>
                <Button type="submit" disabled={!comment || submitting}>
                    Comment
                </Button>
            </div>
        </form>
    );
}
