import { useEffect, useState } from 'react';
import { langA, langB } from './languages';
import { useLang } from './useLang';

const WP_BASE_URL = 'https://pocolit.com/wp-json/wp/v2/';
const WP_CONTENT_TYPE = 'pages';

export function useWp(slugs: { [langA]: string; [langB]: string }) {
    const [lang] = useLang();
    const [data, setData] = useState();

    useEffect(() => {
        fetch(`${WP_BASE_URL}${WP_CONTENT_TYPE}?lang=${lang}&slug=${slugs[lang]}`)
            .then(response => response.json())
            .then(response => {
                if (response.length) {
                    setData(response[0]);
                } else {
                    // there will be an empty array if the query works but does not match anything,
                    // e.g. if the slug is wrong. Should show an error somehow.
                }
            })
            .catch(error => {
                // TODO display error
                console.log('error loading from WP: ', error);
            });
    }, [slugs, lang]);

    return [data as any];
}
