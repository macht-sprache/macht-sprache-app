import isEqual from 'lodash/isEqual';

type Config<T extends {}, El extends HTMLElement> = {
    stableParent: HTMLElement;
    createElement: (stableParent: HTMLElement) => El | null;
    attachElement: (el: El, stableParent: HTMLElement) => void;
    render: (input: T, el: El, stableParent: HTMLElement) => void;
    validateInput: (input: Partial<T>) => T | null;
};

export function injectedElementFactory<T extends {}, El extends HTMLElement = HTMLElement>(config: Config<T, El>) {
    let el: ReturnType<typeof config.createElement> = null;
    let prevInput: Partial<T> | null = null;
    let prevIsActive = false;

    const observer = new MutationObserver(() => {
        if (!el || config.stableParent.contains(el)) {
            return;
        }

        config.attachElement(el, config.stableParent);
    });

    const destroy = () => {
        observer.disconnect();
        el?.remove();
        el = null;
    };

    const render = (newInput: Partial<T> | undefined) => {
        if (isEqual(prevInput, newInput)) {
            return;
        }

        prevInput = newInput ?? null;
        const input = config.validateInput(newInput ?? {});
        const newIsActive = !!input;

        if (prevIsActive && !newIsActive) {
            destroy();
        }

        if (!prevIsActive && newIsActive) {
            el = el ?? config.createElement(config.stableParent);
            if (el) {
                config.attachElement(el, config.stableParent);
                observer.observe(config.stableParent, { childList: true, subtree: true });
            }
        }

        if (input && el) {
            config.render(input, el, config.stableParent);
        }

        prevIsActive = newIsActive;
    };

    return { render, destroy };
}
