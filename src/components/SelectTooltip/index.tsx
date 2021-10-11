import debounce from 'lodash.debounce';
import Tooltip from 'rc-tooltip';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import s from './style.module.css';

type Props = {
    children: React.ReactNode;
    renderTooltip: (selectionValue: string) => React.ReactNode;
};

type TooltipState = {
    value: string;
    x: number;
    y: number;
    width: number;
    height: number;
};

export function SelectTooltipContainer({ children, renderTooltip }: Props) {
    const container = useRef<HTMLSpanElement>(null);
    const [tooltipState, setTooltipState] = useState<TooltipState | null>(null);

    const showSelectTooltipDebounced = useMemo(() => {
        const showSelectTooltip = () => {
            const selection = window.getSelection();
            if (selection?.toString()) {
                const rect = selection?.getRangeAt(0)?.getBoundingClientRect();

                if (rect && selection?.anchorNode && selection?.focusNode) {
                    const startsInContainer = container.current?.contains(selection.anchorNode);
                    const endsInContainer = container.current?.contains(selection.focusNode);

                    if (startsInContainer && endsInContainer) {
                        setTooltipState({
                            value: selection.toString(),
                            x: rect.x,
                            y: rect.y,
                            width: rect.width,
                            height: rect.height,
                        });
                    }
                }
            } else {
                setTooltipState(null);
            }
        };
        return debounce(showSelectTooltip, 500);
    }, []);

    useEffect(() => {
        document.addEventListener('selectionchange', showSelectTooltipDebounced);
        return () => document.removeEventListener('selectionchange', showSelectTooltipDebounced);
    }, [showSelectTooltipDebounced]);

    return (
        <span ref={container}>
            {children}
            {tooltipState && (
                <Tooltip
                    overlay={renderTooltip(tooltipState.value)}
                    placement="bottom"
                    visible={true}
                    destroyTooltipOnHide={true}
                >
                    <div
                        className={s.tooltipDummy}
                        style={{
                            top: `${tooltipState.y}px`,
                            left: `${tooltipState.x}px`,
                            width: `${tooltipState.width}px`,
                            height: `${tooltipState.height}px`,
                        }}
                    ></div>
                </Tooltip>
            )}
        </span>
    );
}

export function SelectTooltipLink<T = unknown>(props: Omit<React.ComponentPropsWithoutRef<Link<T>>, 'className'>) {
    return <Link<T> {...props} className={s.tooltip} />;
}
