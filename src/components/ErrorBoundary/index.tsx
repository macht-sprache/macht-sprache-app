import { ErrorBoundary as ErrorBoundaryComponent } from 'react-error-boundary';
import { useLocation } from 'react-router-dom';
import { ERROR_NOT_FOUND } from '../../constants';
import Header from '../Header';
import { NotFoundPage } from '../../pages/NotFoundPage';

const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    return (
        <ErrorBoundaryComponent
            resetKeys={[location]}
            fallbackRender={({ error }: { error: unknown }) => {
                if (error === ERROR_NOT_FOUND) {
                    return <NotFoundPage />;
                }
                return <Header>Something Went Wrong</Header>;
            }}
        >
            {children}
        </ErrorBoundaryComponent>
    );
};

export default ErrorBoundary;
