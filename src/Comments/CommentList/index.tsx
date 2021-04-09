import { Suspense } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router-dom';
import { Get, useDocument } from '../../hooks/fetch';
import { TERM, TRANSLATION, TRANSLATION_EXAMPLE_REDIRECT } from '../../routes';
import { Comment, DocReference, Source, Term, Translation, TranslationExample, UserMini } from '../../types';
import { UserInlineDisplay } from '../../UserInlineDisplay';
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
                return <CommentWithLinkContainer key={comment.id} comment={comment} />;
            })}
        </div>
    );
}

function CommentWithLinkContainer({ comment }: { comment: Comment }) {
    const getDocument = useDocument(comment.ref);

    return (
        <Suspense fallback={null}>
            <CommentWithLink comment={comment} getDocument={getDocument} />
        </Suspense>
    );
}

function CommentWithLink({
    comment,
    getDocument,
}: {
    comment: Comment;
    getDocument: Get<Translation | Term | TranslationExample>;
}) {
    const linkedDocument = getDocument(true);

    if (!linkedDocument) {
        return null;
    }

    return (
        <div>
            <div className={s.linkToDocument}>
                <LinkToDocument document={linkedDocument} documentRef={comment.ref} creator={comment.creator} />
            </div>
            <CommentItem key={comment.id} comment={comment} />
        </div>
    );
}

function LinkToDocument({
    document,
    documentRef,
    creator,
}: {
    document: Term | Translation | TranslationExample;
    documentRef: DocReference<Term | Translation | TranslationExample>;
    creator: UserMini;
}) {
    const { t } = useTranslation();

    if (documentRef.parent.id === 'terms') {
        const term = document as Term;

        return (
            <Trans
                t={t}
                i18nKey="comment.commentedBy"
                components={{
                    User: <UserInlineDisplay {...creator} />,
                    DocumentLink: <Link to={generatePath(TERM, { termId: documentRef.id })} />,
                }}
                values={{ title: term.value }}
            />
        );
    }

    if (documentRef.parent.id === 'translationExamples') {
        const example = document as TranslationExample;

        return (
            <Trans
                t={t}
                i18nKey="comment.commentedBy"
                components={{
                    User: <UserInlineDisplay {...creator} />,
                    DocumentLink: <LinkToTranslationExample example={example} exampleId={documentRef.id} />,
                }}
            />
        );
    }

    if (documentRef.parent.id === 'translations') {
        const translation = document as Translation;

        return (
            <Trans
                t={t}
                i18nKey="comment.commentedBy"
                components={{
                    User: <UserInlineDisplay {...creator} />,
                    DocumentLink: (
                        <Link
                            to={generatePath(TRANSLATION, {
                                translationId: documentRef.id,
                                termId: translation.term.id,
                            })}
                        />
                    ),
                }}
                values={{ title: translation.value }}
            />
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
