import s from './style.module.css';

type ErrorBoxProps = {
    children: React.ReactNode;
};

export function ErrorBox({ children }: ErrorBoxProps) {
    return <div className={s.container}>{children}</div>;
}
