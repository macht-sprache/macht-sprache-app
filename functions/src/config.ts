import * as firebaseFunctions from 'firebase-functions';

const functionsRegion = firebaseFunctions.config().functions?.region;

if (typeof functionsRegion !== 'string') {
    throw new Error('Functions regions is not defined.');
}

const tmdbApikey = firebaseFunctions.config().tmdb?.key;

if (typeof tmdbApikey !== 'string') {
    throw new Error('Tmdb api key is not defined.');
}

const config = {
    functions: {
        region: functionsRegion,
    },
    tmdb: {
        key: tmdbApikey,
    },
};

export default config;
