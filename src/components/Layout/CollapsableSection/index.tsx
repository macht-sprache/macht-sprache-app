import { useEffect, useState } from 'react';
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
        <section className={s.container}>
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
                        <div className={s.intro}>
                            {intro}
                            {!isOpen && (
                                <>
                                    {' '}
                                    <button
                                        className={s.moreButton}
                                        onClick={() => setIsOpen(true)}
                                        aria-expanded={isOpen}
                                        aria-controls={id('section')}
                                    >
                                        {t('common.more')}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                    {isOpen && <div className={s.children}>{children}</div>}
                </div>
            )}
        </section>
    );
}