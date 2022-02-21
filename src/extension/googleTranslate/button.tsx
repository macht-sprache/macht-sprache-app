import findLast from 'lodash/findLast';
import { useEffect, useMemo } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Button } from '../Button';
import { injectedElementFactory } from '../injectedElementFactory';
import { Status } from '../types';
import { TRANSLATED_TEXT_ELEMENT_SELECTOR } from './constants';

const getButton = (stableParent: HTMLElement) =>
    injectedElementFactory<{ status: Status; results: number }>({
        stableParent,
        createElement: () => document.createElement('div'),
        attachElement: (el, parent) => {
            const container = parent.querySelector<HTMLElement>(TRANSLATED_TEXT_ELEMENT_SELECTOR);
            const buttonRow = findLast(container?.children, child => !!child.getAttribute('jsaction'));
            buttonRow?.prepend(el);
        },
        validateInput: ({ status, results }) => (status && results && results > 0 ? { status, results } : null),
        render: ({ status, results }, el) => {
            el.innerHTML = ReactDOMServer.renderToStaticMarkup(<Button status={status} results={results} />);
        },
    });

export function useRenderButton(stableParent?: HTMLElement) {
    const { render, destroy } = useMemo(() => {
        if (stableParent) {
            return getButton(stableParent);
        } else {
            return { render: () => {}, destroy: () => {} };
        }
    }, [stableParent]);

    useEffect(() => destroy, [destroy]);

    return render;
}
