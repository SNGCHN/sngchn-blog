'use client';

import * as runtime from 'react/jsx-runtime';

const useMDXComponent = (code: string) => {
    const fn = new Function(code);
    return fn({ ...runtime }).default;
};

interface MDXContentProps {
    code: string;
    className?: string;
}

export function MDXContent({ code, className }: MDXContentProps) {
    const Component = useMDXComponent(code);
    return (
        <div className={className} >
            <Component />
        </div>
    );
}