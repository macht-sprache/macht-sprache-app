import AboutDe from '../../Manifesto/aboutus.de.mdx';
import About from '../../Manifesto/aboutus.en.mdx';
import GuidelinesDe from '../../Manifesto/guidelines.de.mdx';
import Guidelines from '../../Manifesto/guidelines.en.mdx';
import IntroDe from '../../Manifesto/intro.de.mdx';
import Intro from '../../Manifesto/intro.en.mdx';
import PrinciplesDe from '../../Manifesto/principles.de.mdx';
import Principles from '../../Manifesto/principles.en.mdx';
import StructuralConsiderationsDe from '../../Manifesto/structural-considerations.de.mdx';
import StructuralConsiderations from '../../Manifesto/structural-considerations.en.mdx';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import { SingleColumn } from '../../components/Layout/Columns';
import MdxWrapper from '../../components/MdxWrapper';
import PageTitle from '../../components/PageTitle';
import { langA } from '../../languages';
import { useLang } from '../../useLang';

export default function ManifestoPage() {
    const { t } = useTranslation();
    const [lang] = useLang();
    return (
        <>
            <Header>{t('manifesto.title')}</Header>
            <PageTitle title={t('manifesto.title')} />

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
