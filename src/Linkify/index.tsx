import LinkifyIt from 'linkify-it';

const linkify = new LinkifyIt();

type Props = {
    children: string;
};

export default function Linkify({ children }: Props) {
    const parts = (linkify.match(children) || []).reduce<React.ReactNode[]>((acc, cur, index, array) => {
        const prevIndex = array[index - 1]?.lastIndex || 0;
        acc.push(
            children.substring(prevIndex, cur.index),
            <a key={index} href={cur.url} rel="noopener noreferrer">
                {cur.text}
            </a>
        );

        if (index === array.length - 1) {
            acc.push(children.substring(cur.lastIndex));
        }

        return acc;
    }, []);
    return <>{parts.length ? parts : children}</>;
}
