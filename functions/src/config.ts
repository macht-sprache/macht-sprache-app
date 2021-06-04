import * as firebaseFunctions from 'firebase-functions';

type Config = {
    backup: {
        bucket: string;
    };
    functions: {
        region: string;
        auth?: string;
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
    origin: {
        main: string;
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
    backup: {
        bucket: firebaseFunctions.config().backup.bucket,
    },
    functions: {
        region: functionsRegion,
        auth: firebaseFunctions.config().functions?.auth,
    },
    tmdb: {
        key: tmdbApikey,
    },
    smtp: firebaseFunctions.config().smtp,
    origin: {
        main: firebaseFunctions.config().origin.main,
    },
};

export default config;
