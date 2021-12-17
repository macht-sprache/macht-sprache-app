import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router';
import { GetList } from '../../../hooks/fetch';
import { addSearchParam } from '../../../hooks/location';
import { AddTermPageState } from '../../../pages/AddTermPage';
import { TERM_ADD } from '../../../routes';
import { Lang, Term, TermIndex, TextToken, TranslationIndex } from '../../../types';
import BlankBox from '../../Form/BlankBox';
import InputContainer from '../../Form/InputContainer';
import { SelectTooltipContainer, SelectTooltipLink } from '../../SelectTooltip';
import BottomBar from '../BottomBar';
import HighlightedPhrase from './HighlightedPhrase';
import { useFilteredIndex, useIndexGrouped, useMatchGroups } from './hooks';
import s from './style.module.css';

type Props = {
    lang: Lang;
    text: string;
    analyzedText: TextToken[];
    getHiddenTerms: GetList<Term>;
    getTermIndex: GetList<TermIndex>;
    getTranslationIndex: GetList<TranslationIndex>;
    onCancel: () => void;
};

const useShowModal = () => {
    const key = 'showMatch';
    const location = useLocation();
    const history = useHistory();
    const param = new URLSearchParams(location.search).get(key);

    const showModal = param && parseInt(param);
    const openModal = useCallback(
        (textIndex: number) => {
            history.push(addSearchParam(location.pathname, [key, textIndex.toString()]), location.state);
        },
        [history, location.pathname, location.state]
    );
    const closeModal = useCallback(() => history.goBack(), [history]);

    return { showModal, openModal, closeModal };
};

export default function Analysis({
    lang,
    getTermIndex,
    getTranslationIndex,
    getHiddenTerms,
    text,
    analyzedText,
    onCancel,
}: Props) {
    const { t } = useTranslation();
    const { showModal, openModal, closeModal } = useShowModal();
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const termIndex = useIndexGrouped(useFilteredIndex(getTermIndex, getHiddenTerms, lang));
    const translationIndex = useIndexGrouped(useFilteredIndex(getTranslationIndex, getHiddenTerms, lang));
    const matchGroups = useMatchGroups(text, analyzedText, termIndex, translationIndex);

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
                    showModal={showModal === start}
                    openModal={() => openModal(start)}
                    closeModal={closeModal}
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
            <InputContainer>
                <BlankBox>
                    <div className={s.textLabel}>
                        {t(
                            matchGroups.length === 0
                                ? 'textChecker.result.nothingFound'
                                : 'textChecker.result.description'
                        )}
                    </div>
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
                </BlankBox>

                <BottomBar buttonLabel={t('textChecker.result.cancel')} onSubmit={onCancel} lang={lang} />
            </InputContainer>
        </>
    );
}
