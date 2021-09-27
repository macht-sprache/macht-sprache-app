import { useState } from 'react';
import Tooltip from 'rc-tooltip';
import { Lang } from '../../../types';
import s from './style.module.css';
import clsx from 'clsx';
import { ModalDialog } from '../../ModalDialog';
import { TermWithLang } from '../../TermWithLang';
import SelectTooltip from '../../SelectTooltip';
import { langA, langB } from '../../../languages';
import Button, { ButtonContainer, ButtonAnchor } from '../../Form/Button';

type TranslationList = {
    term: {
        value: string;
        lang: Lang;
    };
    definition?: string;
    link: string;
    translations: {
        term: { value: string; lang: Lang };
        definition?: string;
    }[];
};

const dummyTranslationRace: TranslationList = {
    term: {
        value: 'Race',
        lang: langA,
    },
    definition: 'In references to human beings, race is an identity category.',
    link: 'https://www.machtsprache.de/term/b2LXNYVQJ3BH5JFDrB8m',
    translations: [
        {
            term: {
                value: 'Race',
                lang: langB,
            },
            definition:
                'Der Englische Begriff Race kann im Deutschen beibehalten werden. Er beschreibt ein Identitätskonzept und kann als solches als feststehender Ausdruck verstanden werden.',
        },
        {
            term: {
                value: 'Rassifizierung',
                lang: langB,
            },
            definition:
                'Rassifizierung ist keine direkte Übersetzung für Race. Der Begriff beschreibt den gesellschaftlichen Prozess, der Menschen einer Race zuordnet, also einer bestimmten Identität.',
        },
        {
            term: {
                value: 'Rasse',
                lang: langB,
            },
            definition:
                'Rasse ist die wohl bekannteste Übersetzungsoption für Race. Aber die Bedeutung der Begriffe hat historisch unterschiedliche Entwicklungen durchgemacht. Rasse ist beispielsweise eng verbunden mit kolonialer, pseudowissenschaftlicher Rassenforschung und der Nazizeit. Bei Race ist klarer, dass es sich um ein Konstrukt handelt. ',
        },
    ],
};

const dummyTranslationWhiteFragility: TranslationList = {
    term: {
        value: 'white fragility',
        lang: langA,
    },
    link: 'https://www.machtsprache.de/term/b2LXNYVQJ3BH5JFDrB8m',
    translations: [
        {
            term: {
                value: 'Weiße Fragilität',
                lang: langB,
            },
        },
        {
            term: {
                value: 'Weiße Empfindlichkeit',
                lang: langB,
            },
        },
        {
            term: {
                value: 'Überweisze Empfindlichkeit',
                lang: langB,
            },
        },
        {
            term: {
                value: 'Weiße Überempfindlichkeit',
                lang: langB,
            },
        },
        {
            term: {
                value: 'White Fragility',
                lang: langB,
            },
        },
    ],
};

export default function Analysis({ onCancel }: { onCancel: () => void }) {
    const [tooltipOpen, setTooltipOpen] = useState(false);

    function onTooltipChange(isVisible: boolean) {
        setTooltipOpen(isVisible);
    }

    return (
        <>
            <p>Sensitive terms are highlighted. Click for more information.</p>
            <SelectTooltip>
                <div className={clsx(s.analysisContainer, { [s.analysisContainerWithTooltip]: tooltipOpen })}>
                    <p>
                        <span>Led to factors like</span>{' '}
                        <SensitiveWord onTooltipVisibleChange={onTooltipChange} translationList={dummyTranslationRace}>
                            race
                        </SensitiveWord>
                        <span>
                            , development and location - to who does and who doesn’t make a ‚relatable’ victim of
                            terror.
                            <br />I conceptualize this process as{' '}
                        </span>
                        <SensitiveWord
                            onTooltipVisibleChange={onTooltipChange}
                            translationList={dummyTranslationWhiteFragility}
                        >
                            <span>white fragility</span>
                        </SensitiveWord>
                        <span>. Though</span>{' '}
                        <SensitiveWord
                            onTooltipVisibleChange={onTooltipChange}
                            translationList={dummyTranslationWhiteFragility}
                        >
                            white fragility
                        </SensitiveWord>{' '}
                        <span>is triggered by discomfort and anxiety, it is born of superiority and entitlement.</span>{' '}
                        <SensitiveWord
                            onTooltipVisibleChange={onTooltipChange}
                            translationList={dummyTranslationWhiteFragility}
                        >
                            White fragility
                        </SensitiveWord>
                        <span>
                            is not weakness per se. In fact, it is a powerful means of white racial control and the
                            protection of white advantage.
                        </span>
                    </p>
                </div>
            </SelectTooltip>
            <ButtonContainer>
                <Button primary={true} onClick={onCancel}>
                    Edit Text
                </Button>
            </ButtonContainer>
        </>
    );
}

function SensitiveWord({
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
            Possible meanings:{' '}
            <ul className={s.tooltipList}>
                {translationList.translations.map((translation, index) => (
                    <li className={s.tooltipListItem} key={index}>
                        {translation.term.value}
                    </li>
                ))}
            </ul>
            <p>Click for more information</p>
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
                    className={clsx(s.sensitiveWord, { [s.sensitiveWordHovered]: tooltipOpen })}
                    lang={translationList.term.lang}
                >
                    {children}
                </button>
            </Tooltip>
            {overlayOpen && (
                <ModalDialog
                    title={
                        <span className={s.overlayTitle}>
                            <TermWithLang term={translationList.term} />
                        </span>
                    }
                    onClose={() => {
                        setOverlayOpen(false);
                    }}
                    isDismissable={true}
                >
                    <div className={s.overlayContainer}>
                        {translationList.definition && (
                            <p className={s.overlayDefinition}>{translationList.definition}</p>
                        )}
                        <h3>Possible meanings:</h3>
                        <ul className={s.overlayTranslationList}>
                            {translationList.translations.map((translation, index) => (
                                <li key={index} className={s.overlayTranslation}>
                                    <span className={s.overlayTranslationTerm}>
                                        <TermWithLang term={translation.term} />
                                    </span>
                                    {translation.definition && <>: </>}
                                    {translation.definition}
                                </li>
                            ))}
                        </ul>
                        <ButtonContainer>
                            <ButtonAnchor href={translationList.link}>Discuss or suggest options</ButtonAnchor>
                            <Button
                                primary={true}
                                onClick={() => {
                                    setOverlayOpen(false);
                                }}
                            >
                                Go back
                            </Button>
                        </ButtonContainer>
                    </div>
                </ModalDialog>
            )}
        </>
    );
}
