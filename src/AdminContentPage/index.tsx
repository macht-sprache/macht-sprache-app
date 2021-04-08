import { generatePath, Link } from 'react-router-dom';
import { CommentItem } from '../Comments/CommentItem';
import Header from '../Header';
import { collections } from '../hooks/data';
import { GetList, useCollection, useDocument } from '../hooks/fetch';
import { ColumnHeading, SingleColumn } from '../Layout/Columns';
import { TERM } from '../routes';
import { Comment, DocReference, Term, Translation, TranslationExample } from '../types';

export default function AdminContentPage() {
    const getComments = useCollection(collections.comments.orderBy('createdAt', 'desc').limit(100));
    return (
        <>
            <Header>Administration – content</Header>
            <SingleColumn>
                <ColumnHeading>Comments (latest 100)</ColumnHeading>
                <Comments getComments={getComments} />
            </SingleColumn>
        </>
    );
}

function Comments({ getComments }: { getComments: GetList<Comment> }) {
    const comments = getComments();

    return (
        <div>
            {comments.map(comment => {
                return <CommentWithLink key={comment.id} comment={comment} />;
            })}
        </div>
    );
}

function CommentWithLink({ comment }: { comment: Comment }) {
    const getDocument = useDocument(comment.ref);
    const linkedDocument = getDocument();

    return (
        <div style={{ marginBottom: '2rem' }}>
            <LinkToDocument document={linkedDocument} commentRef={comment.ref} />
            <CommentItem key={comment.id} comment={comment} />
        </div>
    );
}

function LinkToDocument({
    document,
    commentRef,
}: {
    document: Term | Translation | TranslationExample;
    commentRef: DocReference<Term | Translation | TranslationExample>;
}) {
    if (commentRef.parent.id === 'terms') {
        const term = document as Term;

        return (
            <div style={{ marginBottom: '.5rem' }}>
                On <Link to={generatePath(TERM, { termId: commentRef.id })}>{term.value}</Link>
            </div>
        );
    }

    if (commentRef.parent.id === 'translationExamples') {
        const example = document as TranslationExample;
        console.log(example);

        return <div style={{ marginBottom: '.5rem' }}>TODO: NEEDS LINK</div>;
    }

    return null;
}
