export function getCommentDomId(commentId: string) {
    return `comment-${commentId}`;
}

export function getCommentIdFromHash(hash: string) {
    return hash.match(/^#comment-(.*)$/)?.[1];
}
