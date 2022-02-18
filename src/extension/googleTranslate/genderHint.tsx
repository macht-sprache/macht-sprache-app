import findLast from 'lodash/findLast';
import find from 'lodash/find';
import { PersonToken } from '../../types';
import s from './style.module.css';
import { CSS_CONTEXT_CLASS_NAME } from '../../constants';

let genderHintEl: HTMLElement | null = null;

const renderGenderHintEl = (el: HTMLTextAreaElement) => {
    const container = el.closest('c-wiz');

    if (genderHintEl && container?.contains(genderHintEl)) {
        return genderHintEl;
    }

    const buttonBar = findLast(container?.children, child => child.tagName === 'DIV');
    const characterLabel = find(buttonBar?.children, child => child.tagName === 'SPAN');

    genderHintEl = document.createElement('div');
    genderHintEl.classList.add(CSS_CONTEXT_CLASS_NAME, s.genderHint);
    genderHintEl.textContent = 'What about Gender?';
    genderHintEl.onmouseenter = () => container?.classList.add(s.genderHintHovered);
    genderHintEl.onmouseleave = () => container?.classList.remove(s.genderHintHovered);
    characterLabel?.before(genderHintEl);
};

export function renderGenderHint(el?: HTMLTextAreaElement, results?: PersonToken[]) {
    if (el && results?.length) {
        renderGenderHintEl(el);
    } else {
        genderHintEl?.remove();
    }
}
