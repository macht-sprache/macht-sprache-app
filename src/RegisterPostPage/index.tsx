import { useState } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { useAuthState, useUser } from '../authHooks';
import Button, { ButtonContainer } from '../Form/Button';
import Header from '../Header';
import { REGISTER_POST } from '../routes';

export default function RegisterPostPage() {
    const user = useUser();
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
            <Header>Email Verification</Header>
            <p>Please click the link we sent you to {authUser?.email}.</p>
            <ButtonContainer>
                <Button onClick={resendVerification} primary disabled={resendState !== 'INIT'}>
                    {resendState === 'SENT' ? 'Verification Email Sent' : 'Resend Verification Email'}
                </Button>
            </ButtonContainer>
        </>
    );
}

function VerificationSuccess() {
    return (
        <>
            <Header>Email Verified</Header>
        </>
    );
}
