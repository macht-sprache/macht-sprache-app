import clsx from 'clsx';
import { WebPage } from '../types';
import s from './style.module.css';

type WebsiteCoverIconProps = {
    item: WebPage;
    className?: string;
};

export function WebsiteCoverIcon({ item, className }: WebsiteCoverIconProps) {
    return (
        <div
            className={clsx(s.container, className)}
            aria-label={`Website: ${item.title}`}
            title={`Website: ${item.title}`}
        >
            <div className={s.topBar}>
                <div className={s.dots}>
                    <div className={s.dot} />
                    <div className={s.dot} />
                    <div className={s.dot} />
                </div>
                <div className={s.addressBar}>{extractRootDomain(item.url)}</div>
                <div />
            </div>
            {item.imageUrl ? (
                <img className={s.image} src={item.imageUrl} alt={item.title} />
            ) : (
                <div className={s.noImageLabel}>{item.publisher ?? item.title}</div>
            )}
            {item.logoUrl && <img src={item.logoUrl} alt="" className={s.logo} />}
        </div>
    );
}

function extractRootDomain(url: string) {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return '';
    }
}
