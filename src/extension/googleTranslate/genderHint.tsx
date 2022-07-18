import find from 'lodash/find';
import findLast from 'lodash/findLast';
import { CSS_CONTEXT_CLASS_NAME } from '../../constants';
import { PersonToken } from '../../types';
import { getUseRenderElement, injectedElementFactory } from '../injectedElementFactory';
import s from './style.module.css';

const genderHintFactory = (stableParent: HTMLElement) =>
    injectedElementFactory<{ tokens: PersonToken[]; onOpenGenderModal: () => void }>({
        stableParent,
        createElement: parent => {
            const genderHintEl = document.createElement('button');
            genderHintEl.classList.add(CSS_CONTEXT_CLASS_NAME, s.genderHint);
            genderHintEl.textContent = 'What about Gender?';
            genderHintEl.onmouseenter = () => parent.classList.add(s.genderHintHovered);
            genderHintEl.onmouseleave = () => parent.classList.remove(s.genderHintHovered);
            return genderHintEl;
        },
        attachElement: (el, parent) => {
            const buttonBar = findLast(parent.children, child => child.tagName === 'DIV');
            const characterLabel = find(buttonBar?.children, child => child.tagName === 'SPAN');
            characterLabel?.before(el);
        },
        render: ({ onOpenGenderModal }, el) => {
            el.onclick = onOpenGenderModal;
        },
        validateInput: ({ tokens, onOpenGenderModal }) =>
            tokens && tokens.length && onOpenGenderModal ? { tokens, onOpenGenderModal } : null,
    });

export const useRenderGenderHint = getUseRenderElement(genderHintFactory);
