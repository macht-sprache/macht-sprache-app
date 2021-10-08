import clsx from 'clsx';
import Tooltip from 'rc-tooltip';
import { Suspense, useState } from 'react';
import { generatePath } from 'react-router-dom';
import { getTranslationsRef } from '../../../hooks/data';
import { Get, GetList, useCollection, useDocument } from '../../../hooks/fetch';
import { langA } from '../../../languages';
import { TERM } from '../../../routes';
import { DocReference, Lang, Term, TermIndex, TextToken, Translation } from '../../../types';
import { useLang } from '../../../useLang';
import Button, { ButtonAnchor, ButtonContainer } from '../../Form/Button';
import { ModalDialog } from '../../ModalDialog';
import { Redact } from '../../RedactSensitiveTerms';
import SelectTooltip from '../../SelectTooltip';
import { TermWithLang } from '../../TermWithLang';
import s from './style.module.css';

type Props = {
    lang: Lang;
    text: string;
    analyzedText: TextToken[];
    getTermIndex: GetList<TermIndex>;
    onCancel: () => void;
};

type Match = {
    pos: [number, number];
    ref: DocReference<Term>;
};

export default function Analysis({ lang, getTermIndex, text, analyzedText, onCancel }: Props) {
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const termIndex = getTermIndex().filter(i => i.lang === lang);
    const termIndexByFirstLemma = termIndex.reduce<{ [firstLemma: string]: TermIndex[] }>((acc, cur) => {
        cur.lemmas.forEach(lemmaList => {
            const firstLemma = lemmaList[0]?.toLowerCase();
            if (firstLemma) {
                if (acc[firstLemma]) {
                    acc[firstLemma].push(cur);
                } else {
                    acc[firstLemma] = [cur];
                }
            }
        });
        return acc;
    }, {});

    const matches = analyzedText.reduce<Match[]>((acc, cur, index) => {
        const potentialMatches = termIndexByFirstLemma[cur.lemma.toLowerCase()];
        if (potentialMatches) {
            potentialMatches.forEach(potentialMatch => {
                const lemmaList = potentialMatch.lemmas.find(ll =>
                    ll.every(
                        (lemma, lemmaIndex) =>
                            analyzedText[index + lemmaIndex]?.lemma.toLowerCase() === lemma.toLowerCase()
                    )
                );
                if (lemmaList) {
                    acc.push({
                        pos: [cur.pos[0], analyzedText[index + lemmaList.length - 1].pos[1]],
                        ref: potentialMatch.ref,
                    });
                }
            });
        }
        return acc;
    }, []);

    const children = [
        ...matches.flatMap((match, index) => {
            const prevPos = matches[index - 1]?.pos[1] || 0;
            return [
                <span key={index + 'a'}>{text.substring(prevPos, match.pos[0])}</span>,
                <SensitiveWord
                    key={index + 'b'}
                    lang={lang}
                    termRef={match.ref}
                    onTooltipVisibleChange={setTooltipOpen}
                >
                    {text.substring(match.pos[0], match.pos[1])}
                </SensitiveWord>,
            ];
        }),
        <span key="last">{text.substring(matches[matches.length - 1]?.pos?.[1] || 0)}</span>,
    ];

    return (
        <>
            <p>Sensitive terms are highlighted. Click for more information.</p>
            <SelectTooltip>
                <div className={clsx(s.analysisContainer, { [s.analysisContainerWithTooltip]: tooltipOpen })}>
                    <p>{children}</p>
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
    termRef,
    lang,
    onTooltipVisibleChange,
}: {
    children: React.ReactNode;
    termRef: DocReference<Term>;
    lang: Lang;
    onTooltipVisibleChange: (isVisible: boolean) => void;
}) {
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [overlayOpen, setOverlayOpen] = useState(false);

    const getTerm = useDocument(termRef);
    const getTranslations = useCollection(getTranslationsRef(termRef));

    return (
        <>
            <Tooltip
                overlay={
                    <Suspense fallback={null}>
                        <TermTooltip
                            getTerm={getTerm}
                            getTranslations={getTranslations}
                            onClick={() => setOverlayOpen(true)}
                        />
                    </Suspense>
                }
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
                    lang={lang}
                >
                    {children}
                </button>
            </Tooltip>
            {overlayOpen && (
                <Suspense fallback={null}>
                    <TermModal
                        getTerm={getTerm}
                        getTranslations={getTranslations}
                        onClose={() => setOverlayOpen(false)}
                    />
                </Suspense>
            )}
        </>
    );
}

type TermProps = {
    getTerm: Get<Term>;
    getTranslations: GetList<Translation>;
};

type ModalProps = TermProps & {
    onClose: () => void;
};

type TooltipProps = TermProps & {
    onClick: () => void;
};

function TermModal({ getTerm, getTranslations, onClose }: ModalProps) {
    const [lang] = useLang();
    const term = getTerm();
    const translations = getTranslations();
    const langIdentifier = lang === langA ? 'langA' : ('langB' as const);
    const termDefinition = term.definition[langIdentifier];

    return (
        <ModalDialog
            title={
                <span className={s.overlayTitle}>
                    <TermWithLang term={term} />
                </span>
            }
            onClose={onClose}
            isDismissable={true}
        >
            <div className={s.overlayContainer}>
                {termDefinition && <p className={s.overlayDefinition}>{termDefinition}</p>}
                <h3>Possible meanings:</h3>
                <ul className={s.overlayTranslationList}>
                    {translations.map(translation => (
                        <li key={translation.id} className={s.overlayTranslation}>
                            <span className={s.overlayTranslationTerm}>
                                <TermWithLang term={translation} />
                            </span>
                            {translation.definition[langIdentifier] && <>: </>}
                            {translation.definition[langIdentifier]}
                        </li>
                    ))}
                </ul>
                <ButtonContainer>
                    <ButtonAnchor href={generatePath(TERM, { termId: term.id })}>
                        Discuss or suggest options
                    </ButtonAnchor>
                    <Button primary={true} onClick={onClose}>
                        Go back
                    </Button>
                </ButtonContainer>
            </div>
        </ModalDialog>
    );
}

function TermTooltip({ getTerm, getTranslations, onClick }: TooltipProps) {
    const [lang] = useLang();
    const term = getTerm();
    const translations = getTranslations();
    const termDefinition = term.definition[lang === langA ? 'langA' : 'langB'];

    return (
        <div className={s.tooltip} onClick={onClick}>
            {termDefinition && <p className={s.tooltipDefinition}>{termDefinition}</p>}
            Possible meanings:{' '}
            <ul className={s.tooltipList}>
                {translations.map(translation => (
                    <li className={s.tooltipListItem} key={translation.id}>
                        <Redact>{translation.value}</Redact>
                    </li>
                ))}
            </ul>
            <p>Click for more information</p>
        </div>
    );
}
