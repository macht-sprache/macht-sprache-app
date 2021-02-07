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
            .then(data => {
                setData(data);
            });
    }, [slugs, lang]);

    return [data as any];
}
