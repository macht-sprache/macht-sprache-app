import { useTranslation } from 'react-i18next';
import { Lang } from '../../../types';
import { Textarea } from '../../Form/Input';
import InputContainer from '../../Form/InputContainer';
import BottomBar from '../BottomBar';

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
            <InputContainer>
                <Textarea
                    disabled={busy}
                    label={t('textChecker.entry.text')}
                    value={text}
                    minHeight="300px"
                    onChange={({ target }) => updateModel({ text: target.value })}
                    placeholder={t('textChecker.entry.description')}
                />
                <BottomBar
                    onLanguageChange={lang => {
                        updateModel({ lang });
                    }}
                    buttonLabel={t(busy ? 'textChecker.entry.submitBusy' : 'textChecker.entry.submit')}
                    busy={busy}
                    onSubmit={onSubmit}
                    buttonDisabled={!lang || text === '' || busy}
                    lang={lang}
                />
            </InputContainer>
        </>
    );
}
