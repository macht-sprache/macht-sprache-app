import 'react-i18next';
import { resources } from '../../src/i18n/config';
import { LangA } from '../../src/types';

declare module 'react-i18next' {
    interface CustomTypeOptions {
        defaultNS: 'translation';
        resources: {
            translation: typeof resources[LangA]['translation'];
        };
    }
}
