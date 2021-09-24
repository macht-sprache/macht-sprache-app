/* eslint-disable import/no-webpack-loader-syntax */

import CollapsableSection from '../../Layout/CollapsableSection';
import { useLang } from '../../useLang';

export const guidelinesList = [
    {
        id: 'context-specificity',
        en: require('!babel-loader!@mdx-js/loader!./context-specificity.en.mdx'),
        de: require('!babel-loader!@mdx-js/loader!./context-specificity.de.mdx'),
    },
    {
        id: 'creative-solutions',
        en: require('!babel-loader!@mdx-js/loader!./creative-solutions.en.mdx'),
        de: require('!babel-loader!@mdx-js/loader!./creative-solutions.de.mdx'),
    },
    {
        id: 'genre',
        en: require('!babel-loader!@mdx-js/loader!./genre.en.mdx'),
        de: require('!babel-loader!@mdx-js/loader!./genre.de.mdx'),
    },
    {
        id: 'harmful-language',
        en: require('!babel-loader!@mdx-js/loader!./harmful-language.en.mdx'),
        de: require('!babel-loader!@mdx-js/loader!./harmful-language.de.mdx'),
    },
    {
        id: 'maintaining-the-original-language',
        en: require('!babel-loader!@mdx-js/loader!./maintaining-the-original-language.en.mdx'),
        de: require('!babel-loader!@mdx-js/loader!./maintaining-the-original-language.de.mdx'),
    },
    {
        id: 'positionalities',
        en: require('!babel-loader!@mdx-js/loader!./positionalities.en.mdx'),
        de: require('!babel-loader!@mdx-js/loader!./positionalities.de.mdx'),
    },
    {
        id: 'tone-and-attitude',
        en: require('!babel-loader!@mdx-js/loader!./tone-and-attitude.en.mdx'),
        de: require('!babel-loader!@mdx-js/loader!./tone-and-attitude.de.mdx'),
    },
    {
        id: 'typographic-options',
        en: require('!babel-loader!@mdx-js/loader!./typographic-options.en.mdx'),
        de: require('!babel-loader!@mdx-js/loader!./typographic-options.de.mdx'),
    },
];

export default function Guidelines() {
    const [lang] = useLang();

    return (
        <>
            {guidelinesList.map(guideline => {
                const Content = guideline[lang].default;
                return (
                    <CollapsableSection key={guideline.id} title={guideline[lang].title}>
                        <Content />
                    </CollapsableSection>
                );
            })}
        </>
    );
}
