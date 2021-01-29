import s from './style.module.css';

type CommentsProps = {
    children: React.ReactNode;
};

export function CommentWrapper({ children }: CommentsProps) {
    return <div className={s.container}>{children}</div>;
}
