import s from './style.module.css';

type MultiStepIndicatorProps = {
    children?: React.ReactElement<MultiStepIndicatorStepProps> | React.ReactElement<MultiStepIndicatorStepProps>[];
};

export function MultiStepIndicator({ children }: MultiStepIndicatorProps) {
    return (
        <div role="tablist" className={s.list}>
            {children}
        </div>
    );
}

type MultiStepIndicatorStepProps = {
    children: React.ReactNode;
    active?: boolean;
};

export function MultiStepIndicatorStep({ children, active }: MultiStepIndicatorStepProps) {
    return (
        <div role="tab" aria-selected={active} className={s.item}>
            {children}
        </div>
    );
}
