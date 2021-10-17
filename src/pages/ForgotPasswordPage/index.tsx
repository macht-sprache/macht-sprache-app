import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { FormEventHandler, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Button, { ButtonContainer } from '../../components/Form/Button';
import { ErrorBox } from '../../components/Form/ErrorBox';
import { Input } from '../../components/Form/Input';
import InputContainer from '../../components/Form/InputContainer';
import { SimpleHeader } from '../../components/Header';
import { SingleColumn } from '../../components/Layout/Columns';
import { auth } from '../../firebase';
import { sendPasswordReset } from '../../functions';
import { AuthHandlerParams, useAuthHandlerParams, useLogin } from '../../hooks/auth';
import { useContinuePath } from '../../hooks/location';
import { useRequestState } from '../../hooks/useRequestState';
import { FORGOT_PASSWORD } from '../../routes';
import { useLang } from '../../useLang';

export default function ForgotPasswordPage() {
    const resetParams = useAuthHandlerParams('resetPassword');

    if (resetParams) {
        return <ResetPassword {...resetParams} />;
    }

    return <RequestPasswordReset />;
}

function ResetPassword({ actionCode, continueUrl }: AuthHandlerParams) {
    const { t } = useTranslation();
    const [email, setEmail] = useState<string>();
    const [error, setError] = useState(false);

    useEffect(() => {
        verifyPasswordResetCode(auth, actionCode).then(setEmail, error => {
            setError(true);
            console.error(error);
        });
    }, [actionCode]);

    if (error) {
        return (
            <>
                <SimpleHeader>{t('auth.passwordReset.expiredHeading')}</SimpleHeader>
                <SingleColumn>
                    <Trans
                        t={t}
                        i18nKey="auth.passwordReset.expiredExplanation"
                        components={{ Link: <Link to={FORGOT_PASSWORD} /> }}
                    />
                </SingleColumn>
            </>
        );
    }

    if (email) {
        return <ResetPasswordForm email={email} actionCode={actionCode} continueUrl={continueUrl} />;
    }

    return null;
}

function ResetPasswordForm({ email, actionCode, continueUrl }: { email: string } & AuthHandlerParams) {
    const { t } = useTranslation();
    const [password, setPassword] = useState('');
    const [requestState, setRequestState] = useRequestState();
    const continuePath = continueUrl?.replace(window.location.origin, '');
    const { login, loginState } = useLogin(continuePath, true);

    const onSubmit: FormEventHandler = event => {
        event.preventDefault();
        setRequestState('IN_PROGRESS');
        confirmPasswordReset(auth, actionCode, password)
            .then(() => login(email, password))
            .catch(error => setRequestState('ERROR', error));
    };

    return (
        <>
            <SimpleHeader>{t('auth.passwordReset.heading')}</SimpleHeader>
            <SingleColumn>
                <form onSubmit={onSubmit}>
                    <input type="hidden" autoComplete="username" value={email} />
                    <InputContainer>
                        <Input
                            type="password"
                            label={t('auth.passwordReset.newPassword')}
                            value={password}
                            autoComplete="new-password"
                            onChange={event => setPassword(event.target.value)}
                        />
                    </InputContainer>

                    {(requestState === 'ERROR' || loginState === 'ERROR') && (
                        <ErrorBox>{t('common.error.general')}</ErrorBox>
                    )}

                    <ButtonContainer>
                        <Button primary type="submit" disabled={requestState === 'IN_PROGRESS'}>
                            {t('auth.passwordReset.saveButton')}
                        </Button>
                    </ButtonContainer>
                </form>
            </SingleColumn>
        </>
    );
}

function RequestPasswordReset() {
    const { t } = useTranslation();
    const continuePath = useContinuePath();
    const [lang] = useLang();
    const [email, setEmail] = useState('');
    const [requestState, setRequestState] = useRequestState();

    const onSubmit: FormEventHandler = event => {
        event.preventDefault();
        setRequestState('IN_PROGRESS');
        sendPasswordReset(email, lang, window.location.origin, continuePath)
            .then(() => setRequestState('DONE'))
            .catch(error => setRequestState('ERROR', error));
    };

    if (requestState === 'DONE') {
        return (
            <>
                <SimpleHeader>{t('auth.passwordReset.requestSuccessHeader')}</SimpleHeader>
                <SingleColumn>
                    <p>{t('auth.passwordReset.requestSuccessExplanation', { email })}</p>
                </SingleColumn>
            </>
        );
    }

    return (
        <>
            <SimpleHeader>{t('auth.passwordReset.requestLabel')}</SimpleHeader>
            <SingleColumn>
                <p>{t('auth.passwordReset.requestExplanation')}</p>
                <form onSubmit={onSubmit}>
                    <InputContainer>
                        <Input
                            type="email"
                            label={t('auth.email')}
                            disabled={requestState === 'IN_PROGRESS'}
                            value={email}
                            onChange={event => setEmail(event.target.value)}
                        />
                    </InputContainer>

                    {requestState === 'ERROR' && <ErrorBox>{t('common.error.general')}</ErrorBox>}

                    <ButtonContainer>
                        <Button primary type="submit" disabled={requestState === 'IN_PROGRESS'}>
                            {t('auth.passwordReset.requestButton')}
                        </Button>
                    </ButtonContainer>
                </form>
            </SingleColumn>
        </>
    );
}
