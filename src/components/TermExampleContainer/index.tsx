import s from './style.module.css';

export default function TermExampleContainer({ children }: { children: React.ReactNode }) {
    return <div className={s.container}>{children}</div>;
}
