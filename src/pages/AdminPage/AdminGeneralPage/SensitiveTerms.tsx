import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DividedList from '../../../components/DividedList';
import Button, { ButtonContainer } from '../../../components/Form/Button';
import { ErrorBox } from '../../../components/Form/ErrorBox';
import { Input } from '../../../components/Form/Input';
import InputContainer from '../../../components/Form/InputContainer';
import { ColumnHeading, SingleColumn } from '../../../components/Layout/Columns';
import { ModalDialog } from '../../../components/ModalDialog';
import { Redact } from '../../../components/RedactSensitiveTerms';
import { getRedact } from '../../../components/RedactSensitiveTerms/service';
import { collections } from '../../../hooks/data';
import { Get, useDocument } from '../../../hooks/fetch';
import { useRequestState } from '../../../hooks/useRequestState';
import { SensitiveTerms } from '../../../types';

export function SensitiveTermsAdminSettings() {
    const getSensitiveTerms = useDocument(collections.sensitiveTerms.doc('global'));
    const [showModal, setShowModal] = useState(false);

    return (
        <SingleColumn>
            <ColumnHeading>Sensitive Terms</ColumnHeading>
            <p>
                <SensitiveTermsDisplay getSensitiveTerms={getSensitiveTerms} />{' '}
            </p>
            <Button size="small" onClick={() => setShowModal(true)}>
                Edit sensitive terms…
            </Button>
            {showModal && (
                <SensitiveTermsModal getSensitiveTerms={getSensitiveTerms} onClose={() => setShowModal(false)} />
            )}
        </SingleColumn>
    );
}

function SensitiveTermsDisplay({ getSensitiveTerms }: { getSensitiveTerms: Get<SensitiveTerms> }) {
    const sensitiveTerms = getSensitiveTerms().terms;
    return (
        <DividedList divider=", ">
            {sensitiveTerms.map(term => (
                <Redact key={term}>{term}</Redact>
            ))}
        </DividedList>
    );
}

function SensitiveTermsModal({
    getSensitiveTerms,
    onClose,
}: {
    getSensitiveTerms: Get<SensitiveTerms>;
    onClose: () => void;
}) {
    const sensitiveTerms = getSensitiveTerms().terms;
    const { t } = useTranslation();
    const [termModel, setTermModel] = useState(sensitiveTerms);
    const [saveState, setSaveState] = useRequestState();
    const saveTerms = async () => {
        setSaveState('IN_PROGRESS');
        try {
            await collections.sensitiveTerms.doc('global').update({ terms: termModel.filter(t => !!t) });
            setSaveState('DONE');
            onClose();
        } catch (e) {
            setSaveState('ERROR', e);
        }
    };

    return (
        <ModalDialog onClose={onClose} title="Edit Sensitive Terms">
            <SensitiveTermsList terms={termModel} onChange={setTermModel} />
            <h3>Test Redaction</h3>
            <TestRedaction terms={termModel} />
            {saveState === 'ERROR' && <ErrorBox>{t('common.error.general')}</ErrorBox>}
            <ButtonContainer>
                <Button onClick={onClose}>Cancel</Button>
                <Button primary busy={saveState === 'IN_PROGRESS'} onClick={saveTerms}>
                    Save
                </Button>
            </ButtonContainer>
        </ModalDialog>
    );
}

function SensitiveTermsList({ terms, onChange }: { terms: string[]; onChange: (terms: string[]) => void }) {
    const setTerm = (i: number, term: string) => {
        const newTerms = [...terms];
        newTerms[i] = term;
        onChange(newTerms);
    };

    const deleteTerm = (i: number) => {
        const newTerms = [...terms];
        newTerms.splice(i, 1);
        onChange(newTerms);
    };

    const addTerm = () => onChange([...terms, '']);

    return (
        <>
            <InputContainer>
                {terms.map((term, i) => (
                    <Input
                        key={i}
                        label="Term"
                        value={term}
                        onChange={e => setTerm(i, e.target.value)}
                        span={4}
                        inlineButton={<Button onClick={() => deleteTerm(i)}>Delete</Button>}
                    />
                ))}
            </InputContainer>
            <ButtonContainer align="center">
                <Button size="small" onClick={addTerm}>
                    + Add Sensitive Term
                </Button>
            </ButtonContainer>
        </>
    );
}

function TestRedaction({ terms }: { terms: string[] }) {
    const [value, setValue] = useState('');
    const redact = getRedact(new Set(terms.map(term => term.toLowerCase())));
    const redacted = redact(value);

    return (
        <InputContainer>
            <Input label="Term to redact" value={value} span={2} onChange={e => setValue(e.target.value)} />
            <Input label="Result" span={2} value={redacted} disabled />
        </InputContainer>
    );
}
