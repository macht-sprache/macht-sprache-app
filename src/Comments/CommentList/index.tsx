import { Suspense } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router-dom';
import { Get, useDocument } from '../../hooks/fetch';
import { Redact } from '../../RedactSensitiveTerms';
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
                return <CommentWithLink key={comment.id} comment={comment} />;
            })}
        </div>
    );
}

function CommentWithLink({ comment }: { comment: Comment }) {
    const getDocument = useDocument(comment.ref);
    return (
        <div className={s.linkContainer}>
            <div className={s.linkToDocument}>
                <Suspense fallback={<LinkHeading creator={comment.creator} />}>
                    <LinkToDocument getDocument={getDocument} documentRef={comment.ref} creator={comment.creator} />
                </Suspense>
            </div>
            <CommentItem key={comment.id} comment={comment} />
        </div>
    );
}

function LinkToDocument({
    getDocument,
    documentRef,
    creator,
}: {
    getDocument: Get<Term | Translation | TranslationExample>;
    documentRef: DocReference<Term | Translation | TranslationExample>;
    creator: UserMini;
}) {
    const document = getDocument(true);

    let documentLinkEl: React.ReactNode;

    if (documentRef.parent.id === 'terms') {
        const term = document as Term;
        documentLinkEl = (
            <Link to={generatePath(TERM, { termId: documentRef.id })}>
                <Redact>{term.value}</Redact>
            </Link>
        );
    } else if (documentRef.parent.id === 'translationExamples') {
        const example = document as TranslationExample;
        documentLinkEl = <LinkToTranslationExample example={example} exampleId={documentRef.id} />;
    } else if (documentRef.parent.id === 'translations') {
        const translation = document as Translation;
        documentLinkEl = (
            <Link
                to={generatePath(TRANSLATION, {
                    translationId: documentRef.id,
                    termId: translation.term.id,
                })}
            >
                <Redact>{translation.value}</Redact>
            </Link>
        );
    }

    return <LinkHeading creator={creator}>{documentLinkEl}</LinkHeading>;
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

const LinkHeading: React.FC<{ creator: UserMini }> = ({ creator, children }) => {
    const { t } = useTranslation();

    if (!children) {
        return (
            <Trans
                t={t}
                i18nKey="comment.userCommented"
                components={{
                    User: <UserInlineDisplay {...creator} />,
                }}
            />
        );
    }

    return (
        <Trans
            t={t}
            i18nKey="comment.userCommentedOn"
            components={{
                User: <UserInlineDisplay {...creator} />,
                DocumentLink: children,
            }}
        />
    );
};
