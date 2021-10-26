import { FormEventHandler, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, useHistory, useLocation } from 'react-router-dom';
import Button, { ButtonContainer } from '../../components/Form/Button';
import { Input, Select, Textarea } from '../../components/Form/Input';
import InputContainer from '../../components/Form/InputContainer';
import { SimpleHeader } from '../../components/Header';
import { useUser } from '../../hooks/appContext';
import { addTerm } from '../../hooks/data';
import { langA, langB } from '../../languages';
import { TERM } from '../../routes';
import { Lang } from '../../types';

type Model = {
    term: string;
    lang: Lang | '';
    comment: string;
};

export type AddTermPageState = {
    term: string;
    lang: Lang;
};

export default function AddTermPage() {
    const user = useUser();
    const history = useHistory();
    const { t } = useTranslation();
    const [submitting, setSubmitting] = useState(false);
    const { state: locationState = {} } = useLocation<Partial<AddTermPageState> | undefined>();
    const [model, setModel] = useState<Model>({
        term: locationState.term || '',
        lang: locationState.lang || '',
        comment: '',
    });

    if (!user) {
        return null;
    }

    const onSubmit: FormEventHandler = event => {
        event.preventDefault();
        setSubmitting(true);
        addTerm(user, model.term, model.lang || langA, model.comment)
            .then(ref => history.replace(generatePath(TERM, { termId: ref.id })))
            .catch(console.error)
            .finally(() => setSubmitting(false));
    };

    return (
        <>
            <SimpleHeader>{t('term.add')}</SimpleHeader>
            <p>
                <Trans t={t} i18nKey="term.addTermDescription" />
            </p>
            <form style={{ maxWidth: '500px' }} onSubmit={onSubmit}>
                <InputContainer>
                    <Input
                        label={t('common.entities.term.value')}
                        span={3}
                        value={model.term}
                        onChange={event => setModel(prev => ({ ...prev, term: event.target.value }))}
                    />
                    <Select
                        label={t('common.langLabels.language')}
                        value={model.lang}
                        span={1}
                        onChange={event => setModel(prev => ({ ...prev, lang: event.target.value as Lang }))}
                    >
                        <option value=""></option>
                        <option value={langA}>{t(`common.langLabels.${langA}` as const)}</option>
                        <option value={langB}>{t(`common.langLabels.${langB}` as const)}</option>
                    </Select>
                    <Textarea
                        label={t('common.entities.comment.value')}
                        value={model.comment}
                        optional
                        onChange={event => setModel(prev => ({ ...prev, comment: event.target.value }))}
                    />
                </InputContainer>
                <ButtonContainer>
                    <Button primary disabled={submitting || !model.lang || !model.term} type="submit">
                        {t('term.add')}
                    </Button>
                </ButtonContainer>
            </form>
        </>
    );
}
