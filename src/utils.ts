export function extractRootDomain(url: string) {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
}

export function trimString(string?: string, length = 50) {
    if (!string) return '';
    return string.length > length ? string.substring(0, length - 3) + '…' : string;
}

export function stopPropagation(event: React.MouseEvent) {
    event.stopPropagation();
}

export function removeHttpsWwwPageParams(url?: string) {
    if (!url) return '';

    try {
        const parsedUrl = new URL(url);
        return parsedUrl.hostname.replace(/^www\./, '') + parsedUrl.pathname;
    } catch {
        return url;
    }
}
export function isValidUrl(url: string) {
    try {
        return !!new URL(url);
    } catch {
        return false;
    }
}
