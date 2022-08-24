// eslint-disable-next-line import/no-webpack-loader-syntax
import ContentDe from '!babel-loader!@mdx-js/loader!./content.de.mdx';
// eslint-disable-next-line import/no-webpack-loader-syntax
import ContentEn from '!babel-loader!@mdx-js/loader!./content.en.mdx';
import MdxWrapper from '../../components/MdxWrapper';
import { ModalDialog } from '../../components/ModalDialog';
import { useLang } from '../../useLang';
import { useGuidelines } from '../../Manifesto/guidelines/guidelines';
import CollapsableSection from '../../components/Layout/CollapsableSection';
import { Suspense } from 'react';
import { Columns } from '../../components/Layout/Columns';
import { Trans } from 'react-i18next';
import { MANIFESTO } from '../../routes';
import s from './style.module.css';

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

const content = {
    de: ContentDe,
    en: ContentEn,
};

export function GenderOverlay({ isOpen, onClose }: Props) {
    const [lang] = useLang();
    const Content = content[lang];

    if (!isOpen) {
        return null;
    }

    return (
        <ModalDialog title="What about Gender?" onClose={onClose} showLogo isDismissable width="wider">
            <Columns>
                <div>
                    <MdxWrapper>
                        <Content />
                    </MdxWrapper>
                </div>
                <Suspense fallback={null}>
                    <Guidelines />
                </Suspense>
            </Columns>
        </ModalDialog>
    );
}

function Guidelines() {
    const getGuidelines = useGuidelines(['creative-solutions']);
    const guidelines = getGuidelines();

    return (
        <div className={s.manifesto}>
            <h3>
                <Trans
                    i18nKey="textChecker.result.modal.headingGuidelines"
                    // eslint-disable-next-line jsx-a11y/anchor-has-content
                    components={{
                        ManifestoLink: <a target="_blank " href={`${process.env.REACT_APP_MAIN_ORIGIN}${MANIFESTO}`} />,
                    }}
                />
            </h3>
            {guidelines.map(guideline => {
                return (
                    <CollapsableSection
                        key={guideline.id}
                        title={guideline.title}
                        intro={guideline.intro}
                        domId={guideline.id}
                        isOpenDefault
                    >
                        <guideline.Content />
                    </CollapsableSection>
                );
            })}
        </div>
    );
}
