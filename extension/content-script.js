const TRANSLATED_TEXT_ELEMENT_SELECTOR = '[data-language][data-original-language]';
let translatedTextElementParent;

const initializeInterval = setInterval(initialize, 100);

function initialize() {
    const translatedTextElement = document.querySelector(TRANSLATED_TEXT_ELEMENT_SELECTOR);
    if (translatedTextElement) {
        translatedTextElementParent = translatedTextElement.parentNode;
        clearInterval(initializeInterval);
        initialize2();
        const observer = new MutationObserver(observe);
        observer.observe(translatedTextElementParent, { attributes: false, childList: true, subtree: false });
    }
}

function observe(mutationsList) {
    mutationsList.forEach(mutation => {
        mutation.removedNodes.forEach(() => {
            initialize2();
        });
    });
}

function initialize2() {
    const translatedTextElement = translatedTextElementParent.querySelector(TRANSLATED_TEXT_ELEMENT_SELECTOR);

    if (translatedTextElement) {
        const translatedTextLang = translatedTextElement.dataset.language;
        const translatedText = translatedTextElement?.firstChild?.innerText;

        translationUpdated({ lang: translatedTextLang, text: translatedText, el: translatedTextElement });
    }
}

function translationUpdated({ text, lang, el }) {
    console.log('text updated', lang, ': ', text, el);
}
