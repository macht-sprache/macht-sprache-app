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
        translationUpdated({
            lang: translatedTextElement.dataset.language,
            originalLang: translatedTextElement.dataset.originalLanguage,
            text: translatedTextElement?.firstChild?.innerText,
            el: translatedTextElement,
        });
    }
}

function translationUpdated({ text, lang, el, originalLang }) {
    console.log('text updated', lang, ': ', text, el);
    if ((lang === 'de' || lang === 'en') && (originalLang === 'de' || originalLang === 'en')) {
        addButton(el);
        addText(el, text);
    }
}

function addButton(parentElement) {
    const buttonRow = parentElement.lastChild;
    const button = document.createElement('button');
    button.setAttribute('aria-label', 'macht.sprache.');
    button.classList.add('machtsprache-button');

    buttonRow.prepend(button);
}

function addText(parentElement, text) {
    const textElement = parentElement.firstChild;
    const textOverlay = document.createElement('div');
    textOverlay.innerHTML = text;
    textOverlay.classList.add('machtsprache-overlay', [...textElement.classList]);
    parentElement.classList.add('machtsprache-parent');
    parentElement.firstChild.after(textOverlay);
}
