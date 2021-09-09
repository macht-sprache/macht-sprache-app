import Tooltip from 'rc-tooltip';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button, { ButtonContainer, ButtonAnchor } from '../Form/Button';
import { Select, Textarea } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import Header from '../Header';
import { langA, langB } from '../languages';
import { SingleColumn } from '../Layout/Columns';
import { Lang } from '../types';
import s from './style.module.css';
import clsx from 'clsx';
import { ModalDialog } from '../ModalDialog';

type TextType = 'original' | 'translation';

type TranslationList = {
    word: string;
    definition?: string;
    link: string;
    translations: { word: string; definition?: string }[];
};

const dummyTranslationRace: TranslationList = {
    word: 'Race',
    definition: 'In references to human beings, race is an identity category.',
    link: 'https://www.machtsprache.de/term/b2LXNYVQJ3BH5JFDrB8m',
    translations: [
        {
            word: 'Race',
            definition:
                'Der Englische Begriff Race kann im Deutschen beibehalten werden. Er beschreibt ein Identitätskonzept und kann als solches als feststehender Ausdruck verstanden werden.',
        },
        {
            word: 'Rassifizierung',
            definition:
                'Rassifizierung ist keine direkte Übersetzung für Race. Der Begriff beschreibt den gesellschaftlichen Prozess, der Menschen einer Race zuordnet, also einer bestimmten Identität.',
        },
        {
            word: 'Rasse',
            definition:
                'Rasse ist die wohl bekannteste Übersetzungsoption für Race. Aber die Bedeutung der Begriffe hat historisch unterschiedliche Entwicklungen durchgemacht. Rasse ist beispielsweise eng verbunden mit kolonialer, pseudowissenschaftlicher Rassenforschung und der Nazizeit. Bei Race ist klarer, dass es sich um ein Konstrukt handelt. ',
        },
    ],
};

const dummyTranslationWhiteFragility: TranslationList = {
    word: 'white fragility',
    link: 'https://www.machtsprache.de/term/b2LXNYVQJ3BH5JFDrB8m',
    translations: [
        {
            word: 'Weiße Fragilität',
        },
        {
            word: 'Weiße Empfindlichkeit',
        },
        {
            word: 'Überweisze Empfindlichkeit',
        },
        {
            word: 'Weiße Überempfindlichkeit',
        },
        {
            word: 'White Fragility',
        },
    ],
};

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
    const [tooltipOpen, setTooltipOpen] = useState(false);

    function onTooltipChange(isVisible: boolean) {
        setTooltipOpen(isVisible);
    }

    return (
        <>
            <p>Click on the words for more information.</p>
            <div className={clsx(s.analysisContainer, { [s.analysisContainerWithTooltip]: tooltipOpen })}>
                <p>
                    <span>Led to factors like</span>{' '}
                    <SensibleWord onTooltipVisibleChange={onTooltipChange} translationList={dummyTranslationRace}>
                        race
                    </SensibleWord>
                    <span>
                        , development and location - to who does and who doesn’t make a ‚relatable’ victim of terror.
                        <br />I conceptualize this process as{' '}
                    </span>
                    <SensibleWord
                        onTooltipVisibleChange={onTooltipChange}
                        translationList={dummyTranslationWhiteFragility}
                    >
                        <span>white fragility</span>
                    </SensibleWord>
                    <span>. Though</span>{' '}
                    <SensibleWord
                        onTooltipVisibleChange={onTooltipChange}
                        translationList={dummyTranslationWhiteFragility}
                    >
                        white fragility
                    </SensibleWord>{' '}
                    <span>is triggered by discomfort and anxiety, it is born of superiority and entitlement.</span>{' '}
                    <SensibleWord
                        onTooltipVisibleChange={onTooltipChange}
                        translationList={dummyTranslationWhiteFragility}
                    >
                        White fragility
                    </SensibleWord>
                    <span>
                        is not weakness per se. In fact, it is a powerful means of white racial control and the
                        protection of white advantage.
                    </span>
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

function SensibleWord({
    children,
    translationList,
    onTooltipVisibleChange,
}: {
    children: React.ReactNode;
    translationList: TranslationList;
    onTooltipVisibleChange: (isVisible: boolean) => void;
}) {
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [overlayOpen, setOverlayOpen] = useState(false);

    const tooltip = (
        <div
            className={s.tooltip}
            onClick={() => {
                setOverlayOpen(true);
            }}
        >
            {translationList.definition && <p className={s.tooltipDefinition}>{translationList.definition}</p>}
            Click for possible translations
        </div>
    );

    return (
        <>
            <Tooltip
                overlay={tooltip}
                placement="bottom"
                onVisibleChange={visible => {
                    setTooltipOpen(visible);
                    onTooltipVisibleChange(visible);
                }}
                mouseEnterDelay={0.2}
                mouseLeaveDelay={0.2}
            >
                <button
                    onClick={() => {
                        setOverlayOpen(true);
                    }}
                    className={clsx(s.sensibleWord, { [s.sensibleWordHovered]: tooltipOpen })}
                >
                    {children}
                </button>
            </Tooltip>
            {overlayOpen && (
                <ModalDialog
                    title={translationList.word}
                    onClose={() => {
                        setOverlayOpen(false);
                    }}
                    isDismissable={true}
                >
                    <div className={s.overlay}>
                        {translationList.definition && (
                            <p className={s.overlayDefinition}>{translationList.definition}</p>
                        )}
                        <ul className={s.overlayTranslationList}>
                            {translationList.translations.map((translation, index) => (
                                <li key={index} className={s.overlayTranslation}>
                                    <span className={s.overlayWord}>{translation.word}</span>
                                    {translation.definition && <>: </>}
                                    {translation.definition}
                                </li>
                            ))}
                        </ul>
                        <ButtonContainer>
                            <ButtonAnchor href={translationList.link}>More information</ButtonAnchor>
                            <Button
                                primary={true}
                                onClick={() => {
                                    setOverlayOpen(false);
                                }}
                            >
                                close
                            </Button>
                        </ButtonContainer>
                    </div>
                </ModalDialog>
            )}
        </>
    );
}

function Form({ onSubmit }: { onSubmit: () => void }) {
    const { t } = useTranslation();
    const [language, setLanguage] = useState<Lang | undefined>();
    const [textType, setTextType] = useState<TextType | undefined>();
    const [text, setText] = useState(
        'Led to factors like race, development and location - to who does and who doesn’t make a ‚relatable’ victim of terror.\n\nI conceptualize this process as white fragility. Though white fragility is triggered by discomfort and anxiety, it is born of superiority and entitlement. White fragility is not weakness per se. In fact, it is a powerful means of white racial control and the protection of white advantage.'
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
