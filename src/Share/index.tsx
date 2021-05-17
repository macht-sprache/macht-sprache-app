import { useState } from 'react';
import Button, { ButtonAnchor, ButtonContainer } from '../Form/Button';
import { ReactComponent as ShareIcon } from './share-alt-solid.svg';
import { ReactComponent as TwitterIcon } from './twitter-brands.svg';
import { ReactComponent as FacebookIcon } from './facebook-f-brands.svg';
import { ReactComponent as MailIcon } from './envelope-regular.svg';
import s from './style.module.css';

const FACEBOOK_APP_ID = '256281597718711';

export default function Share({
    text,
    title = 'macht.sprache.',
    url = window.location.href,
}: {
    text: string;
    title?: string;
    url?: string;
}) {
    if (navigator.share !== undefined) {
        return <NativeShare text={text} title={title} url={url} />;
    }

    return (
        <ButtonContainer align="left">
            <ButtonAnchor target="_blank" rel="noopener" href={getTwitterLink({ text, url })}>
                <TwitterIcon className={s.icon} /> Twitter
            </ButtonAnchor>
            <ButtonAnchor target="_blank" rel="noopener" href={getFacebookLink({ text, url })}>
                <FacebookIcon className={s.icon} /> Facebook
            </ButtonAnchor>
            <ButtonAnchor target="_blank" rel="noopener" href={getMailLink({ text, url, title })}>
                <MailIcon className={s.icon} /> Mail
            </ButtonAnchor>
        </ButtonContainer>
    );
}

function NativeShare({ text, url, title }: { text: string; url: string; title: string }) {
    const [hasShared, setHasShared] = useState(false);

    const share = () => {
        navigator
            .share({
                title: title,
                text: text,
                url: url,
            })
            .then(() => setHasShared(true))
            .catch(error => console.log('Error sharing', error));
    };

    if (hasShared) {
        return <>thanks</>;
    }
    return (
        <Button onClick={share}>
            <ShareIcon className={s.icon} /> share!
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
