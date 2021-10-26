import { functions } from './firebase';
import { TranslationExampleModel } from './modelTypes';
import { Book, Lang, Movie, TextToken, WebPage } from './types';

const _analyzeText = functions.httpsCallable('handlers-analyzeText');

export const analyzeText = (text: string, lang: Lang): Promise<TextToken[]> =>
    _analyzeText({ text, lang }).then(({ data }) => data);

const _findBooks = functions.httpsCallable('handlers-findBooks');

export const findBooks = (query: string, lang: Lang): Promise<Book[]> =>
    _findBooks({ query, lang }).then(({ data }) => data);

const _findMovies = functions.httpsCallable('handlers-findMovies');

export const findMovies = (query: string, lang: Lang): Promise<Movie[]> =>
    _findMovies({ query, lang }).then(({ data }) => data);

const _findWebPage = functions.httpsCallable('handlers-findWebPage');

export const findWebPage = (url: string, lang: Lang): Promise<WebPage> =>
    _findWebPage({ url, lang }).then(({ data }) => data);

const _addTranslationExample = functions.httpsCallable('handlers-addTranslationExample');

export const addTranslationExample = (
    model: TranslationExampleModel
): Promise<{ data: { translationExampleId: string } }> => _addTranslationExample(model);

const _isDisplayNameAvailable = functions.httpsCallable('userManagement-isDisplayNameAvailable');

export const isDisplayNameAvailable = (displayName: string) => _isDisplayNameAvailable({ displayName });

const _postRegistrationHandler = functions.httpsCallable('userManagement-postRegistrationHandler');

export const postRegistrationHandler = (displayName: string, lang: Lang, newsletter: boolean) =>
    _postRegistrationHandler({ displayName, lang, newsletter });

const _sendEmailVerification = functions.httpsCallable('mails-sendEmailVerification');

export const sendEmailVerification = (lang: Lang, origin: string, continuePath: string) =>
    _sendEmailVerification({ lang, origin, continuePath });

export const postVerifyHandler = functions.httpsCallable('userManagement-postVerifyHandler');

const _sendPasswordReset = functions.httpsCallable('mails-sendPasswordResetMail');

export const sendPasswordReset = (email: string, lang: Lang, origin: string, continuePath: string) =>
    _sendPasswordReset({ email, lang, origin, continuePath });
