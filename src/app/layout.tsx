import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { posts } from "#site/content";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import type { SearchPost } from "@/components/search-dialog";

import "./globals.css";

// Geist Mono - 코드 블록용
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "sngchn.blog",
    template: "%s | sngchn.blog",
  },
  description: "배운 것과 트러블슈팅을 기록합니다",
};

const searchPosts: SearchPost[] = posts.map((post) => {
  const series = (post as { series?: SearchPost["series"] }).series;

  return {
    title: post.title,
    description: post.description ?? "",
    date: post.date,
    tags: post.tags,
    slug: post.slug,
    series,
  };
});

const themeScript = `
(() => {
  try {
    const theme = localStorage.getItem("theme");
    if (theme === "light" || theme === "dark") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  } catch {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={geistMono.variable}>
        <div className="min-h-screen flex flex-col">
          <Header searchPosts={searchPosts} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
