import Header from '../../components/Header';
import { useWpPage } from '../../hooks/wp';
import { SingleColumn } from '../../components/Layout/Columns';
import PageTitle from '../../components/PageTitle';
import { WpStyle } from '../../components/WpStyle';
import s from './style.module.css';

type StaticContentPageProps = {
    slugs: { en: string; de: string };
};

export function StaticContentPage({ slugs }: StaticContentPageProps) {
    const getPost = useWpPage(slugs);
    const post = getPost();

    return (
        <>
            <PageTitle title={post.title} />
            <Header>
                <div className={s.title}>{post.title}</div>
            </Header>
            <SingleColumn>
                <WpStyle body={post.body} />
            </SingleColumn>
        </>
    );
}
