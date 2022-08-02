// eslint-disable-next-line import/no-webpack-loader-syntax
import ContentDe from '!babel-loader!@mdx-js/loader!./content.de.mdx';
// eslint-disable-next-line import/no-webpack-loader-syntax
import ContentEn from '!babel-loader!@mdx-js/loader!./content.en.mdx';
import MdxWrapper from '../../components/MdxWrapper';
import { ModalDialog } from '../../components/ModalDialog';
import { useLang } from '../../useLang';

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
        <ModalDialog title="What about Gender?" onClose={onClose} showLogo>
            <MdxWrapper>
                <Content />
            </MdxWrapper>
        </ModalDialog>
    );
}
