import CollapsableSection, { CollapsableSectionContainer } from '../../components/Layout/CollapsableSection';
import { useGuidelines } from './guidelines';

export default function Guidelines() {
    const getGuidelines = useGuidelines();

    return (
        <CollapsableSectionContainer>
            {getGuidelines().map(guideline => {
                return (
                    <CollapsableSection
                        key={guideline.id}
                        title={guideline.title}
                        intro={guideline.intro}
                        domId={guideline.id}
                    >
                        <guideline.Content />
                    </CollapsableSection>
                );
            })}
        </CollapsableSectionContainer>
    );
}
