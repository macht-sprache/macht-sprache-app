import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useLocation } from 'react-router-dom';
import { useAuthState, useUser } from '../hooks/auth';
import Button, { ButtonContainer } from '../Form/Button';
import Header from '../Header';
import { REGISTER_POST } from '../routes';

export default function RegisterPostPage() {
    const user = useUser();
    const { t } = useTranslation();
    const [authUser, authLoading] = useAuthState();
    const [resendState, setResendState] = useState<'INIT' | 'SENDING' | 'SENT'>('INIT');
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const success = params.has('success');

    if (success) {
        return <VerificationSuccess />;
    }

    if (user || (!authLoading && !authUser)) {
        return <Redirect to="/" />;
    }

    const resendVerification = () => {
        setResendState('SENDING');
        authUser
            ?.sendEmailVerification({
                url: window.location.origin + REGISTER_POST + '?success',
            })
            .then(() => setResendState('SENT'))
            .catch(error => {
                console.error(error);
                setResendState('INIT');
            });
    };

    return (
        <>
            <Header>{t('auth.emailVerification.headingVerification')}</Header>
            <p>{t('auth.emailVerification.explanation', { email: authUser?.email })}</p>
            <ButtonContainer>
                <Button onClick={resendVerification} primary disabled={resendState !== 'INIT'}>
                    {resendState === 'SENT' ? t('auth.emailVerification.resent') : t('auth.emailVerification.resend')}
                </Button>
            </ButtonContainer>
        </>
    );
}

function VerificationSuccess() {
    const { t } = useTranslation();
    return (
        <>
            <Header>{t('auth.emailVerification.headingVerified')}</Header>
        </>
    );
}
