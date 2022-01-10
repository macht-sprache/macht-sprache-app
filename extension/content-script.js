const initializeInterval = setInterval(initialize, 100);

function initialize() {
    const textAreaTranslated = document.querySelector('[data-language][data-original-language]');
    if (textAreaTranslated) {
        clearInterval(initializeInterval);
        initialize2();
        const observer = new MutationObserver(observe);
        observer.observe(textAreaTranslated.parentNode, { attributes: true, childList: true, subtree: true });
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
    const textAreaTranslatedEn = document.querySelector('[data-language="en"][data-original-language="de"]');
    const textAreaTranslatedDe = document.querySelector('[data-language="de"][data-original-language="en"]');

    if (textAreaTranslatedDe || textAreaTranslatedEn) {
        const translatedTextLang = textAreaTranslatedDe ? 'de' : 'en';
        const translatedTextNode = (textAreaTranslatedDe || textAreaTranslatedEn)?.firstChild;

        console.log('translated Text lang:', translatedTextLang);
        console.log('translated Text:', translatedTextNode.innerText);
    }
}
