import { useEffect, useState } from 'react';
import { langA, langB } from './languages';
import { useLang } from './useLang';

const WP_BASE_URL = 'https://pocolit.com/wp-json/wp/v2/';

type WpMedia = { width: number; height: number; sizes: [{ width: number; height: number; source_url: string }] };

type WpResponse = {
    title: string;
    body: string;
    date: Date;
    excerpt: string;
    link: string;
    featuredMedia?: WpMedia | undefined;
};

type StateType = { response?: WpResponse; isLoading: boolean; url: string; error?: Error };

export function useWpPage(slugs: { [langA]: string; [langB]: string }): StateType {
    const [lang] = useLang();
    const url = `${WP_BASE_URL}pages?lang=${lang}&slug=${slugs[lang]}`;
    const [state, setState] = useState<StateType>({ isLoading: false, url });

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        setState({ isLoading: true, url });

        fetch(url, { signal })
            .then(data => data.json())
            .then(data => {
                if (data.length) {
                    if (!data[0].title.rendered || !data[0].content.rendered) {
                        setState({ isLoading: false, url, error: new Error('Response not properly formatted') });
                    }

                    setState({
                        response: transformWpPost(data[0]),
                        isLoading: false,
                        url,
                    });
                } else {
                    setState({ isLoading: false, url, error: new Error('WP query did not give results') });
                }
            })
            .catch(error => {
                if (error.name !== 'AbortError') {
                    setState({ isLoading: false, url, error: error });
                }
            });

        return () => {
            controller.abort();
        };
    }, [url]);

    return url === state.url ? state : { isLoading: false, url };
}

type PostsStateType = { response?: [WpResponse]; isLoading: boolean; error?: Error };

export function useWpPosts(tags: { [langA]: string; [langB]: string }) {
    const [lang] = useLang();
    const [state, setState] = useState<PostsStateType>({ isLoading: false });

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        setState({ isLoading: true });

        fetch(`${WP_BASE_URL}posts?lang=${lang}&tags=${tags[lang]}&_embed`, { signal })
            .then(data => data.json())
            .then(data => {
                if (data.length) {
                    const formattedResponse = data.map(transformWpPost);

                    setState({
                        response: formattedResponse,
                        isLoading: false,
                    });
                } else {
                    setState({ isLoading: false, error: new Error('WP query did not give results') });
                }
            })
            .catch(error => {
                if (error.name !== 'AbortError') {
                    setState({ isLoading: false, error: error });
                }
            });

        return () => {
            controller.abort();
        };
    }, [lang, tags]);

    return state;
}

function transformWpPost(post: {
    title: { rendered: string };
    content: { rendered: string };
    excerpt: { rendered: string };
    date: string;
    link: string;
    _embedded?: any;
}) {
    const featuredMedia = post?._embedded?.['wp:featuredmedia']?.[0]?.media_details;

    if (featuredMedia) {
        featuredMedia.sizes = Object.values(featuredMedia.sizes);
    }

    return {
        title: post.title.rendered,
        body: post.content.rendered,
        date: new Date(post.date),
        link: post.link,
        excerpt: post.excerpt.rendered,
        featuredMedia: featuredMedia,
    };
}

interface WpImageProps extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
    image: WpMedia;
}

export function WpImage({ image, ...props }: WpImageProps) {
    const srcSet = image.sizes.map(size => `${size.source_url} ${size.width}w`).join(', ');

    return <img width={image.width} height={image.height} alt="" srcSet={srcSet} {...props} />;
}
