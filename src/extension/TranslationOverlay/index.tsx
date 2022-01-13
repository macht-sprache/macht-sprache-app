import styles from './style.module.css';

export function addText(parentElement: HTMLElement, text: string) {
    const textElement = parentElement.firstChild;
    const textOverlay = document.createElement('div');
    textOverlay.innerHTML = text;
    // @ts-ignore
    textOverlay.classList.add(styles.overlay, [...textElement?.classList]);
    parentElement.classList.add(styles.parent);
    parentElement.firstChild?.after(textOverlay);
}
