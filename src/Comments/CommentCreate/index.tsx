import Button from '../../Form/Button';
import { Textarea } from '../../Form/Input';
import InputContainer from '../../Form/InputContainer';
import s from './style.module.css';

type CommentCreateProps = {
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    newComment: string;
    setNewComment: (comment: string) => void;
};

export function CommentCreate({ onSubmit, newComment, setNewComment }: CommentCreateProps) {
    return (
        <form className={s.form} onSubmit={onSubmit}>
            <InputContainer>
                <Textarea
                    value={newComment}
                    onChange={value => {
                        setNewComment(value.target.value);
                    }}
                    label="Add your comment"
                />
            </InputContainer>
            <div className={s.buttonWrapper}>
                <Button type="submit">Comment</Button>
            </div>
        </form>
    );
}
