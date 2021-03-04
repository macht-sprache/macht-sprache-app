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
