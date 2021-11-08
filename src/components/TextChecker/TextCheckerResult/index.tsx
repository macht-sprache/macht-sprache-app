import clsx from 'clsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GetList } from '../../../hooks/fetch';
import { AddTermPageState } from '../../../pages/AddTermPage';
import { TERM_ADD } from '../../../routes';
import { Lang, TermIndex, TextToken, TranslationIndex } from '../../../types';
import Button, { ButtonContainer } from '../../Form/Button';
import { SelectTooltipContainer, SelectTooltipLink } from '../../SelectTooltip';
import HighlightedPhrase from './HighlightedPhrase';
import { useIndexGrouped, useMatchGroups } from './hooks';
import s from './style.module.css';

type Props = {
    lang: Lang;
    text: string;
    analyzedText: TextToken[];
    getTermIndex: GetList<TermIndex>;
    getTranslationIndex: GetList<TranslationIndex>;
    onCancel: () => void;
};

export default function Analysis({ lang, getTermIndex, getTranslationIndex, text, analyzedText, onCancel }: Props) {
    const { t } = useTranslation();
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const termIndex = useIndexGrouped(getTermIndex, lang);
    const translationIndex = useIndexGrouped(getTranslationIndex, lang);
    const matchGroups = useMatchGroups(analyzedText, termIndex, translationIndex);

    const children = [
        ...matchGroups.flatMap((matchGroup, index) => {
            const prevEnd = matchGroups[index - 1]?.pos[1] || 0;
            const [start, end] = matchGroup.pos;

            if (prevEnd > start) {
                return [];
            }

            return [
                <span key={index + 'a'}>{text.substring(prevEnd, start)}</span>,
                <HighlightedPhrase
                    key={index + 'b'}
                    lang={lang}
                    termRefs={matchGroup.termMatches.map(match => match.ref)}
                    translationRefs={matchGroup.translationMatches.map(match => match.ref)}
                    onTooltipVisibleChange={setTooltipOpen}
                >
                    {text.substring(start, end)}
                </HighlightedPhrase>,
            ];
        }),
        <span key="last">{text.substring(matchGroups[matchGroups.length - 1]?.pos?.[1] || 0)}</span>,
    ];

    return (
        <>
            <p>{t(matchGroups.length === 0 ? 'textChecker.result.nothingFound' : 'textChecker.result.description')}</p>
            <SelectTooltipContainer
                renderTooltip={selectValue => (
                    <SelectTooltipLink<AddTermPageState>
                        to={{ pathname: TERM_ADD, state: { term: selectValue, lang: lang } }}
                    >
                        {t('textChecker.result.addMissing')}
                    </SelectTooltipLink>
                )}
            >
                <div className={clsx(s.analysisContainer, { [s.analysisContainerWithTooltip]: tooltipOpen })}>
                    <p lang={lang}>{children}</p>
                </div>
            </SelectTooltipContainer>
            <ButtonContainer>
                <Button primary={true} onClick={onCancel}>
                    {t('textChecker.result.cancel')}
                </Button>
            </ButtonContainer>
        </>
    );
}
