import { useEffect, useState } from 'react';
import { langA, langB } from './languages';
import { useLang } from './useLang';

const WP_BASE_URL = 'https://pocolit.com/wp-json/wp/v2/';
const WP_CONTENT_TYPE = 'pages';

type WpResponse = { title: string; body: string };
type StateType = { response?: WpResponse; isLoading: boolean; error?: Error };

export function useWp(slugs: { [langA]: string; [langB]: string }) {
    const [lang] = useLang();
    const [state, setState] = useState<StateType>({ isLoading: false });

    useEffect(() => {
        setState({ isLoading: true });
        fetch(`${WP_BASE_URL}${WP_CONTENT_TYPE}?lang=${lang}&slug=${slugs[lang]}`)
            .then(data => data.json())
            .then(data => {
                if (data.length) {
                    if (!data[0].title.rendered || !data[0].content.rendered) {
                        setState({ isLoading: false, error: new Error('Response not properly formatted') });
                    }

                    setState({
                        response: { title: data[0].title.rendered, body: data[0].content.rendered },
                        isLoading: false,
                    });
                } else {
                    setState({ isLoading: false, error: new Error('WP query did not give results') });
                }
            })
            .catch(error => {
                setState({ isLoading: false, error: error });
            });

        return () => {
            // cancel fetch https://developer.mozilla.org/en-US/docs/Web/API/AbortController
        };
    }, [slugs, lang]);

    return state;
}
