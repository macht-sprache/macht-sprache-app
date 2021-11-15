import deburr from 'lodash/deburr';
import orderBy from 'lodash/orderBy';
import { Translation } from '../../types';

export const sortTranslations = (translations: Translation[]) =>
    orderBy(translations, [({ ratings }) => averageRatings(ratings), ({ value }) => deburr(value)], ['desc', 'asc']);

const averageRatings = (ratings: number[] | null) => {
    if (!ratings) {
        return 0;
    }

    const sumOfAllRatings = ratings.reduce((accumulator, current, index) => accumulator + current * (index + 1), 0);
    const countOfAllRatings = ratings.reduce((a, b) => a + b, 0);

    return countOfAllRatings && sumOfAllRatings / countOfAllRatings;
};
