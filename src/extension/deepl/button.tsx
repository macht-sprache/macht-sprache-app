import { useEffect, useMemo } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Button } from '../Button';
import { injectedElementFactory } from '../injectedElementFactory';
import { Status } from '../types';

const getButton = (stableParent: HTMLElement) =>
    injectedElementFactory<{ status: Status; results: number }>({
        stableParent,
        createElement: () => document.createElement('div'),
        attachElement: (el, parent) => {
            const buttonRow = parent.querySelector('[dl-test="translator-target-toolbar"]');
            buttonRow?.append(el);
            console.log(parent);
        },
        validateInput: ({ status, results }) => (status ? { status, results: results ?? 0 } : null),
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
