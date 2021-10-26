import React from 'react';

const emptyChildren: React.ReactNode[] = [true, false, undefined, null, ''];

const DividedList: React.FC<{ divider?: React.ReactNode }> = ({ children, divider = ' | ' }) => {
    const list: React.ReactNode[] = React.Children.toArray(children).flatMap((child, index, array) => [
        child,
        !emptyChildren.includes(child) && index < array.length - 1 && divider,
    ]);

    return <>{list}</>;
};

export default DividedList;
