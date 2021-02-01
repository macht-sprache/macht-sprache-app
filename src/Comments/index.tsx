import { useUser } from '../authHooks';
import { addComment, useComments } from '../dataHooks';
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
    const onCreate = async (comment: string) => user && addComment(ref, comment, user);

    return (
        <CommentWrapper>
            <CommentList comments={comments || []} />
            {user && <CommentCreate onCreate={onCreate} />}
        </CommentWrapper>
    );
}
