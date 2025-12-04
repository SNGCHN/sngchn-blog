import { defineConfig, s } from 'velite';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';

export default defineConfig({
    root: 'content',
    output: {
        data: '.velite',
        assets: 'public/static',
        base: '/static/',
    },
    mdx: {
        rehypePlugins: [
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: 'wrap' }],
            [
                rehypePrettyCode,
                {
                    theme: 'github-dark',
                },
            ],
        ],
    },
    collections: {
        posts: {
            name: 'Post',
            pattern: 'posts/**/*.mdx',
            schema: s
                .object({
                    title: s.string().max(99),
                    slug: s.path(),
                    date: s.isodate(),
                    description: s.string().optional(),
                    code: s.mdx(),
                    toc: s.toc(),
                    metadata: s.metadata(),
                })
                .transform((data) => {
                    const slug = data.slug.split('/').pop();
                    return {
                        ...data,
                        slug,
                        url: `/posts/${slug}`,
                    };
                }),
        },
    },
});