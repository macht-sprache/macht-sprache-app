import Button, { ButtonAnchor, ButtonContainer } from '../Form/Button';
import { ReactComponent as ShareIcon } from './share-alt-solid.svg';
import { ReactComponent as TwitterIcon } from './twitter-brands.svg';
import { ReactComponent as FacebookIcon } from './facebook-f-brands.svg';
import { ReactComponent as MailIcon } from './envelope-regular.svg';
import s from './style.module.css';
import { isTouchDevice } from '../utils';
import { useTranslation } from 'react-i18next';

const FACEBOOK_APP_ID = '256281597718711';

export default function Share({
    text,
    title = 'macht.sprache.',
    url = window.location.href,
    label,
    itemTranslated,
}: {
    text: string;
    title?: string;
    url?: string;
    label?: React.ReactNode;
    itemTranslated?: string;
}) {
    const { t } = useTranslation();
    const labelDisplayed = label || t('share.LabelDefault', { item: itemTranslated });

    // to have space between text and the link below
    const textWithLineBreaks = text + '\n\n';

    return (
        <div className={s.container}>
            {labelDisplayed}
            {/* a little weird to look for touch – but this "native" thing is not that useful on desktop usually... */}
            {navigator.share !== undefined && isTouchDevice() ? (
                <NativeShare text={textWithLineBreaks} title={title} url={url} />
            ) : (
                <ButtonContainer align="left">
                    <ButtonAnchor
                        target="_blank"
                        rel="noopener"
                        size="small"
                        href={getTwitterLink({ text: textWithLineBreaks, url })}
                    >
                        <TwitterIcon className={s.icon} /> Twitter
                    </ButtonAnchor>
                    <ButtonAnchor
                        target="_blank"
                        rel="noopener"
                        size="small"
                        href={getFacebookLink({ text: textWithLineBreaks, url })}
                    >
                        <FacebookIcon className={s.icon} /> Facebook
                    </ButtonAnchor>
                    <ButtonAnchor size="small" href={getMailLink({ text: textWithLineBreaks, url, title })}>
                        <MailIcon className={s.icon} /> Mail
                    </ButtonAnchor>
                </ButtonContainer>
            )}
        </div>
    );
}

function NativeShare({ text, url, title }: { text: string; url: string; title: string }) {
    const { t } = useTranslation();

    const share = () => {
        navigator.share({
            title: title,
            text: text,
            url: url,
        });
    };

    return (
        <Button onClick={share} size="small">
            <ShareIcon className={s.icon} /> {t('share.NativeShareButton')}
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
