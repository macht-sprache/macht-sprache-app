import ReactDOMServer from 'react-dom/server';
import { Button } from '../Button';
import { Status } from '../types';

type Props = {
    el?: HTMLElement;
    status: Status;
    hasResult: boolean;
};

let container: HTMLElement;

export function renderButton({ el, status, hasResult }: Props) {
    if (!el) {
        return;
    }

    if (!el.contains(container)) {
        const buttonRow = el?.querySelector('[data-aria-label-on="Stop listening"]')?.parentElement?.parentElement
            ?.parentElement?.parentElement?.parentElement as HTMLElement;
        container = document.createElement('div');
        buttonRow.prepend(container);
    }

    container.innerHTML = ReactDOMServer.renderToStaticMarkup(<Button status={status} hasResult={hasResult} />);

    return null;
}

export function isButton(el: Node) {
    return el === container;
}
