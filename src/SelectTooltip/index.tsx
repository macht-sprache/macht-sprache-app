import debounce from 'lodash.debounce';
import Tooltip from 'rc-tooltip';
import React, { useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import s from './style.module.css';

type TooltipPosition = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export default function SelectTooltip({ children }: { children: React.ReactNode }) {
    const container = useRef<HTMLSpanElement>(null);
    const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);

    const showSelectTooltip = () => {
        const selection = window.getSelection();
        if (selection?.toString() !== '') {
            const rect = selection?.getRangeAt(0)?.getBoundingClientRect();

            if (rect && selection?.anchorNode && selection?.focusNode) {
                const startsInContainer = container.current?.contains(selection.anchorNode);
                const endsInContainer = container.current?.contains(selection.focusNode);

                if (startsInContainer && endsInContainer) {
                    setTooltipPosition({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
                }
            }
        } else {
            setTooltipPosition(null);
        }
    };

    const showSelectTooltipDebounced = debounce(showSelectTooltip, 500);

    useEffect(() => {
        document.addEventListener('selectionchange', showSelectTooltipDebounced);

        return () => {
            document.removeEventListener('selectionchange', showSelectTooltipDebounced);
        };
    }, [showSelectTooltipDebounced]);

    return (
        <span ref={container}>
            {children}
            {tooltipPosition && (
                <Tooltip
                    overlay={<div className={s.tooltip}>Click to add missing word to macht.sprache.</div>}
                    placement="bottom"
                    visible={true}
                >
                    <div
                        className={s.tooltipDummy}
                        style={{
                            top: `${tooltipPosition.y}px`,
                            left: `${tooltipPosition.x}px`,
                            width: `${tooltipPosition.width}px`,
                            height: `${tooltipPosition.height}px`,
                        }}
                    ></div>
                </Tooltip>
            )}
        </span>
    );
}
