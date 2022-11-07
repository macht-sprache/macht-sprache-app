import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

export const getEnvVars = () => {
    const dotenvPath = path.resolve(__dirname, '..', '.env');
    const { NODE_ENV } = process.env;
    const dotenvFiles = [
        dotenvPath,
        `${dotenvPath}.${NODE_ENV}`,
        `${dotenvPath}.local`,
        `${dotenvPath}.${NODE_ENV}.local`,
    ];

    const envVars = {
        ...dotenvFiles.reduce<{ [key: string]: string }>((acc, filePath) => {
            const curVars = fs.existsSync(filePath) ? dotenv.parse(fs.readFileSync(filePath)) : {};
            return { ...acc, ...curVars };
        }, {}),
        ...process.env,
    };

    const reactAppVars = Object.keys(envVars)
        .filter(key => /^REACT_APP_/i.test(key))
        .reduce((acc, key) => ({ ...acc, [key]: JSON.stringify(envVars[key]) }), {});

    return reactAppVars;
};
