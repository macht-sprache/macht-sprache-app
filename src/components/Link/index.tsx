import React from 'react';
import { __RouterContext as RouterContext } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export default function Link(props: React.ComponentPropsWithoutRef<RouterLink>) {
    const href = (process.env.REACT_APP_MAIN_ORIGIN || '') + props.to;
    return (
        <RouterContext.Consumer>
            {context =>
                context ? (
                    <RouterLink {...props} />
                ) : (
                    // eslint-disable-next-line jsx-a11y/anchor-has-content
                    <a {...props} href={href} target="_blank" rel="noreferrer" />
                )
            }
        </RouterContext.Consumer>
    );
}
