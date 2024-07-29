import firebase from 'firebase/compat/app';
import { Suspense, useEffect, useMemo, useState } from 'react';
import Button, { ButtonAnchor, ButtonContainer } from '../../../components/Form/Button';
import { ColumnHeading, SingleColumn } from '../../../components/Layout/Columns';
import { ModalDialog } from '../../../components/ModalDialog';
import { collections } from '../../../hooks/data';
import { useCollection } from '../../../hooks/fetch';
import {
    Comment,
    Source,
    Term,
    Translation,
    TranslationExample,
    User,
    UserProperties,
    UserSettings,
} from '../../../types';

export function Export() {
    const [showModal, setShowModal] = useState(false);
    return (
        <>
            <SingleColumn>
                <ColumnHeading>Export Data</ColumnHeading>
                <Suspense fallback={<Button disabled>Loading…</Button>}>
                    <Button onClick={() => setShowModal(true)}>Export Data…</Button>
                    {showModal && <ExportModal onClose={() => setShowModal(false)} />}
                </Suspense>
            </SingleColumn>
        </>
    );
}

function ExportModal({ onClose }: { onClose: () => void }) {
    const getTerms = useCollection(collections.terms);
    const getTranslations = useCollection(collections.translations);
    const getTranslationExamples = useCollection(collections.translationExamples);
    const getComments = useCollection(collections.comments);
    const getSources = useCollection(collections.sources);
    const getUserProperties = useCollection(collections.userProperties);
    const getUserSettings = useCollection(collections.userSettings);
    const getUsers = useCollection(collections.users);

    return (
        <ModalDialog onClose={onClose} title="Export Data">
            <ExportButtons
                terms={getTerms()}
                translations={getTranslations()}
                examples={getTranslationExamples()}
                comments={getComments()}
                sources={getSources()}
                userProperties={getUserProperties()}
                userSettings={getUserSettings()}
                users={getUsers()}
            />
            <ButtonContainer>
                <Button onClick={onClose}>Cancel</Button>
            </ButtonContainer>
        </ModalDialog>
    );
}

function ExportButtons({
    terms,
    translations,
    examples,
    comments,
    sources,
    userProperties,
    userSettings,
    users,
}: {
    terms: Term[];
    translations: Translation[];
    examples: TranslationExample[];
    comments: Comment[];
    sources: Source[];
    userProperties: UserProperties[];
    userSettings: UserSettings[];
    users: User[];
}) {
    return (
        <ButtonContainer align="left">
            <ButtonAnchor download="terms.json" href={useDownloadURL(terms)}>
                Export Terms
            </ButtonAnchor>
            <ButtonAnchor download="translations.json" href={useDownloadURL(translations)}>
                Export Translations
            </ButtonAnchor>
            <ButtonAnchor download="examples.json" href={useDownloadURL(examples)}>
                Export Examples
            </ButtonAnchor>
            <ButtonAnchor download="sources.json" href={useDownloadURL(sources)}>
                Export Sources
            </ButtonAnchor>
            <ButtonAnchor download="comments.json" href={useDownloadURL(comments)}>
                Export Comments
            </ButtonAnchor>
            <ButtonAnchor download="userProperties.json" href={useDownloadURL(userProperties)}>
                Export UserProperties
            </ButtonAnchor>
            <ButtonAnchor download="userSettings.json" href={useDownloadURL(userSettings)}>
                Export UserSettings
            </ButtonAnchor>
            <ButtonAnchor download="users.json" href={useDownloadURL(users)}>
                Export Users
            </ButtonAnchor>
        </ButtonContainer>
    );
}

function useDownloadURL(data: unknown[]) {
    const url = useMemo(
        () =>
            URL.createObjectURL(
                new Blob([JSON.stringify(rewriteRefs(data), null, 4)], {
                    type: 'application/json',
                })
            ),
        [data]
    );
    useEffect(() => () => URL.revokeObjectURL(url), [url]);
    return url;
}

function rewriteRefs(obj: any): any {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof firebase.firestore.DocumentReference) {
        return obj.path;
    }

    if (obj instanceof firebase.firestore.Timestamp) {
        return obj.toDate().toISOString();
    }

    if (Array.isArray(obj)) {
        return obj.map(rewriteRefs);
    }

    let newObj: any = {};
    Object.keys(obj).forEach(key => {
        newObj[key] = rewriteRefs(obj[key]);
    });
    return newObj;
}
