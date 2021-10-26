import { MDXProvider } from '@mdx-js/react';
import React from 'react';
import mdxComponents from './mdxComponents';

export default function MdxWrapper({ children }: { children: React.ReactNode }) {
    return <MDXProvider components={mdxComponents}>{children}</MDXProvider>;
}
