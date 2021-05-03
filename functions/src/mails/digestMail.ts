import type { MJMLJsonObject } from 'mjml-core';
import { compile } from 'path-to-regexp';
import { reverse, sortBy, take } from 'rambdax';
import { langA, langB } from '../../../src/languages';
import { getRedact } from '../../../src/RedactSensitiveTerms/service';
import { TERM, TRANSLATION_EXAMPLE_REDIRECT, TRANSLATION_REDIRECT, USER } from '../../../src/routes';
import { Comment, DocReference, Lang, Term, Translation } from '../../../src/types';
import config from '../config';
import { db, WithoutId } from '../firebase';
import { translate } from './i18n';
import { getActivityItemComment, getActivityItemTerm } from './templates';

type TFunc = ReturnType<typeof translate>;
type Redact = ReturnType<typeof getRedact>;
type DocSnap<T> = FirebaseFirestore.QueryDocumentSnapshot<WithoutId<T>>;

type Item =
    | {
          type: 'Comment';
          doc: DocSnap<Comment>;
      }
    | {
          type: 'Term';
          doc: DocSnap<Term>;
      }
    | {
          type: 'Translation';
          doc: DocSnap<Translation>;
      };

export async function getDigestContent(since: Date, limit: number): Promise<{ [lang in Lang]: MJMLJsonObject[] }> {
    const [sensitiveTermsSnap, commentsSnap, termsSnap, translationsSnap] = await Promise.all([
        db.collection('sensitiveTerms').doc('global').get(),
        db.collection('comments').where('createdAt', '>=', since).get(),
        db.collection('terms').where('createdAt', '>=', since).get(),
        db.collection('translations').where('createdAt', '>=', since).get(),
    ]);

    const sensitiveTerms: Set<string> = new Set(
        (sensitiveTermsSnap.data()?.terms || []).map((term: string) => term.toLowerCase())
    );

    const redact = getRedact(sensitiveTerms);
    const items = take(
        limit,
        reverse(
            sortBy(item => item.doc.data().createdAt.toMillis(), [
                ...commentsSnap.docs.map(doc => ({ type: 'Comment', doc } as Item)),
                ...termsSnap.docs.map(doc => ({ type: 'Term', doc } as Item)),
                ...translationsSnap.docs.map(doc => ({ type: 'Translation', doc } as Item)),
            ])
        )
    );

    const getContentForLang = (lang: Lang) => {
        const t = translate(lang);
        return items.map(item => {
            switch (item.type) {
                case 'Term':
                    return getTermContent(t, redact, item.doc);
                case 'Translation':
                    return getTranslationContent(t, redact, item.doc);
                case 'Comment':
                    return getCommentContent(t, redact, item.doc);
                default:
                    return assertNever(item);
            }
        });
    };

    const langAContentPromise = Promise.all(getContentForLang(langA));
    const langBContentPromise = Promise.all(getContentForLang(langB));

    return {
        [langA]: await langAContentPromise,
        [langB]: await langBContentPromise,
    };
}

const getTermContent = async (t: TFunc, redact: Redact, termSnap: DocSnap<Term>) => {
    const term = termSnap.data();
    return getActivityItemTerm(
        t('weeklyDigest.newTerm', {
            userUrl: generateUrl(USER, { userId: term.creator.id }),
            userName: term.creator.displayName,
        }),
        redact(term.value),
        getLinkForRef(termSnap.ref),
        term.lang
    );
};

const getTranslationContent = async (t: TFunc, redact: Redact, translationSnap: DocSnap<Translation>) => {
    const translation = translationSnap.data();
    const term = (await translation.term.get()).data();
    return getActivityItemTerm(
        t('weeklyDigest.newTranslation', {
            userUrl: generateUrl(USER, { userId: translation.creator.id }),
            userName: translation.creator.displayName,
            termUrl: getLinkForRef(translation.term),
            term: redact(term?.value || ''),
        }),
        redact(translation.value),
        getLinkForRef(translationSnap.ref),
        translation.lang
    );
};

const getCommentContent = async (t: TFunc, redact: Redact, commentSnap: DocSnap<Comment>) => {
    const comment = commentSnap.data();
    const parent = (await comment.ref.get()).data();
    const parentName =
        parent && ('value' in parent ? parent.value : (await parent.original.source.get()).data()?.title);

    return getActivityItemComment(
        t('weeklyDigest.newComment', {
            userUrl: generateUrl(USER, { userId: comment.creator.id }),
            userName: comment.creator.displayName,
            termUrl: getLinkForRef(comment.ref),
            term: redact(parentName ?? ''),
        }),
        comment.comment,
        getLinkForRef(comment.ref)
    );
};

function getLinkForRef(ref: DocReference<unknown> | FirebaseFirestore.DocumentReference) {
    switch (ref.parent.id) {
        case 'terms':
            return generateUrl(TERM, { termId: ref.id });
        case 'translations':
            return generateUrl(TRANSLATION_REDIRECT, { translationId: ref.id });
        case 'translationExamples':
            return generateUrl(TRANSLATION_EXAMPLE_REDIRECT, { translationExampleId: ref.id });
        default:
            console.error(`Unexpected parentId ${ref.parent.id}`);
            return '';
    }
}

const generateUrl = (route: string, params: object) => `${config.origin.main}${compile(route)(params)}`;

const assertNever = (t: never) => {
    throw new Error(`Unexpected ${t}`);
};
