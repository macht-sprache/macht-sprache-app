import browser from 'webextension-polyfill';
import { addButton } from './Button';
import './setup';
import { addText } from './TranslationOverlay';

const TRANSLATED_TEXT_ELEMENT_SELECTOR = '[data-language][data-original-language]';
let translatedTextElementParent: HTMLElement | null = null;

const initializeInterval = setInterval(initialize, 100);

function initialize() {
    const translatedTextElement = document.querySelector(TRANSLATED_TEXT_ELEMENT_SELECTOR);
    if (!translatedTextElement) {
        return;
    }
    translatedTextElementParent = translatedTextElement.parentNode as HTMLElement;
    clearInterval(initializeInterval);
    initialize2();
    const observer = new MutationObserver(observe);
    observer.observe(translatedTextElementParent!, { attributes: false, childList: true, subtree: false });
}

const observe: MutationCallback = mutationsList => {
    mutationsList.forEach(mutation => {
        mutation.removedNodes.forEach(() => {
            initialize2();
        });
    });
};

function initialize2() {
    const translatedTextElement = translatedTextElementParent!.querySelector(
        TRANSLATED_TEXT_ELEMENT_SELECTOR
    ) as HTMLElement;
    if (translatedTextElement) {
        translationUpdated({
            lang: translatedTextElement.dataset.language!,
            originalLang: translatedTextElement.dataset.originalLanguage!,
            // @ts-ignore
            text: translatedTextElement.firstChild?.innerText,
            el: translatedTextElement,
        });
    }
}

function translationUpdated({
    text,
    lang,
    el,
    originalLang,
}: {
    text?: string;
    lang?: string;
    el: HTMLElement;
    originalLang?: string;
}) {
    if (text && (lang === 'de' || lang === 'en') && (originalLang === 'de' || originalLang === 'en')) {
        addButton(el);
        addText(el, text || '');

        browser.runtime.sendMessage(undefined, { lang, text }, {}).then(response => {
            console.log('service worker response:', response);
        });
    }
}
