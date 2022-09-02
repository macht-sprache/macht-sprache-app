import { createContext, ReactNode, useContext } from 'react';
import { createPortal } from 'react-dom';

type ContainerProps = {
    className?: string;
    portalContainer?: HTMLElement;
};

type ProviderProps = {
    children: React.ReactNode;
    containerProps?: ContainerProps;
};

const containerContext = createContext<ContainerProps>({});

export function ModalDialogProvider({ containerProps, children }: ProviderProps) {
    return <containerContext.Provider value={containerProps ?? {}}>{children}</containerContext.Provider>;
}

export function ModalDialogContainer({ children }: { children: ReactNode }) {
    const { portalContainer = document.body, className } = useContext(containerContext);
    return createPortal(<div className={className}>{children}</div>, portalContainer);
}
