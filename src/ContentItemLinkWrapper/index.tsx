import React, { Suspense } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router-dom';
import { CommentItem } from '../Comments/CommentItem';
import { getSourceRefWithConverter } from '../hooks/data';
import { Get, useDocument } from '../hooks/fetch';
import { Redact } from '../RedactSensitiveTerms';
import { TERM, TRANSLATION, TRANSLATION_EXAMPLE_REDIRECT } from '../routes';
import { Comment, DocReference, Term, Translation, TranslationExample, UserMini } from '../types';
import { UserInlineDisplay } from '../UserInlineDisplay';
import s from './style.module.css';

export function ContentItemLinkWrapper({ comment }: { comment: Comment }) {
    const getDocument = useDocument(comment.ref);

    return (
        <div className={s.container}>
            <div className={s.linkToDocument}>
                <Suspense fallback={<LinkHeading creator={comment.creator} />}>
                    <LinkToDocument getDocument={getDocument} documentRef={comment.ref} creator={comment.creator} />
                </Suspense>
            </div>
            <CommentItem comment={comment} />
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
    return <LinkHeading creator={creator}>{getLinkToDocument(getDocument, documentRef)}</LinkHeading>;
}

function LinkToTerm({ term, termId }: { term: Term; termId: string }) {
    return (
        <Link to={generatePath(TERM, { termId })}>
            <Redact>{term.value}</Redact>
        </Link>
    );
}

function LinkToTranslation({ translation, translationId }: { translation: Translation; translationId: string }) {
    return (
        <Link
            to={generatePath(TRANSLATION, {
                translationId: translationId,
                termId: translation.term.id,
            })}
        >
            <Redact>{translation.value}</Redact>
        </Link>
    );
}

function LinkToTranslationExample({ example, exampleId }: { example: TranslationExample; exampleId: string }) {
    const getOriginalSource = useDocument(getSourceRefWithConverter(example.original.source));
    const original = getOriginalSource();

    return (
        <Link to={generatePath(TRANSLATION_EXAMPLE_REDIRECT, { translationExampleId: exampleId })}>
            {original.title}
        </Link>
    );
}

const LinkHeading: React.FC<{ creator: UserMini }> = ({ creator, children }) => {
    const { t } = useTranslation();

    return (
        <Trans
            t={t}
            i18nKey={children ? 'comment.userCommentedOn' : 'comment.userCommented'}
            components={{
                User: <UserInlineDisplay {...creator} />,
                DocumentLink: children,
            }}
        />
    );
};

const getLinkToDocument = (
    getDocument: Get<Term | Translation | TranslationExample>,
    documentRef: DocReference<Term | Translation | TranslationExample>
) => {
    const document = getDocument(true);
    const { id } = documentRef;

    if (!document) {
        return null;
    } else if (documentRef.parent.id === 'terms') {
        return <LinkToTerm term={document as Term} termId={id} />;
    } else if (documentRef.parent.id === 'translationExamples') {
        return <LinkToTranslationExample example={document as TranslationExample} exampleId={id} />;
    } else if (documentRef.parent.id === 'translations') {
        return <LinkToTranslation translation={document as Translation} translationId={id} />;
    }

    return null;
};
