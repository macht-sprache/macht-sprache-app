import * as firebaseFunctions from 'firebase-functions';

type Config = {
    functions: {
        region: string;
    };
    tmdb: {
        key: string;
    };
    smtp: {
        from: string;
        user: string;
        password: string;
        host: string;
        port?: number;
    };
};

const functionsRegion = firebaseFunctions.config().functions?.region;

if (typeof functionsRegion !== 'string') {
    throw new Error('Functions regions is not defined.');
}

const tmdbApikey = firebaseFunctions.config().tmdb?.key;

if (typeof tmdbApikey !== 'string') {
    throw new Error('Tmdb api key is not defined.');
}

const config: Config = {
    functions: {
        region: functionsRegion,
    },
    tmdb: {
        key: tmdbApikey,
    },
    smtp: firebaseFunctions.config().smtp,
};

export default config;
