import React from 'react';

const emptyChildren: React.ReactNode[] = [true, false, undefined, null, ''];

const DividedList: React.FC<{ divider?: React.ReactNode; lastDivider?: React.ReactNode }> = ({
    children,
    divider = ' | ',
    lastDivider = divider,
}) => {
    const list: React.ReactNode[] = React.Children.toArray(children)
        .filter(child => !emptyChildren.includes(child))
        .flatMap((child, index, array) => {
            const penultimateIndex = array.length - 2;
            return [child, index === penultimateIndex ? lastDivider : index < penultimateIndex ? divider : undefined];
        });

    return <>{list}</>;
};

export default DividedList;
