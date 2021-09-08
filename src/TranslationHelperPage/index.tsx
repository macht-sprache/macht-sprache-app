import Tooltip from 'rc-tooltip';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button, { ButtonContainer } from '../Form/Button';
import { Select, Textarea } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import Header from '../Header';
import { langA, langB } from '../languages';
import { SingleColumn } from '../Layout/Columns';
import { Lang } from '../types';
import s from './style.module.css';

type TextType = 'original' | 'translation';

export default function TranslationHelperPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);

    return (
        <>
            <Header subLine="Get help with sensible translations">Translation Helper</Header>
            <SingleColumn>
                {isSubmitted ? (
                    <Analysis
                        onCancel={() => {
                            setIsSubmitted(false);
                        }}
                    />
                ) : (
                    <Form
                        onSubmit={() => {
                            setIsSubmitted(true);
                        }}
                    />
                )}{' '}
            </SingleColumn>
        </>
    );
}

function Analysis({ onCancel }: { onCancel: () => void }) {
    return (
        <>
            <p>Hover over the words for more information.</p>
            <div className={s.analysisContainer}>
                <p>
                    I conceptualize this process as <SensibleWord>white fragility</SensibleWord>. Though{' '}
                    <SensibleWord>white fragility</SensibleWord> is triggered by discomfort and anxiety, it is born of
                    superiority and entitlement. <SensibleWord>White fragility</SensibleWord>
                    is not weakness per se. In fact, it is a powerful means of white racial control and the protection
                    of white advantage.
                </p>
            </div>
            <ButtonContainer>
                <Button primary={true} onClick={onCancel}>
                    Edit Text
                </Button>
            </ButtonContainer>
        </>
    );
}

function SensibleWord({ children }: { children: React.ReactNode }) {
    return (
        <Tooltip overlay={<>huhu</>} placement="bottom">
            <span className={s.sensibleWord}>{children}</span>
        </Tooltip>
    );
}

function Form({ onSubmit }: { onSubmit: () => void }) {
    const { t } = useTranslation();
    const [language, setLanguage] = useState<Lang | undefined>();
    const [textType, setTextType] = useState<TextType | undefined>();
    const [text, setText] = useState(
        'I conceptualize this process as white fragility. Though white fragility is triggered by discomfort and anxiety, it is born of superiority and entitlement. White fragility is not weakness per se. In fact, it is a powerful means of white racial control and the protection of white advantage.'
    );

    return (
        <>
            <p>Add a text you would like to analyse for sensible terms:</p>
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
                    label="Type of the text"
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
                    Analyse for terms
                </Button>
            </ButtonContainer>
        </>
    );
}
