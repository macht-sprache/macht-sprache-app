import s from './style.module.css';
import React from 'react';

export function IllustrationSection({
    children,
    title,
    buttons,
    image,
}: {
    children?: React.ReactNode;
    title: React.ReactNode;
    buttons?: React.ReactNode;
    image?: string;
}) {
    return (
        <section className={s.box}>
            <div>
                <h1 className={s.boxTitle}>{title}</h1>
                <div className={s.boxText}>{children}</div>
                {buttons && <div className={s.buttons}>{buttons}</div>}
            </div>
            {image && <img className={s.image} src={image} alt="" />}
        </section>
    );
}
