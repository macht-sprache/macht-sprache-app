import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { TranslationExampleModel } from './modelTypes';
import { Book, Lang, Movie, PersonToken, TextToken, WebPage } from './types';

const _analyzeText = httpsCallable<{ text: string; lang: Lang }, TextToken[]>(functions, 'handlers-analyzeText');

export const analyzeText = (text: string, lang: Lang) => _analyzeText({ text, lang }).then(({ data }) => data);

const _analyzeTextForPersons = httpsCallable<{ text: string; lang: Lang }, PersonToken[]>(
    functions,
    'handlers-analyzeTextForPersons'
);

export const analyzeTextForPersons = (text: string, lang: Lang) =>
    _analyzeTextForPersons({ text, lang }).then(({ data }) => data);

const _findBooks = httpsCallable<{ query: string; lang: Lang }, Book[]>(functions, 'handlers-findBooks');

export const findBooks = (query: string, lang: Lang) => _findBooks({ query, lang }).then(({ data }) => data);

const _findMovies = httpsCallable<{ query: string; lang: Lang }, Movie[]>(functions, 'handlers-findMovies');

export const findMovies = (query: string, lang: Lang) => _findMovies({ query, lang }).then(({ data }) => data);

const _findWebPage = httpsCallable<{ url: string; lang: Lang }, WebPage>(functions, 'handlers-findWebPage');

export const findWebPage = (url: string, lang: Lang) => _findWebPage({ url, lang }).then(({ data }) => data);

const _addTranslationExample = httpsCallable<TranslationExampleModel, { translationExampleId: string }>(
    functions,
    'handlers-addTranslationExample'
);

export const addTranslationExample = (model: TranslationExampleModel) =>
    _addTranslationExample(model).then(({ data }) => data.translationExampleId);

const _isDisplayNameAvailable = httpsCallable(functions, 'userManagement-isDisplayNameAvailable');

export const isDisplayNameAvailable = (displayName: string) => _isDisplayNameAvailable({ displayName });

const _postRegistrationHandler = httpsCallable(functions, 'userManagement-postRegistrationHandler');

export const postRegistrationHandler = (displayName: string, lang: Lang, newsletter: boolean) =>
    _postRegistrationHandler({ displayName, lang, newsletter });

const _sendEmailVerification = httpsCallable(functions, 'mails-sendEmailVerification');

export const sendEmailVerification = (lang: Lang, origin: string, continuePath: string) =>
    _sendEmailVerification({ lang, origin, continuePath });

export const postVerifyHandler = httpsCallable(functions, 'userManagement-postVerifyHandler');

const _sendPasswordReset = httpsCallable(functions, 'mails-sendPasswordResetMail');

export const sendPasswordReset = (email: string, lang: Lang, origin: string, continuePath: string) =>
    _sendPasswordReset({ email, lang, origin, continuePath });
