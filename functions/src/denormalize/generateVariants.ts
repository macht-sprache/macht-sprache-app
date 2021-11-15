import { Lang, Term, Translation } from '../../../src/types';

type TermTranslation = Pick<Term | Translation, 'value' | 'lang'>;
type VariantGenerator = (value: string) => string[] | string;

const skipParenthesis: VariantGenerator = value => value.replace(/\s*\([^()]+\)\s*/g, ' ');
const handleGermanGenderNeutralForms: VariantGenerator = value => {
    const regex = /([^*:\s]+)[*:]([^*:\s]+)/;
    const match = value.match(regex);
    if (!match) {
        return [];
    }
    return [match[1], match[1] + match[2]];
};

const generators: { [lang in Lang]: VariantGenerator[] } = {
    en: [skipParenthesis],
    de: [skipParenthesis, handleGermanGenderNeutralForms],
};

export const getGeneratedVariants = (entity: TermTranslation) =>
    generators[entity.lang].flatMap(fn => fn(entity.value)).filter(val => val !== entity.value);
