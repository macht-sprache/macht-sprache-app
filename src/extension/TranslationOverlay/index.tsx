import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import styles from './style.module.css';

export function TranslationOverlay({ parentElement, text }: { parentElement?: HTMLElement; text?: string }) {
    const [textOverlay, setTextOverlay] = useState<HTMLElement | null>();

    useEffect(() => {
        if (parentElement) {
            const textOverlay = document.createElement('div');
            const textElement = parentElement?.firstChild as HTMLElement;
            textElement?.after(textOverlay);
            parentElement.classList.add(styles.parent);
            textOverlay.classList.add(styles.overlay);
            textOverlay.classList.add(textElement?.classList.toString());
        } else {
            setTextOverlay(null);
        }
    }, [parentElement]);

    if (textOverlay) {
        return <>{ReactDOM.createPortal(<>{text}</>, textOverlay)}</>;
    }

    return null;
}
