import { FormEventHandler, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { generatePath, useHistory, useParams } from 'react-router-dom';
import { useUser } from '../hooks/appContext';
import { addTranslation, useTerm } from '../hooks/data';
import Button, { ButtonContainer } from '../Form/Button';
import { Input, Textarea } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import Header from '../Header';
import { TERM, TRANSLATION } from '../routes';
import { TermWithLang } from '../TermWithLang';

type Model = {
    translation: string;
    comment: string;
};

export default function AddTranslationPage() {
    const user = useUser();
    const history = useHistory();
    const { termId } = useParams<{ termId: string }>();
    const term = useTerm(termId);
    const { t } = useTranslation();
    const [submitting, setSubmitting] = useState(false);
    const [model, setModel] = useState<Model>({ translation: '', comment: '' });

    if (!user) {
        return null;
    }

    const onSubmit: FormEventHandler = event => {
        event.preventDefault();
        setSubmitting(true);
        addTranslation(user, term, model.translation, model.comment)
            .then(translation => {
                history.push(generatePath(TRANSLATION, { termId: term.id, translationId: translation.id }));
            })
            .catch(console.error)
            .finally(() => setSubmitting(false));
    };

    return (
        <>
            <Header topHeading={[{ lang: term.lang, to: generatePath(TERM, { termId: term.id }), inner: term.value }]}>
                {t('common.entities.translation.add')}
            </Header>
            <p>
                <Trans t={t} i18nKey="translation.addTranslation" components={{ Term: <TermWithLang term={term} /> }} />
            </p>
            <form style={{ maxWidth: '500px' }} onSubmit={onSubmit}>
                <InputContainer>
                    <Input
                        label={t('common.entities.translation.value')}
                        value={model.translation}
                        onChange={event => setModel(prev => ({ ...prev, translation: event.target.value }))}
                    />
                    <Textarea
                        label={t('common.entities.comment.value')}
                        value={model.comment}
                        onChange={event => setModel(prev => ({ ...prev, comment: event.target.value }))}
                    />
                </InputContainer>

                <ButtonContainer>
                    <Button primary disabled={submitting || !model.translation} type="submit">
                        {t('common.entities.translation.add')}
                    </Button>
                </ButtonContainer>
            </form>
        </>
    );
}
