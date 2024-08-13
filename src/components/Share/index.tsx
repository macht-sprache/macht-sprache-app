import Button, { ButtonAnchor, ButtonContainer } from '../Form/Button';
import { ReactComponent as ShareIcon } from './share-alt-solid.svg';
import { ReactComponent as TwitterIcon } from './twitter-brands.svg';
import { ReactComponent as FacebookIcon } from './facebook-f-brands.svg';
import { ReactComponent as MailIcon } from './envelope-regular.svg';
import { ReactComponent as ClipboardIcon } from './clipboard-regular.svg';
import s from './style.module.css';
import { isTouchDevice } from '../../utils';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { useMatomo } from '@jonkoops/matomo-tracker-react';
import { ModalDialog } from '../ModalDialog';

const FACEBOOK_APP_ID = '256281597718711';
const MATOMO_CATEGORY = 'share';

type Props = {
    text: string;
    url: string;
    title: string;
    size?: 'small' | 'medium';
};

export default function Share({
    text,
    title = 'macht.sprache.',
    url = window.location.href,
    label,
    itemTranslated,
    size = 'small',
    inline = false,
}: {
    text: string;
    title?: string;
    url?: string;
    label?: React.ReactNode;
    itemTranslated?: string;
    size?: 'small' | 'medium';
    inline?: boolean;
}) {
    // to have space between text and the link below
    const textWithLineBreaks = text + '\n\n';

    return (
        <>
            {/* a little weird to look for touch – but this "native" thing is not that useful on desktop usually... */}
            {label && <div className={s.label}>{label}</div>}
            {navigator.share !== undefined && isTouchDevice() ? (
                <NativeShare text={textWithLineBreaks} title={title} url={url} size={size} />
            ) : (
                <>
                    {inline ? (
                        <NonNativeShare text={textWithLineBreaks} title={title} url={url} size={size} />
                    ) : (
                        <ShareOverlay size={size} itemTranslated={itemTranslated}>
                            <NonNativeShare text={textWithLineBreaks} title={title} url={url} size={size} />
                        </ShareOverlay>
                    )}
                </>
            )}
        </>
    );
}

function ShareOverlay({
    size,
    children,
    itemTranslated,
}: {
    size: 'small' | 'medium';
    children: React.ReactNode;
    itemTranslated?: string;
}) {
    const { t } = useTranslation();

    const [modalOpen, setModalOpen] = useState(false);
    return (
        <>
            <Button
                onClick={() => {
                    setModalOpen(true);
                }}
                size={size}
                className={s.button}
            >
                <ShareIcon className={s.icon} /> {t('share.buttonLabel')}
            </Button>
            {modalOpen && (
                <ModalDialog
                    onClose={() => setModalOpen(false)}
                    title={t('share.LabelDefault', { item: itemTranslated })}
                >
                    {children}
                </ModalDialog>
            )}
        </>
    );
}

function NonNativeShare({ text, url, title, size }: Props) {
    const { trackEvent } = useMatomo();

    return (
        <ButtonContainer align="left">
            <ButtonAnchor
                target="_blank"
                rel="noopener"
                href={getTwitterLink({ text: text, url })}
                onClick={() => {
                    trackEvent({ category: MATOMO_CATEGORY, action: 'twitter' });
                }}
                className={s.button}
            >
                <TwitterIcon className={s.icon} /> Twitter
            </ButtonAnchor>
            <ButtonAnchor
                target="_blank"
                rel="noopener"
                href={getFacebookLink({ text: text, url })}
                onClick={() => {
                    trackEvent({ category: MATOMO_CATEGORY, action: 'facebook' });
                }}
                className={s.button}
            >
                <FacebookIcon className={s.icon} /> Facebook
            </ButtonAnchor>
            <ButtonAnchor
                href={getMailLink({ text: text, url, title })}
                onClick={() => {
                    trackEvent({ category: MATOMO_CATEGORY, action: 'mail' });
                }}
                className={s.button}
            >
                <MailIcon className={s.icon} /> Mail
            </ButtonAnchor>
            {navigator.clipboard && <CopyButton text={text} url={url} size={size} />}
        </ButtonContainer>
    );
}

function NativeShare({ text, url, title, size }: Props) {
    const { t } = useTranslation();
    const { trackEvent } = useMatomo();

    const share = () => {
        navigator.share({
            title: title,
            text: text,
            url: url,
        });
        trackEvent({ category: MATOMO_CATEGORY, action: 'native-share' });
    };

    return (
        <Button onClick={share} size={size} className={s.button}>
            <ShareIcon className={s.icon} /> {t('share.NativeShareButton')}
        </Button>
    );
}

function CopyButton({ text, url, size }: { text: string; url: string; size?: 'small' | 'medium' }) {
    const [copied, setCopied] = useState(false);
    const { trackEvent } = useMatomo();
    const { t } = useTranslation();

    const copy = () => {
        navigator.clipboard.writeText(`${text}${url}`).then(() => {
            setCopied(true);
            trackEvent({ category: MATOMO_CATEGORY, action: 'copy-to-clipboard' });

            setTimeout(() => {
                setCopied(false);
            }, 2000);
        });
    };

    return (
        <Button onClick={copy} size={size} className={s.button}>
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
