import 'react-i18next';
import { resources } from '../../src/i18n/config';
import { LangA } from '../../src/types';

declare module 'react-i18next' {
    type DefaultResources = typeof resources[LangA];
    interface Resources extends DefaultResources {}
}
