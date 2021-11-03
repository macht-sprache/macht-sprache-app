/* eslint-disable import/no-webpack-loader-syntax */

import AboutDe from '!babel-loader!@mdx-js/loader!../../Manifesto/aboutus.de.mdx';
import About from '!babel-loader!@mdx-js/loader!../../Manifesto/aboutus.en.mdx';
import GuidelinesDe from '!babel-loader!@mdx-js/loader!../../Manifesto/guidelines.de.mdx';
import Guidelines from '!babel-loader!@mdx-js/loader!../../Manifesto/guidelines.en.mdx';
import IntroDe from '!babel-loader!@mdx-js/loader!../../Manifesto/intro.de.mdx';
import Intro from '!babel-loader!@mdx-js/loader!../../Manifesto/intro.en.mdx';
import PrinciplesDe from '!babel-loader!@mdx-js/loader!../../Manifesto/principles.de.mdx';
import Principles from '!babel-loader!@mdx-js/loader!../../Manifesto/principles.en.mdx';
import StructuralConsiderationsDe from '!babel-loader!@mdx-js/loader!../../Manifesto/structural-considerations.de.mdx';
import StructuralConsiderations from '!babel-loader!@mdx-js/loader!../../Manifesto/structural-considerations.en.mdx';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import { SingleColumn } from '../../components/Layout/Columns';
import MdxWrapper from '../../components/MdxWrapper';
import { langA } from '../../languages';
import { useLang } from '../../useLang';

export default function ManifestoPage() {
    const { t } = useTranslation();
    const [lang] = useLang();
    return (
        <>
            <Header subLine={t('manifesto.subline')}>{t('manifesto.title')}</Header>
            <SingleColumn>
                <MdxWrapper>
                    {lang === langA ? (
                        <>
                            <Intro />
                            <About />
                            <Principles />
                            <Guidelines />
                            <StructuralConsiderations />
                        </>
                    ) : (
                        <>
                            <IntroDe />
                            <AboutDe />
                            <PrinciplesDe />
                            <GuidelinesDe />
                            <StructuralConsiderationsDe />
                        </>
                    )}
                </MdxWrapper>
            </SingleColumn>
        </>
    );
}
