import { useState } from 'react';
import { useDomId } from '../../../useDomId';
import s from './style.module.css';

export default function CollapsableSection({
    children,
    title,
    isOpenDefault = false,
    domId,
}: {
    children: React.ReactNode;
    title: React.ReactNode;
    isOpenDefault?: boolean;
    domId?: string;
}) {
    const [isOpen, setIsOpen] = useState(isOpenDefault);
    const id = useDomId();

    return (
        <div className={s.container}>
            <h3 className={s.heading} id={domId}>
                <button
                    onClick={() => {
                        setIsOpen(!isOpen);
                    }}
                    className={s.toggleButton}
                    aria-expanded={isOpen}
                    aria-controls={id('section')}
                >
                    {title}
                </button>
            </h3>
            {isOpen && (
                <div id={id('section')} className={s.content}>
                    {children}
                </div>
            )}
        </div>
    );
}
