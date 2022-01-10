const initializeInterval = setInterval(initialize, 100);

function initialize() {
    const textAreaSource = document.querySelector('textarea[aria-label="Source text"]');

    if (textAreaSource) {
        clearInterval(initializeInterval);
        const button = document.createElement('button');
        button.classList.add('check-button');
        button.textContent = 'check!';
        textAreaSource.parentElement.classList.add('textarea-source-parent');
        textAreaSource.parentElement.appendChild(button);

        button.addEventListener('click', () => {
            alert(textAreaSource.value);
        });

        console.log(getElementByContent('Translation results', 'h2'));
    }
}

function getElementByContent(content, elType) {
    return document.evaluate(
        `//${elType}[text()='${content}']`,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;
}
