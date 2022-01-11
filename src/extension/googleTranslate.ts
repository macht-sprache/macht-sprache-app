import './setup';
import styles from './style.module.css';

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
    console.log('text updated', lang, ': ', text, el);
    if ((lang === 'de' || lang === 'en') && (originalLang === 'de' || originalLang === 'en')) {
        addButton(el);
        addText(el, text || '');
    }
}

function addButton(parentElement: HTMLElement) {
    const buttonRow = parentElement.lastChild as HTMLElement;
    const button = document.createElement('button');
    button.setAttribute('aria-label', 'macht.sprache.');
    button.classList.add(styles.button);

    buttonRow?.prepend(button);
}

function addText(parentElement: HTMLElement, text: string) {
    const textElement = parentElement.firstChild;
    const textOverlay = document.createElement('div');
    textOverlay.innerHTML = text;
    // @ts-ignore
    textOverlay.classList.add(styles.overlay, [...textElement?.classList]);
    parentElement.classList.add(styles.parent);
    parentElement.firstChild?.after(textOverlay);
}
