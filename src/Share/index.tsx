import Button, { ButtonAnchor, ButtonContainer } from '../Form/Button';
import { ReactComponent as ShareIcon } from './share-alt-solid.svg';
import { ReactComponent as TwitterIcon } from './twitter-brands.svg';
import { ReactComponent as FacebookIcon } from './facebook-f-brands.svg';
import { ReactComponent as MailIcon } from './envelope-regular.svg';
import { ReactComponent as ClipboardIcon } from './clipboard-regular.svg';
import s from './style.module.css';
import { isTouchDevice } from '../utils';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useState } from 'react';

const FACEBOOK_APP_ID = '256281597718711';

export default function Share({
    text,
    title = 'macht.sprache.',
    url = window.location.href,
    label,
    itemTranslated,
    size = 'small',
}: {
    text: string;
    title?: string;
    url?: string;
    label?: React.ReactNode;
    itemTranslated?: string;
    size?: 'small' | 'medium';
}) {
    const { t } = useTranslation();
    const labelDisplayed = label || t('share.LabelDefault', { item: itemTranslated });

    // to have space between text and the link below
    const textWithLineBreaks = text + '\n\n';

    return (
        <div className={clsx(s.container, s[size])}>
            <div className={s.label}>{labelDisplayed}</div>
            {/* a little weird to look for touch – but this "native" thing is not that useful on desktop usually... */}
            {navigator.share !== undefined && isTouchDevice() ? (
                <NativeShare text={textWithLineBreaks} title={title} url={url} size={size} />
            ) : (
                <ButtonContainer align="left">
                    <ButtonAnchor
                        target="_blank"
                        rel="noopener"
                        size={size}
                        href={getTwitterLink({ text: textWithLineBreaks, url })}
                    >
                        <TwitterIcon className={s.icon} /> Twitter
                    </ButtonAnchor>
                    <ButtonAnchor
                        target="_blank"
                        rel="noopener"
                        size={size}
                        href={getFacebookLink({ text: textWithLineBreaks, url })}
                    >
                        <FacebookIcon className={s.icon} /> Facebook
                    </ButtonAnchor>
                    <ButtonAnchor size={size} href={getMailLink({ text: textWithLineBreaks, url, title })}>
                        <MailIcon className={s.icon} /> Mail
                    </ButtonAnchor>
                    {navigator.clipboard && <CopyButton text={textWithLineBreaks} url={url} size={size} />}
                </ButtonContainer>
            )}
        </div>
    );
}

function NativeShare({
    text,
    url,
    title,
    size,
}: {
    text: string;
    url: string;
    title: string;
    size?: 'small' | 'medium';
}) {
    const { t } = useTranslation();

    const share = () => {
        navigator.share({
            title: title,
            text: text,
            url: url,
        });
    };

    return (
        <Button onClick={share} size={size}>
            <ShareIcon className={s.icon} /> {t('share.NativeShareButton')}
        </Button>
    );
}

function CopyButton({ text, url, size }: { text: string; url: string; size?: 'small' | 'medium' }) {
    const [copied, setCopied] = useState(false);
    const { t } = useTranslation();

    const copy = () => {
        navigator.clipboard.writeText(`${text}${url}`);
        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    return (
        <Button onClick={copy} size={size}>
            <ClipboardIcon className={s.icon} /> {copied ? t('share.copyToClipboardDone') : t('share.copyToClipboard')}
        </Button>
    );
}

function getTwitterLink({ text, url }: { text: string; url: string }) {
    const params = new URLSearchParams();
    params.append('text', text);
    params.append('url', url);

    return `https://twitter.com/intent/tweet?${params.toString()}`;
}

function getFacebookLink({ text, url }: { text: string; url: string }) {
    const params = new URLSearchParams();
    params.append('app_id', FACEBOOK_APP_ID);
    params.append('display', 'page');
    params.append('quote', text);
    params.append('href', url);

    return `https://www.facebook.com/dialog/share?${params.toString()}`;
}

function getMailLink({ text, url, title }: { text: string; url: string; title: string }) {
    const params = new URLSearchParams();
    params.append('body', `${text} ${url}`);
    params.append('subject', title);

    return `mailto:?${params.toString().replaceAll('+', '%20')}`;
}
