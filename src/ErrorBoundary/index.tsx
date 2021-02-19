import { ErrorBoundary as ErrorBoundaryComponent } from 'react-error-boundary';
import { useLocation } from 'react-router-dom';
import { ERROR_NOT_FOUND } from '../constants';
import Header from '../Header';
import { NotFoundPage } from '../NotFoundPage';

const ErrorBoundary: React.FC = ({ children }) => {
    const location = useLocation();
    return (
        <ErrorBoundaryComponent
            resetKeys={[location]}
            fallbackRender={({ error }) => {
                if (error.message === ERROR_NOT_FOUND) {
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
