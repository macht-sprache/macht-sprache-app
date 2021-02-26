import { useState } from 'react';

let count = 0;

export function useDomId() {
    const [id] = useState(() => {
        const idCount = count++;
        return (identifier: string) => `${identifier}-id${idCount}`;
    });
    return id;
}
