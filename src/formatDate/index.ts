type formatDateProps = {
    date: Date;
};

export function formatDate({ date }: formatDateProps) {
    // TODO: use internationalisation depending on language set
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}
