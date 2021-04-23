import mjml2html from 'mjml';
import type { MJMLJsonObject } from 'mjml-core';
import { langA, langB } from '../../../src/languages';
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
                        'font-family': 'Courier New, Courier',
                        color: '#1e5166',
                    },
                },
                {
                    tagName: 'mj-section',
                    attributes: {
                        padding: '10px 0',
                    },
                },
                {
                    tagName: 'mj-style',
                    attributes: {},
                    content: '.button { color: red !important; text-decoration: underline !important; }',
                },
            ],
        },
        {
            tagName: 'mj-style',
            attributes: { inline: 'inline' },
            content: `
            .link {
                color: inherit
            }
            .userContent {
                font-family: -apple-system,BlinkMacSystemFont, sans-serif;
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
        'css-class': 'button',
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
            children: [...children],
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
                color: currentColor;
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

const getActivityItemTerm = (head: string, body: string, link: string, lang?: Lang): MJMLJsonObject => {
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

const getActivityItemComment = (head: string, body: string, link: string, lang?: Lang): MJMLJsonObject => {
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
        return '#9cdcb2';
    }
    if (lang === langB) {
        return '#ceb9d2';
    }
    return 'currentColor';
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

export const getWeeklyDigestMail = ({ recipientName, lang }: TemplateOptions): RenderedMailTemplate => {
    const t = translate(lang);

    const { html } = mjml2html(
        withBaseTemplate(
            [getText(t('greeting', { recipientName })), getText(t('weeklyDigest.intro'))],
            [
                getSectionColumn([
                    getActivityItemTerm(
                        t('weeklyDigest.newTerm', {
                            userUrl: '#',
                            userName: 'Peter',
                        }),
                        `homeless person`,
                        '#',
                        langA
                    ),
                    getActivityItemTerm(
                        t('weeklyDigest.newTranslation', {
                            userUrl: '#',
                            userName: 'Peter',
                            termUrl: '#',
                            term: 'homeless person',
                        }),
                        `Obdachloser`,
                        '#',
                        langB
                    ),
                    getActivityItemComment(
                        t('weeklyDigest.newComment', {
                            userUrl: '#',
                            userName: 'Peter',
                            termUrl: '#',
                            term: 'they',
                        }),
                        'Ich bin nicht-binär und hab mir extra als neuen Namen was einsilbiges ausgesucht, damit der Name gleichzeitig auch als Pronomen genommen werden kann',
                        '#'
                    ),
                ]),
                getSectionColumn([getText(t('weeklyDigest.unsubscribe'))]),
            ]
        )
    );
    return { html, subject: t('weeklyDigest.subject') };
};
