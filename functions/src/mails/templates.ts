import mjml2html from 'mjml';
import type { MJMLJsonObject } from 'mjml-core';
import { Lang } from '../../../src/types';
import { translate } from './i18n';

type TemplateOptions = {
    recipientName: string;
    link: string;
    lang: Lang;
};

type RenderedMailTemplate = {
    subject: string;
    html: string;
};

const head: MJMLJsonObject = {
    tagName: 'mj-head',
    attributes: {},
    children: [
        {
            tagName: 'mj-attributes',
            attributes: {},
            children: [
                {
                    tagName: 'mj-class',
                    attributes: {
                        name: 'black',
                        color: 'black',
                    },
                },
                {
                    tagName: 'mj-class',
                    attributes: {
                        name: 'big',
                        'font-size': '20px',
                    },
                },
                {
                    tagName: 'mj-all',
                    attributes: {
                        name: 'big',
                        'font-family': 'Courier New, Courier',
                    },
                },
                {
                    tagName: 'mj-style',
                    attributes: {},
                    content: '.button { color: red !important; text-decoration: underline !important; }',
                },
            ],
        },
    ],
};

const getButton = (content: string, href: string): MJMLJsonObject => ({
    tagName: 'mj-button',
    attributes: {
        'css-class': 'button',
        href,
        'background-color': 'white',
        color: 'black',
        'border-radius': '0',
        border: 'solid black 2px',
    },
    content,
});

const withBaseTemplate = (children: MJMLJsonObject[]): MJMLJsonObject => ({
    tagName: 'mjml',
    attributes: {},
    children: [
        head,
        {
            tagName: 'mj-body',
            attributes: {},
            children: [
                {
                    tagName: 'mj-section',
                    attributes: {},
                    children: [
                        {
                            tagName: 'mj-column',
                            attributes: {},
                            children: [
                                {
                                    tagName: 'mj-image',
                                    attributes: {
                                        width: '100px',
                                        src: 'https://storage.googleapis.com/macht-sprache-static-assets/logo.png',
                                    },
                                },
                                ...children,
                            ],
                        },
                    ],
                },
            ],
        },
    ],
});

export const getVerifyEmailTemplate = ({ recipientName, link, lang }: TemplateOptions): RenderedMailTemplate => {
    const t = translate(lang);
    const { html } = mjml2html(
        withBaseTemplate([
            {
                tagName: 'mj-text',
                attributes: {},
                content: t('verify.greeting', { recipientName }),
            },
            {
                tagName: 'mj-text',
                attributes: {},
                content: t('verify.message'),
            },
            getButton(t('verify.button'), link),
        ])
    );
    return { html, subject: t('verify.subject') };
};
