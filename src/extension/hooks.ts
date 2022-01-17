import { useEffect, useState } from 'react';
import { TranslatorEnvironment } from './types';

const TRANSLATED_TEXT_ELEMENT_SELECTOR = '[data-language][data-original-language]';

export const useGoogleTranslatedEnvironment = (): TranslatorEnvironment => {
    const [text, setText] = useState<TranslatorEnvironment>({});

    useEffect(() => {
        let translatedTextElementParent: HTMLElement | null = null;

        const initializeInterval = setInterval(initialize, 100);

        function initialize() {
            const translatedTextElement = document.querySelector(TRANSLATED_TEXT_ELEMENT_SELECTOR);
            if (!translatedTextElement) {
                return;
            }
            clearInterval(initializeInterval);
            translatedTextElementParent = translatedTextElement.parentNode as HTMLElement;
            const observer = new MutationObserver(observe);
            observer.observe(translatedTextElementParent!, { attributes: false, childList: true, subtree: false });
            update();
        }

        const observe: MutationCallback = mutationsList => {
            mutationsList.forEach(mutation => {
                mutation.addedNodes.forEach(() => {
                    update();
                });
            });
        };

        function update() {
            const translatedTextElement = translatedTextElementParent!.querySelector(
                TRANSLATED_TEXT_ELEMENT_SELECTOR
            ) as HTMLElement;
            if (translatedTextElement) {
                setText({
                    lang: translatedTextElement.dataset.language!,
                    originalLang: translatedTextElement.dataset.originalLanguage!,
                    // @ts-ignore
                    text: translatedTextElement.firstChild?.innerText,
                    el: translatedTextElement,
                });
            }
        }
    }, []);

    return text;
};
