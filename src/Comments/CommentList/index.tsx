import { generatePath, Link } from 'react-router-dom';
import { useDocument } from '../../hooks/fetch';
import { TERM, TRANSLATION_EXAMPLE_REDIRECT } from '../../routes';
import { Comment, DocReference, Source, Term, Translation, TranslationExample } from '../../types';
import { CommentItem } from '../CommentItem';
import s from './style.module.css';

type CommentListProps = {
    comments: Comment[];
};

export function CommentList({ comments }: CommentListProps) {
    return (
        <div className={s.container}>
            {comments.map(comment => {
                return <CommentItem key={comment.id} comment={comment} />;
            })}
        </div>
    );
}

export function CommentListWithLinks({ comments }: CommentListProps) {
    return (
        <div className={s.container}>
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
            <LinkToDocument document={linkedDocument} documentRef={comment.ref} />
            <CommentItem key={comment.id} comment={comment} />
        </div>
    );
}

function LinkToDocument({
    document,
    documentRef,
}: {
    document: Term | Translation | TranslationExample;
    documentRef: DocReference<Term | Translation | TranslationExample>;
}) {
    if (documentRef.parent.id === 'terms') {
        const term = document as Term;

        return (
            <div style={{ marginBottom: '.5rem' }}>
                On <Link to={generatePath(TERM, { termId: documentRef.id })}>{term.value}</Link>
            </div>
        );
    }

    if (documentRef.parent.id === 'translationExamples') {
        const example = document as TranslationExample;

        return (
            <div style={{ marginBottom: '.5rem' }}>
                On <LinkToTranslationExample example={example} exampleId={documentRef.id} />
            </div>
        );
    }

    return null;
}

function LinkToTranslationExample({ example, exampleId }: { example: TranslationExample; exampleId: string }) {
    const getOriginalSource = useDocument(example.original.source as DocReference<Source>);
    const original = getOriginalSource();

    return (
        <Link to={generatePath(TRANSLATION_EXAMPLE_REDIRECT, { translationExampleId: exampleId })}>
            {original.title}
        </Link>
    );
}
