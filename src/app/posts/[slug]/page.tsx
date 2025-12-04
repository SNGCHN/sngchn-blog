import { notFound } from 'next/navigation';
import { posts } from '#site/content';
import { MDXContent } from '@/shared/ui/mdx-content';
import type { Metadata } from 'next';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = posts.find((p) => p.slug === slug);

    if (!post) return {};

    return {
        title: post.title,
        description: post.description,
    };
}

export default async function PostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = posts.find((p) => p.slug === slug);

    if (!post) return notFound();

    return (
        <main className="mx-auto max-w-3xl px-4 py-8">
            <article>
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-2">
                    {post.title}
                </h1>
                {post.description && (
                    <p className="text-xl text-zinc-600 dark:text-zinc-400">
                        {post.description}
                    </p>
                )}
                <div className="flex gap-2 text-sm text-zinc-500 mt-2 mb-8">
                    <time>{new Date(post.date).toLocaleDateString()}</time>
                    <span>·</span>
                    <span>{post.metadata.readingTime} min read</span>
                </div>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <MDXContent code={post.code} />
                </div>
            </article>
        </main>
    );
}