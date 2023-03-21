import findLast from 'lodash/findLast';
import ReactDOMServer from 'react-dom/server';
import { Button } from '../Button';
import { getUseRenderElement, injectedElementFactory } from '../injectedElementFactory';
import { Status } from '../types';

const getButton = (stableParent: HTMLElement) =>
    injectedElementFactory<{ status: Status; results: number }>({
        stableParent,
        createElement: () => document.createElement('div'),
        attachElement: (el, parent) => {
            const container = parent.querySelector<HTMLElement>('[aria-live="polite"] > *');
            const buttonRow = findLast(container?.children, child => !!child.getAttribute('jsaction'));
            buttonRow?.append(el);
        },
        validateInput: ({ status, results }) => (status ? { status, results: results ?? 0 } : null),
        render: ({ status, results }, el) => {
            el.innerHTML = ReactDOMServer.renderToStaticMarkup(<Button status={status} results={results} />);
        },
    });

export const useRenderButton = getUseRenderElement(getButton);
