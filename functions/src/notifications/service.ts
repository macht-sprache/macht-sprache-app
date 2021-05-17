import { Timestamp } from '@google-cloud/firestore';
import {
    DocReference,
    Lang,
    Source,
    Subscription,
    Term,
    Translation,
    TranslationExample,
    UserMini,
} from '../../../src/types';
import { convertRefToAdmin } from '../firebase';

type ParentEntity = Term | Translation | TranslationExample;
type ParentEntityRef = FirebaseFirestore.DocumentReference<ParentEntity>;

export const getNewSubscription = (entity: { createdAt: Timestamp; creator: UserMini }): Subscription => ({
    createdAt: entity.createdAt,
    updatedAt: null,
    creator: entity.creator,
    active: true,
});

export const getTermRefForParent = async (
    t: FirebaseFirestore.Transaction,
    parentRef: ParentEntityRef,
    parentEntity: ParentEntity
): Promise<FirebaseFirestore.DocumentReference<Term> | undefined> => {
    if ('term' in parentEntity) {
        return convertRefToAdmin(parentEntity.term);
    }

    if ('translation' in parentEntity) {
        const translation = (await t.get(convertRefToAdmin(parentEntity.translation))).data();
        return translation && convertRefToAdmin(translation.term);
    }

    return parentRef as FirebaseFirestore.DocumentReference<Term>;
};

export const getEntityInfo = async (
    t: FirebaseFirestore.Transaction,
    entity: ParentEntity
): Promise<{ name: string; lang: Lang } | null> => {
    if ('value' in entity) {
        return {
            name: entity.value,
            lang: entity.lang,
        };
    }

    const originalSource = (await t.get(convertRefToAdmin(entity.original.source as DocReference<Source>))).data();

    if (!originalSource) {
        return null;
    }

    return {
        name: originalSource.title,
        lang: originalSource.lang,
    };
};
