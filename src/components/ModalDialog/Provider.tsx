import { ModalProviderProps, OverlayContainer, OverlayContainerProps, OverlayProvider } from '@react-aria/overlays';
import { ReactNode, createContext, useContext } from 'react';

type ProviderProps = ModalProviderProps & {
    containerProps?: Omit<OverlayContainerProps, 'children'>;
};

const containerContext = createContext<ProviderProps['containerProps']>({});

export function ModalDialogProvider({ containerProps, ...props }: ProviderProps) {
    return (
        <containerContext.Provider value={containerProps}>
            <OverlayProvider {...props} />
        </containerContext.Provider>
    );
}

export function ModalDialogContainer({ children }: { children: ReactNode }) {
    const containerProps = useContext(containerContext);
    return <OverlayContainer {...containerProps} children={children} />;
}
