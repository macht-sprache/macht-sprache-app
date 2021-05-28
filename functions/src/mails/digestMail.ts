import escape from 'lodash.escape';
import type { MJMLJsonObject } from 'mjml-core';
import { reverse, sortBy, take } from 'rambdax';
import { langA, langB } from '../../../src/languages';
import { USER } from '../../../src/routes';
import { Comment, Lang, Term, Translation } from '../../../src/types';
import { db, WithoutId } from '../firebase';
import { TFunc, translate } from './i18n';
import { generateUrl, getRedactSensitiveTerms, getUrlForRef, Redact } from './service';
import { getActivityItemComment, getActivityItemTerm } from './templates';

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

export async function getDigestContent(
    from: Date,
    to: Date,
    limit: number
): Promise<{ [lang in Lang]: MJMLJsonObject[] }> {
    const [redact, commentsSnap, termsSnap, translationsSnap] = await Promise.all([
        getRedactSensitiveTerms(),
        db.collection('comments').where('createdAt', '>=', from).get(),
        db.collection('terms').where('createdAt', '>=', from).get(),
        db.collection('translations').where('createdAt', '>=', from).get(),
    ]);

    const items = take(
        limit,
        reverse(
            sortBy(item => item.doc.data().createdAt.toMillis(), [
                ...commentsSnap.docs.map(doc => ({ type: 'Comment', doc } as Item)),
                ...termsSnap.docs.map(doc => ({ type: 'Term', doc } as Item)),
                ...translationsSnap.docs.map(doc => ({ type: 'Translation', doc } as Item)),
            ])
        ).filter(item => item.doc.data().createdAt.toMillis() <= to.getTime())
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
        escape(redact(term.value)),
        getUrlForRef(termSnap.ref),
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
            termUrl: getUrlForRef(translation.term),
            term: redact(term?.value || ''),
        }),
        escape(redact(translation.value)),
        getUrlForRef(translationSnap.ref),
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
            termUrl: getUrlForRef(comment.ref),
            term: redact(parentName ?? ''),
        }),
        escape(comment.comment),
        getUrlForRef(comment.ref)
    );
};

const assertNever = (t: never) => {
    throw new Error(`Unexpected ${t}`);
};
