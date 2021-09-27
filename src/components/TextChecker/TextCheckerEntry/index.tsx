import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button, { ButtonContainer } from '../../Form/Button';
import { Select, Textarea } from '../../Form/Input';
import InputContainer from '../../Form/InputContainer';
import { langA, langB } from '../../../languages';
import { Lang } from '../../../types';

type TextType = 'original' | 'translation';

export default function TextCheckerEntry({ onSubmit }: { onSubmit: () => void }) {
    const { t } = useTranslation();
    const [language, setLanguage] = useState<Lang | undefined>();
    const [textType, setTextType] = useState<TextType | undefined>();
    const [text, setText] = useState(
        'Led to factors like race, development and location - to who does and who doesn’t make a ‚relatable’ victim of terror.\n\nI conceptualize this process as white fragility. Though white fragility is triggered by discomfort and anxiety, it is born of superiority and entitlement. White fragility is not weakness per se. In fact, it is a powerful means of white racial control and the protection of white advantage.'
    );

    return (
        <>
            <p>Add a text you would like to check for sensitive terms:</p>
            <InputContainer>
                <Select
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
                    label="Text"
                    value={text}
                    minHeight="300px"
                    onChange={value => {
                        setText(value.target.value);
                    }}
                />
            </InputContainer>
            <ButtonContainer>
                <Button primary={true} onClick={onSubmit}>
                    Check text
                </Button>
            </ButtonContainer>
        </>
    );
}
