import type firebase from 'firebase';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import Button, { ButtonContainer, ButtonLink } from '../Form/Button';
import { sendEmailVerification } from '../functions';
import Header from '../Header';
import { ensureUserEntity, useAuthState, useUser } from '../hooks/appContext';
import { addContinueParam, useContinuePath } from '../hooks/location';
import { SingleColumn } from '../Layout/Columns';
import { HOME, LOGIN, REGISTER_POST } from '../routes';
import { User } from '../types';
import { useLang } from '../useLang';

export default function RegisterPostPage() {
    const user = useUser();
    const [authUser] = useAuthState();
    const continuePath = useContinuePath();
    const location = useLocation();

    const verifyParams = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const mode = params.get('mode');
        const actionCode = params.get('oobCode');
        const continueUrl = params.get('continueUrl');

        if (mode !== 'verifyEmail' || !actionCode) {
            return;
        }

        return { actionCode, continueUrl };
    }, [location.search]);

    if (verifyParams) {
        return <VerifyEmail authUser={authUser} {...verifyParams} />;
    }

    if (user || !authUser) {
        return <Redirect to={continuePath} />;
    }

    return <VerificationRequired continuePath={continuePath} authUser={authUser} />;
}

function VerifyEmail({
    user,
    authUser,
    actionCode,
    continueUrl,
}: {
    user?: User;
    authUser?: firebase.User;
    actionCode: string;
    continueUrl: string | null;
}) {
    const { t } = useTranslation();
    const [verifyState, setVerifyState] = useState<'VERIFYING' | 'VERIFIED' | 'ERROR'>('VERIFYING');

    useEffect(() => {
        auth.applyActionCode(actionCode).then(
            () => {
                setVerifyState('VERIFIED');
                auth.currentUser?.reload();
            },
            error => {
                setVerifyState('ERROR');
                console.error(error);
            }
        );
    }, [actionCode]);

    useEffect(() => {
        if (verifyState === 'VERIFIED' && authUser) {
            ensureUserEntity(authUser);
        }
    }, [authUser, verifyState]);

    const continuePath = continueUrl?.replace(window.location.origin, '') || HOME;
    const linkTo = user ? continuePath : addContinueParam(LOGIN, continuePath);

    switch (verifyState) {
        case 'VERIFYING':
            return <Header>Verifying Email…</Header>;
        case 'VERIFIED':
            return (
                <>
                    <Header>{t('auth.emailVerification.headingVerified')}</Header>
                    <SingleColumn>
                        <p>{t('auth.emailVerification.welcomeVerified')}</p>
                        <ButtonContainer>
                            <ButtonLink to={linkTo}>{t('auth.emailVerification.continue')}</ButtonLink>
                        </ButtonContainer>
                    </SingleColumn>
                </>
            );
        case 'ERROR':
            return <Header>{t('common.error.general')}</Header>;
    }
}

function VerificationRequired({ continuePath, authUser }: { continuePath: string; authUser?: firebase.User }) {
    const { t } = useTranslation();
    const [lang] = useLang();
    const [resendState, setResendState] = useState<'INIT' | 'SENDING' | 'SENT'>('INIT');

    const resendVerification = () => {
        setResendState('SENDING');
        sendEmailVerification(lang, window.location.origin, REGISTER_POST, continuePath)
            .then(() => setResendState('SENT'))
            .catch(error => {
                console.error(error);
                setResendState('INIT');
            });
    };

    return (
        <>
            <Header>{t('auth.emailVerification.headingVerification')}</Header>
            <SingleColumn>
                <p>{t('auth.emailVerification.explanation', { email: authUser?.email })}</p>
                <ButtonContainer>
                    <Button onClick={resendVerification} primary disabled={resendState !== 'INIT'}>
                        {resendState === 'SENT'
                            ? t('auth.emailVerification.resent')
                            : t('auth.emailVerification.resend')}
                    </Button>
                </ButtonContainer>
            </SingleColumn>
        </>
    );
}
