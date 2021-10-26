import s from './style.module.css';

type Props = {
    children: React.ReactNode;
    author: React.ReactNode;
};

export default function PullQuote({ children, author }: Props) {
    return (
        <figure className={s.container}>
            <blockquote className={s.quote}>{children}</blockquote>
            {author && <figcaption className={s.author}>{author}</figcaption>}
        </figure>
    );
}
