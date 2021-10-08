import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { langA, langB } from '../../../languages';
import { Lang } from '../../../types';
import Button, { ButtonContainer } from '../../Form/Button';
import { Select, Textarea } from '../../Form/Input';
import InputContainer from '../../Form/InputContainer';

type TextType = 'original' | 'translation';

export default function TextCheckerEntry({
    onSubmit,
    busy,
}: {
    onSubmit: (text: string, lang: Lang) => void;
    busy: boolean;
}) {
    const { t } = useTranslation();
    const [language, setLanguage] = useState<Lang | undefined>();
    const [textType, setTextType] = useState<TextType | undefined>();
    const [text, setText] = useState('');

    return (
        <>
            <p>Add a text you would like to check for sensitive terms:</p>
            <InputContainer>
                <Select
                    disabled={busy}
                    label="Language"
                    value={language}
                    span={2}
                    onChange={value => {
                        if (!value.target.value) {
                            setLanguage(undefined);
                        } else {
                            setLanguage(value.target.value === langA ? langA : langB);
                        }
                    }}
                >
                    <option value=""></option>
                    <option value={langA}>{t(`common.langLabels.${langA}` as const)}</option>
                    <option value={langB}>{t(`common.langLabels.${langB}` as const)}</option>
                </Select>
                <Select
                    disabled={busy}
                    label="Type"
                    value={textType}
                    span={2}
                    onChange={value => {
                        if (!value.target.value) {
                            setTextType(undefined);
                        } else {
                            setTextType(value.target.value === 'original' ? 'original' : 'translation');
                        }
                    }}
                >
                    <option value=""></option>
                    <option value="original">original</option>
                    <option value="translation">translation</option>
                </Select>
                <Textarea
                    busy={busy}
                    disabled={busy}
                    label="Text"
                    value={text}
                    minHeight="300px"
                    onChange={value => setText(value.target.value)}
                />
            </InputContainer>
            <ButtonContainer>
                <Button
                    primary={true}
                    disabled={!language || textType !== 'original' || busy}
                    onClick={() => onSubmit(text, language!)}
                >
                    Check text
                </Button>
            </ButtonContainer>
        </>
    );
}
