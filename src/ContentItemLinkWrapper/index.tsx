import React, { Suspense } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router-dom';
import { CommentItem } from '../Comments/CommentItem';
import { FormatDate } from '../FormatDate';
import { collections, getSourceRefWithConverter } from '../hooks/data';
import { Get, useDocument } from '../hooks/fetch';
import { Redact } from '../RedactSensitiveTerms';
import { TERM, TRANSLATION, TRANSLATION_EXAMPLE_REDIRECT } from '../routes';
import { TermItem } from '../Terms/TermItem';
import { TranslationExampleItem } from '../TranslationExamplesList';
import { TranslationItem } from '../TranslationsList';
import { Comment, DocReference, Term, Translation, TranslationExample, UserMini } from '../types';
import { UserInlineDisplay } from '../UserInlineDisplay';
import s from './style.module.css';

export function CommentItemLinkWrapper({ comment }: { comment: Comment }) {
    const getDocument = useDocument(comment.ref);

    return (
        <LinkWrapper
            meta={
                <Suspense fallback={<LinkHeading creator={comment.creator} />}>
                    <LinkToDocumentFromComment
                        getDocument={getDocument}
                        documentRef={comment.ref}
                        creator={comment.creator}
                    />
                </Suspense>
            }
        >
            <CommentItem comment={comment} />
        </LinkWrapper>
    );
}

export function TermItemLinkWrapper({ term }: { term: Term }) {
    return (
        <LinkWrapper meta={<DocumentMeta user={term.creator} date={term.createdAt.toDate()} type="Term" />}>
            <TermItem term={term} size="tiny" />
        </LinkWrapper>
    );
}

export function TranslationItemLinkWrapper({ translation }: { translation: Translation }) {
    const getTerm = useDocument(collections.terms.doc(translation.term.id));

    return (
        <LinkWrapper
            meta={<DocumentMeta user={translation.creator} date={translation.createdAt.toDate()} type="Translation" />}
        >
            <TranslationItem translation={translation} term={getTerm()} />
        </LinkWrapper>
    );
}

export function TranslationExampleItemLinkWrapper({ translationExample }: { translationExample: TranslationExample }) {
    const getOriginalSource = useDocument(getSourceRefWithConverter(translationExample.original.source));

    return (
        <LinkWrapper
            meta={
                <DocumentMeta
                    user={translationExample.creator}
                    date={translationExample.createdAt.toDate()}
                    type="TranslationExample"
                />
            }
        >
            <TranslationExampleItem example={translationExample} originalSource={getOriginalSource()} />
        </LinkWrapper>
    );
}

function LinkWrapper({ children, meta }: { children: React.ReactNode; meta: React.ReactNode }) {
    return (
        <div className={s.container}>
            <div className={s.meta}>{meta}</div>
            {children}
        </div>
    );
}

function DocumentMeta({
    date,
    type,
    user,
}: {
    date: Date;
    type: 'Translation' | 'TranslationExample' | 'Term';
    user: UserMini;
}) {
    const { t } = useTranslation();

    return (
        <Trans
            t={t}
            i18nKey={`contentItem.userAdded.${type}` as const}
            components={{
                User: <UserInlineDisplay {...user} />,
                Date: <FormatDate date={date} />,
            }}
        />
    );
}

function LinkToDocumentFromComment({
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
