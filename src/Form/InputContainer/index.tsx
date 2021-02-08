import s from './style.module.css';

type Props = {
    children: React.ReactNode;
};

export default function InputContainer({ children }: Props) {
    return <div className={s.container + ' inputContainer'}>{children}</div>;
}
