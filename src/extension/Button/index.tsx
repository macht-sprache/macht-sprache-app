import styles from './style.module.css';

export function addButton(parentElement: HTMLElement) {
    const buttonRow = parentElement.lastChild as HTMLElement;
    const button = document.createElement('button');
    button.setAttribute('aria-label', 'macht.sprache.');
    button.classList.add(styles.button);

    buttonRow?.prepend(button);
}
