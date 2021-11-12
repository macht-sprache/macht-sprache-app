import { useTranslation } from 'react-i18next';
import { langA, langB } from '../../../languages';
import { Lang } from '../../../types';
import Button, { ButtonContainer } from '../../Form/Button';
import { Select, Textarea } from '../../Form/Input';
import InputContainer from '../../Form/InputContainer';

export type TextCheckerValue = {
    lang: Lang | undefined;
    text: string;
};

type Props = {
    value: TextCheckerValue;
    onChange: (value: TextCheckerValue) => void;
    onSubmit: () => void;
    busy?: boolean;
};

export default function TextCheckerEntry({ value: { lang, text }, onChange, onSubmit, busy }: Props) {
    const { t } = useTranslation();
    const updateModel = (update: Partial<TextCheckerValue>) => onChange({ lang, text, ...update });

    return (
        <>
            <p>{t('textChecker.entry.description')}</p>
            <InputContainer>
                <Select
                    disabled={busy}
                    label={t('common.langLabels.language')}
                    value={lang}
                    onChange={({ target }) => {
                        if (!target.value) {
                            updateModel({ lang: undefined });
                        } else {
                            updateModel({ lang: target.value === langA ? langA : langB });
                        }
                    }}
                >
                    <option value=""></option>
                    <option value={langA}>{t(`common.langLabels.${langA}` as const)}</option>
                    <option value={langB}>{t(`common.langLabels.${langB}` as const)}</option>
                </Select>
                <Textarea
                    busy={busy}
                    disabled={busy}
                    label={t('textChecker.entry.text')}
                    value={text}
                    minHeight="300px"
                    onChange={({ target }) => updateModel({ text: target.value })}
                />
            </InputContainer>
            <ButtonContainer>
                <Button primary={true} disabled={!lang || text === '' || busy} onClick={onSubmit}>
                    {t('textChecker.entry.submit')}
                </Button>
            </ButtonContainer>
        </>
    );
}
