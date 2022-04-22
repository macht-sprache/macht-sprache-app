import orderBy from 'lodash/orderBy';
import { langA } from '../../languages';
import { Term, Translation } from '../../types';
import { useLang } from '../../useLang';

export const getLongestEntity = <Entity extends Term | Translation>(terms: Entity[]) =>
    terms.reduce<Entity | undefined>(
        (prev, current) => ((prev?.value?.length ?? 0) > current.value.length ? prev : current),
        undefined
    );

export const sortEntities = <Entity extends Term | Translation>(
    entities: Entity[],
    extraSortFn?: (entity: Entity) => number
) => orderBy(entities, entity => [entity.value.length, extraSortFn], ['desc', 'asc']);

export const useLangIdentifier = () => {
    const [lang] = useLang();
    return lang === langA ? 'langA' : 'langB';
};

export const termOrTranslations = (terms: Term[], translations: Translation[]): 'term' | 'translation' => {
    const longestTerm = getLongestEntity(terms);
    const longestTranslation = getLongestEntity(translations);

    if (longestTerm && longestTranslation) {
        return longestTerm.value.length >= longestTranslation.value.length ? 'term' : 'translation';
    }

    if (longestTerm) return 'term';

    return 'translation';
};
