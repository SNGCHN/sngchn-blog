import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { defineConfig, s } from "velite";

// hast 트리에서 우리가 건드리는 최소 필드만 정의(전체 hast 타입/의존성 없이)
interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

// 본문 이미지에 lazy 로딩/비동기 디코딩 속성을 빌드 시점에 주입
function rehypeImageAttrs() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (node.type === "element" && node.tagName === "img") {
        node.properties ??= {};
        if (node.properties.loading == null) node.properties.loading = "lazy";
        if (node.properties.decoding == null)
          node.properties.decoding = "async";
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

// 본문 검색용 평문 추출: 코드/마크다운 기호를 걷어내고 단어만 남긴다.
function toSearchText(raw: string) {
  return raw
    .replace(/^---[\s\S]*?---/, " ") // frontmatter
    .replace(/```[\s\S]*?```/g, " ") // 코드 블록
    .replace(/`[^`]*`/g, " ") // 인라인 코드
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ") // MDX 주석
    .replace(/<!--[\s\S]*?-->/g, " ") // HTML 주석
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // 이미지
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // 링크 → 텍스트만
    .replace(/<\/?[A-Za-z][A-Za-z0-9:-]*(?:\s+[^<>]*?)?\/?>/g, " ") // HTML/MDX 태그
    .replace(/[#>*_~`|-]/g, " ") // 마크다운 기호
    .replace(/\s+/g, " ")
    .trim();
}

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
      rehypeImageAttrs,
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

          const searchText = toSearchText(data.raw);

          const { raw: _raw, ...rest } = data;
          return {
            ...rest,
            slug,
            url: `/posts/${slug}`,
            searchText,
            metadata: { readingTime, wordCount },
          };
        }),
    },
  },
});
