import mjml2html from 'mjml';
import type { MJMLJsonObject } from 'mjml-core';
import { compile } from 'path-to-regexp';
import { langA, langB } from '../../../src/languages';
import { Lang } from '../../../src/types';
import config from '../config';
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

const colors = {
    font: '#1e5166',
    langA: '#9cdcb2',
    langB: '#ceb9d2',
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
                    tagName: 'mj-all',
                    attributes: {
                        'font-family': 'Courier New, Courier',
                        color: colors.font,
                    },
                },
                {
                    tagName: 'mj-section',
                    attributes: {
                        padding: '10px 0',
                    },
                },
            ],
        },
        {
            tagName: 'mj-style',
            attributes: { inline: 'inline' },
            content: `
            .link {
                color: ${colors.font};
            }
            .userContent {
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 1.1rem;
                line-height: 1.3;
            }
            `,
        },
    ],
};

const getButton = (content: string, href: string): MJMLJsonObject => ({
    tagName: 'mj-button',
    attributes: {
        href,
        'background-color': 'white',
        color: 'black',
        'border-radius': '0',
        border: 'solid black 2px',
    },
    content,
});

const getText = (content: string): MJMLJsonObject => ({
    tagName: 'mj-text',
    attributes: {},
    content,
});

const getSectionColumn = (children: MJMLJsonObject[]): MJMLJsonObject => ({
    tagName: 'mj-section',
    attributes: {},
    children: [
        {
            tagName: 'mj-column',
            attributes: {},
            children,
        },
    ],
});

const getActivityItem = (head: string, body: string, link: string, lang?: Lang): MJMLJsonObject => {
    let content = `
        <div style="margin-bottom: 5px; font-style: italic">
            ${head}
        </div>
        <a
            href="${link}"
            style="
                color: ${colors.font};
                display: block;
                border: solid 2px ${getLangColor(lang)};
                text-decoration: none;">
            ${body}
        </a>
    `;

    return {
        tagName: 'mj-text',
        attributes: {},
        content,
    };
};

export const getActivityItemTerm = (head: string, body: string, link: string, lang?: Lang): MJMLJsonObject => {
    return getActivityItem(
        head,
        `<div style="
                padding: 10px;
                background: ${getLangColor(lang)};
                display: inline-block;
                font-weight: bold;
                font-size: 1.4em">
            ${body}
        </div>`,
        link,
        lang
    );
};

export const getActivityItemComment = (head: string, body: string, link: string, lang?: Lang): MJMLJsonObject => {
    return getActivityItem(
        head,
        `<div class="userContent" style="padding: 10px">
            ${body}
        </div>`,
        link,
        lang
    );
};

const getLangColor = (lang?: Lang) => {
    if (lang === langA) {
        return colors.langA;
    }
    if (lang === langB) {
        return colors.langB;
    }
    return colors.font;
};

const withBaseTemplate = (firstColumnContent: MJMLJsonObject[], columns: MJMLJsonObject[] = []): MJMLJsonObject => ({
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
                                        alt: 'macht.sprache.',
                                    },
                                },
                                ...firstColumnContent,
                            ],
                        },
                    ],
                },
                ...columns,
            ],
        },
    ],
});

export const getVerifyEmailTemplate = ({ recipientName, link, lang }: TemplateOptions): RenderedMailTemplate => {
    const t = translate(lang);
    const { html } = mjml2html(
        withBaseTemplate([
            getText(t('greeting', { recipientName })),
            getText(t('verify.message')),
            getButton(t('verify.button'), link),
            getText(t('urlManual', { url: link })),
        ])
    );
    return { html, subject: t('verify.subject') };
};

export const getResetEmail = ({ recipientName, link, lang }: TemplateOptions): RenderedMailTemplate => {
    const t = translate(lang);
    const { html } = mjml2html(
        withBaseTemplate([
            getText(t('greeting', { recipientName })),
            getText(t('resetPassword.message')),
            getButton(t('resetPassword.button'), link),
            getText(t('urlManual', { url: link })),
            getText(t('resetPassword.ignoreHint')),
        ])
    );
    return { html, subject: t('resetPassword.subject') };
};

export const getActivationMail = ({ recipientName, link, lang }: TemplateOptions): RenderedMailTemplate => {
    const t = translate(lang);
    const { html } = mjml2html(
        withBaseTemplate([
            getText(t('greeting', { recipientName })),
            getText(t('activation.message')),
            getButton(t('activation.button'), link),
        ])
    );
    return { html, subject: t('activation.subject') };
};

export const getWeeklyDigestMail = (
    { recipientName, lang, link }: TemplateOptions,
    content: MJMLJsonObject[]
): RenderedMailTemplate => {
    const t = translate(lang);

    const { html } = mjml2html(
        withBaseTemplate(
            [getText(t('greeting', { recipientName })), getText(t('weeklyDigest.intro'))],
            [getSectionColumn(content), getSectionColumn([getText(t('weeklyDigest.unsubscribe', { url: link }))])]
        )
    );
    return { html, subject: t('weeklyDigest.subject') };
};

export const generateUrl = (route: string, params: object) => `${config.origin.main}${compile(route)(params)}`;
