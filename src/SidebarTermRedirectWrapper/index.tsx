import { generatePath, matchPath, Redirect, useLocation } from 'react-router-dom';
import { Get } from '../hooks/fetch';
import { TERM, TERM_SIDEBAR } from '../routes';
import { Term } from '../types';

type Props = {
    getTerm: Get<Term>;
};

const replacePath = (pathname: string, termId: string, originalPath: string, newPath: string) =>
    pathname.replace(generatePath(originalPath, { termId }), generatePath(newPath, { termId }));

const SidebarTermRedirectWrapper: React.FC<Props> = ({ children, getTerm }) => {
    const term = getTerm();
    const { pathname } = useLocation();

    if (term.adminTags.showInSidebar && matchPath(pathname, { path: TERM })) {
        return <Redirect to={replacePath(pathname, term.id, TERM, TERM_SIDEBAR)} />;
    } else if (!term.adminTags.showInSidebar && matchPath(pathname, { path: TERM_SIDEBAR })) {
        return <Redirect to={replacePath(pathname, term.id, TERM_SIDEBAR, TERM)} />;
    }

    return <>{children}</>;
};

export default SidebarTermRedirectWrapper;
