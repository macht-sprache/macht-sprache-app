import findLast from 'lodash/findLast';
import find from 'lodash/find';
import { PersonToken } from '../../types';
import s from './style.module.css';
import { CSS_CONTEXT_CLASS_NAME } from '../../constants';
import { injectedElementFactory } from '../injectedElementFactory';
import { useEffect, useMemo } from 'react';

const genderHintFactory = (stableParent: HTMLElement) =>
    injectedElementFactory<{ tokens: PersonToken[] }>({
        stableParent,
        createElement: parent => {
            const genderHintEl = document.createElement('div');
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
        render: () => {},
        validateInput: ({ tokens }) => (tokens && tokens.length ? { tokens } : null),
    });

export function useRenderGenderHint(stableParent?: HTMLElement) {
    const { render, destroy } = useMemo(() => {
        if (stableParent) {
            return genderHintFactory(stableParent);
        } else {
            return { render: () => {}, destroy: () => {} };
        }
    }, [stableParent]);

    useEffect(() => destroy, [destroy]);

    return render;
}
