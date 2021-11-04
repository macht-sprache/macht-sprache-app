import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { useDomId } from '../../../useDomId';
import s from './style.module.css';

export default function CollapsableSection({
    children,
    title,
    intro,
    isOpenDefault,
    domId,
}: {
    children: React.ReactNode;
    title: React.ReactNode;
    intro?: React.ReactNode;
    isOpenDefault?: boolean;
    domId?: string;
}) {
    const [isOpen, setIsOpen] = useState(window.location.hash === `#${domId}` || isOpenDefault);
    const id = useDomId();
    const location = useLocation();
    const { t } = useTranslation();

    useEffect(() => {
        if (window.location.hash === `#${domId}`) {
            setIsOpen(true);
        }
    }, [location, domId]);

    return (
        <section className={clsx(s.section, { [s.open]: isOpen })}>
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
            {(isOpen || intro) && (
                <div id={id('section')} className={s.content}>
                    {intro && (
                        <>
                            <div className={s.intro}>{intro}</div>
                        </>
                    )}
                    {isOpen && <div className={s.children}>{children}</div>}
                    <div className={s.moreButtonContainer}>
                        <button
                            className={s.moreButton}
                            onClick={() => setIsOpen(!isOpen)}
                            aria-expanded={isOpen}
                            aria-controls={id('section')}
                        >
                            {isOpen ? <>{t('common.collapsor.close')}</> : <>{t('common.collapsor.more')}</>}
                            <div className={s.arrow} />
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}

export function CollapsableSectionContainer({ children }: { children: React.ReactNode }) {
    return <div className={s.container}>{children}</div>;
}
