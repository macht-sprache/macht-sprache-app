import { useEffect, useState } from 'react';
import { googleTranslatedEnvironment } from './types';

const TRANSLATED_TEXT_ELEMENT_SELECTOR = '[data-language][data-original-language]';

export const useGoogleTranslatedEnvironment = (): googleTranslatedEnvironment => {
    const [text, setText] = useState<googleTranslatedEnvironment>({});

    useEffect(() => {
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
