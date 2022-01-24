import { useCallback, useEffect, useRef } from 'react';
import { useLocationSafe } from './useLocationSafe';

export const useScrollHashIntoView = (onScrollIntoView?: () => void) => {
    const ref = useRef<HTMLElement | null>(null);
    const refCallback = useCallback((el: HTMLElement | null) => (ref.current = el), []);
    const location = useLocationSafe();
    const hash = location?.hash || '';
    useEffect(() => {
        const element = ref.current;
        if (element && element.id && hash === `#${element.id}`) {
            element.scrollIntoView();
            handleFocus(element);
            onScrollIntoView?.();
        }
    }, [hash, onScrollIntoView]);
    return refCallback;
};

// Inspired by https://github.com/rafgraph/react-router-hash-link/blob/main/src/HashLink.jsx
function handleFocus(element: HTMLElement) {
    const originalTabIndex = element.getAttribute('tabindex');

    if (originalTabIndex === null && !isInteractiveElement(element)) {
        element.setAttribute('tabindex', '-1');
    }
    element.focus({ preventScroll: true });
    if (originalTabIndex === null && !isInteractiveElement(element)) {
        element.removeAttribute('tabindex');
    }
}

function isInteractiveElement(element: HTMLElement) {
    const formTags = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
    const linkTags = ['A', 'AREA'];
    return (
        (formTags.includes(element.tagName) && !element.hasAttribute('disabled')) ||
        (linkTags.includes(element.tagName) && element.hasAttribute('href'))
    );
}
