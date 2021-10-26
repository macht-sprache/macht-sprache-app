import { useAppContext } from '../../hooks/appContext';

const BetaWrapper: React.FC = ({ children }) => {
    const { userProperties } = useAppContext();

    if (!userProperties?.betaAccess) {
        return null;
    }

    return <>{children}</>;
};

export default BetaWrapper;
