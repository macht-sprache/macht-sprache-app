import s from './style.module.css';

type Props = {
    children: React.ReactNode;
};

export default function Header({ children }: Props) {
    return <h1 className={s.heading}>{children}</h1>;
}
