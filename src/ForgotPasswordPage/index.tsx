import { FormEventHandler, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import Button, { ButtonContainer } from '../Form/Button';
import { ErrorBox } from '../Form/ErrorBox';
import { Input } from '../Form/Input';
import InputContainer from '../Form/InputContainer';
import { sendPasswordReset } from '../functions';
import Header from '../Header';
import { AuthHandlerParams, useAuthHandlerParams, useLogin } from '../hooks/auth';
import { useContinuePath } from '../hooks/location';
import { useRequestState } from '../hooks/useRequestState';
import { SingleColumn } from '../Layout/Columns';
import { FORGOT_PASSWORD } from '../routes';
import { useLang } from '../useLang';

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
        auth.verifyPasswordResetCode(actionCode).then(setEmail, error => {
            setError(true);
            console.error(error);
        });
    }, [actionCode]);

    if (error) {
        return (
            <>
                <Header>{t('auth.passwordReset.expiredHeading')}</Header>
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
        auth.confirmPasswordReset(actionCode, password)
            .then(() => login(email, password))
            .catch(error => setRequestState('ERROR', error));
    };

    return (
        <>
            <Header>{t('auth.passwordReset.heading')}</Header>
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
                <Header>{t('auth.passwordReset.requestSuccessHeader')}</Header>
                <SingleColumn>
                    <p>{t('auth.passwordReset.requestSuccessExplanation', { email })}</p>
                </SingleColumn>
            </>
        );
    }

    return (
        <>
            <Header>{t('auth.passwordReset.requestLabel')}</Header>
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
