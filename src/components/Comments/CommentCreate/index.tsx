import { useTranslation } from 'react-i18next';
import { LoginHint } from '../../LoginHint';
import { CommentEdit } from '../CommentEdit';

type CommentCreateProps = {
    onCreate: (newComment: string) => Promise<unknown>;
    placeholder?: string;
};

export function CommentCreate({ onCreate, placeholder }: CommentCreateProps) {
    const { t } = useTranslation();

    return (
        <LoginHint i18nKey="comment.registerToAdd">
            <CommentEdit
                label={t('common.entities.comment.add')}
                submitLabel={t('common.entities.comment.action')}
                placeholder={placeholder}
                onSubmit={onCreate}
            />
        </LoginHint>
    );
}
