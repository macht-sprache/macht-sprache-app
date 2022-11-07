import { useAppContext } from '../../hooks/appContext';

const BetaWrapper = ({ children }: { children: React.ReactNode }) => {
    const { userProperties } = useAppContext();

    if (!userProperties?.betaAccess) {
        return null;
    }

    return <>{children}</>;
};

export default BetaWrapper;
