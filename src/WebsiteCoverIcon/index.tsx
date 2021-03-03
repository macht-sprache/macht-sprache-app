import clsx from 'clsx';
import { WebPage } from '../types';
import s from './style.module.css';

type WebsiteCoverIconProps = {
    item: WebPage;
    className?: string;
};

export function WebsiteCoverIcon({ item, className }: WebsiteCoverIconProps) {
    console.log(item.logoUrl);
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
                <div className={s.noImageLabel}>{item.publisher}</div>
            )}
            {item.logoUrl && <img src={item.logoUrl} alt="" className={s.logo} />}
        </div>
    );
}

// copy'n'paste from: https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string

function extractHostname(url: string) {
    let hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf('//') > -1) {
        hostname = url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

function extractRootDomain(url: string) {
    let domain = extractHostname(url);
    const splitArr = domain.split('.');
    const arrLen = splitArr.length;

    //extracting the root domain here
    //if there is a subdomain
    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
        if (splitArr[arrLen - 2].length === 2 && splitArr[arrLen - 1].length === 2) {
            //this is using a ccTLD
            domain = splitArr[arrLen - 3] + '.' + domain;
        }
    }
    return domain;
}
