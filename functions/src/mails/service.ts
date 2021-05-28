import { compile } from 'path-to-regexp';
import { getRedact } from '../../../src/RedactSensitiveTerms/service';
import { TERM, TRANSLATION_EXAMPLE_REDIRECT, TRANSLATION_REDIRECT } from '../../../src/routes';
import { DocReference } from '../../../src/types';
import config from '../config';
import { db } from '../firebase';

type TrackingMail = 'Digest' | 'Notification';
export type Redact = ReturnType<typeof getRedact>;

export async function getRedactSensitiveTerms(): Promise<Redact> {
    const sensitiveTermsSnap = await db.collection('sensitiveTerms').doc('global').get();
    const sensitiveTerms: Set<string> = new Set(
        (sensitiveTermsSnap.data()?.terms || []).map((term: string) => term.toLowerCase())
    );
    return getRedact(sensitiveTerms);
}

const addHash = (url: string, hash: string) => {
    const newUrl = new URL(url);
    newUrl.hash = hash;
    return newUrl.toString();
};

const addSearchParams = (url: string, params: { [key: string]: string }) => {
    const newUrl = new URL(url);
    Object.entries(params).forEach(([name, value]) => newUrl.searchParams.append(name, value));
    return newUrl.toString();
};

export const addTracking = (mailType: TrackingMail) => (url: string) =>
    addSearchParams(url, { pk_campaign: `Email-${mailType}` });

export const generateUrl = (route: string, params: object) => `${config.origin.main}${compile(route)(params)}`;

export function getUrlForRef(ref: DocReference<unknown> | FirebaseFirestore.DocumentReference) {
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

export const getUrlForComment = (
    parentRef: DocReference<unknown> | FirebaseFirestore.DocumentReference,
    commentId: string
) => addHash(getUrlForRef(parentRef), `comment-${commentId}`);
