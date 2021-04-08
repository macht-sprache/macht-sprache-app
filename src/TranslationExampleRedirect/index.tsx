import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePath, useHistory, useParams } from 'react-router';
import Header from '../Header';
import { collections } from '../hooks/data';
import { useDocument } from '../hooks/fetch';
import { TRANSLATION_EXAMPLE } from '../routes';

export default function TranslationExampleRedirect() {
    const { t } = useTranslation();
    const history = useHistory();
    const { translationExampleId } = useParams<{
        translationExampleId: string;
    }>();
    const getTranslationExample = useDocument(collections.translationExamples.doc(translationExampleId));
    const translationExample = getTranslationExample();
    const getTranslation = useDocument(translationExample.translation);
    const translation = getTranslation();

    useEffect(() => {
        history.replace(
            generatePath(TRANSLATION_EXAMPLE, {
                termId: translation.term.id,
                translationId: translationExample.translation.id,
                translationExampleId: translationExampleId,
            })
        );
    }, [translation, translationExample, translationExampleId, history]);

    return <Header>{t('common.loading')}</Header>;
}
