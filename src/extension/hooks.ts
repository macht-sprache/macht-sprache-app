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
            const observerChildren = new MutationObserver(observeChildren);
            observerChildren.observe(translatedTextElementParent, {
                childList: true,
                subtree: true,
            });
            const observerParent = new MutationObserver(observeParent);
            observerParent.observe(translatedTextElementParent, {
                childList: true,
            });
            update();
        }

        const observeChildren: MutationCallback = mutationsList => {
            mutationsList.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    // these get changed if a user selects an alternative translation suggested by google
                    // @ts-ignore
                    if (node?.parentElement?.parentElement?.attributes['data-language-for-alternatives']) {
                        update();
                    }
                });
            });
        };

        const observeParent: MutationCallback = () => {
            update();
        };

        function update() {
            const translatedTextElement = translatedTextElementParent!.querySelector(
                TRANSLATED_TEXT_ELEMENT_SELECTOR
            ) as HTMLElement;
            if (translatedTextElement) {
                setText({
                    lang: translatedTextElement.dataset.language,
                    originalLang: translatedTextElement.dataset.originalLanguage,
                    // @ts-ignore
                    text: translatedTextElement.firstChild?.innerText,
                    el: translatedTextElement,
                });
            }
        }
    }, []);

    return text;
};
