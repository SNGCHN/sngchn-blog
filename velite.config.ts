import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { defineConfig, s } from "velite";

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
  },
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      [
        rehypePrettyCode,
        {
          theme: {
            light: "github-light",
            dark: "github-dark",
          },
          keepBackground: false,
        },
      ],
    ],
  },
  collections: {
    posts: {
      name: "Post",
      pattern: "posts/**/*.mdx",
      schema: s
        .object({
          title: s.string().max(99),
          slug: s.path(),
          date: s.isodate(),
          description: s.string().optional(),
          tags: s.array(s.string()).default([]),
          series: s
            .object({
              name: s.string(),
              slug: s.string(),
              order: s.number(),
            })
            .optional(),
          code: s.mdx(),
          toc: s.toc(),
          raw: s.raw(),
          metadata: s.metadata(),
        })
        .transform((data) => {
          const slug = data.slug.split("/").pop() ?? data.slug;

          const cjkRegex = /[가-힣ᄀ-ᇿ㄰-㆏一-鿿぀-ヿ]/g;
          const cjkChars = (data.raw.match(cjkRegex) ?? []).length;
          const latinWords = (data.raw.match(/[a-zA-Z]+(?:'[a-zA-Z]+)*/g) ?? [])
            .length;
          const wordCount = Math.round(latinWords + cjkChars * 0.56);
          const readingTime = Math.max(1, Math.round(wordCount / 265));

          const { raw: _raw, ...rest } = data;
          return {
            ...rest,
            slug,
            url: `/posts/${slug}`,
            metadata: { readingTime, wordCount },
          };
        }),
    },
  },
});
