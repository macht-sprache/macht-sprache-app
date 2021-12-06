import { useTranslation } from 'react-i18next';
import { langA, langB } from '../../../languages';
import { Lang } from '../../../types';
import BlankBox from '../../Form/BlankBox';
import Button from '../../Form/Button';
import { HorizontalRadio, HorizontalRadioContainer } from '../../Form/HorizontalRadio';
import s from './style.module.css';

const languages: Lang[] = [langA, langB];

type Props = {
    onLanguageChange?: (lang: Lang) => void;
    busy?: boolean;
    lang?: Lang;
    buttonLabel: React.ReactNode;
    onSubmit: () => void;
    buttonDisabled?: boolean;
};

export default function BottomBar({
    onLanguageChange,
    busy = false,
    lang,
    buttonLabel,
    onSubmit,
    buttonDisabled = false,
}: Props) {
    const { t } = useTranslation();

    return (
        <BlankBox>
            <div className={s.bottomBox}>
                <div>
                    <HorizontalRadioContainer
                        label={t('textChecker.entry.languageSelect')}
                        disabled={onLanguageChange === undefined || busy}
                    >
                        {languages.map(language => (
                            <HorizontalRadio
                                disabled={onLanguageChange === undefined || busy}
                                key={language}
                                checked={language === lang}
                                value={language}
                                label={t(`common.langLabels.${language}`)}
                                onChange={() => {
                                    if (onLanguageChange) {
                                        onLanguageChange(language);
                                    }
                                }}
                            />
                        ))}
                    </HorizontalRadioContainer>
                </div>
                <div className={s.submitButtonContainer}>
                    <Button busy={busy} primary={true} disabled={buttonDisabled} onClick={onSubmit}>
                        {buttonLabel}
                    </Button>
                </div>
            </div>
        </BlankBox>
    );
}
