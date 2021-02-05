import { TFuncKey, Trans, useTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router-dom';
import { useUser } from '../hooks/auth';
import { useAddContinueParam } from '../hooks/location';
import { LOGIN, REGISTER } from '../routes';
import s from './style.module.css';

type LoginHintProps = {
    i18nKey: TFuncKey<'translation'>;
    children: React.ReactNode;
};

export function LoginHint({ i18nKey, children }: LoginHintProps) {
    const user = useUser();
    const { t } = useTranslation();
    const addContinueParam = useAddContinueParam();

    if (user) {
        return <>{children}</>;
    }

    return (
        <div className={s.hint}>
            <Trans
                t={t}
                i18nKey={i18nKey}
                components={{
                    LoginLink: <Link to={addContinueParam(generatePath(LOGIN))} />,
                    SignUpLink: <Link to={addContinueParam(generatePath(REGISTER))} />,
                }}
            />
        </div>
    );
}
