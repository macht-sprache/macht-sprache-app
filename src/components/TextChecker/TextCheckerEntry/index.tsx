import { useTranslation } from 'react-i18next';
import { langA, langB } from '../../../languages';
import { Lang } from '../../../types';
import Button, { ButtonContainer } from '../../Form/Button';
import { Select, Textarea } from '../../Form/Input';
import InputContainer from '../../Form/InputContainer';

type TextType = 'original' | 'translation';
export type TextCheckerValue = {
    lang: Lang | undefined;
    text: string;
    textType: TextType | undefined;
};

type Props = {
    value: TextCheckerValue;
    onChange: (value: TextCheckerValue) => void;
    onSubmit: () => void;
    busy?: boolean;
};

export default function TextCheckerEntry({ value: { lang, text, textType }, onChange, onSubmit, busy }: Props) {
    const { t } = useTranslation();
    const updateModel = (update: Partial<TextCheckerValue>) => onChange({ lang, text, textType, ...update });

    return (
        <>
            <p>{t('textChecker.entry.description')}</p>
            <InputContainer>
                <Select
                    disabled={busy}
                    label={t('common.langLabels.language')}
                    value={lang}
                    span={2}
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
                <Select
                    disabled={busy}
                    label={t('textChecker.entry.type.label')}
                    value={textType}
                    span={2}
                    onChange={({ target }) => {
                        if (!target.value) {
                            updateModel({ textType: undefined });
                        } else {
                            updateModel({ textType: target.value === 'original' ? 'original' : 'translation' });
                        }
                    }}
                >
                    <option value=""></option>
                    <option value="original">{t('textChecker.entry.type.original')}</option>
                    <option value="translation">{t('textChecker.entry.type.translation')}</option>
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
                <Button primary={true} disabled={!lang || textType !== 'original' || busy} onClick={onSubmit}>
                    {t('textChecker.entry.submit')}
                </Button>
            </ButtonContainer>
        </>
    );
}
