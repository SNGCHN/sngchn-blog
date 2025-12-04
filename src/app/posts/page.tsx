import Link from 'next/link';
import { posts } from '#site/content';

export default function PostsPage() {
    const sortedPosts = posts.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <div className="container mx-auto max-w-4xl py-6 lg:py-10 px-4">
            <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
                <div className="flex-1 space-y-4">
                    <h1 className="inline-block font-black text-4xl lg:text-5xl">SNGCHN BLOG</h1>
                    <p className="text-xl text-zinc-600 dark:text-zinc-400">개발 블로그</p>
                </div>
            </div>
            <hr className="my-8 border-zinc-200 dark:border-zinc-800" />
            <div className="grid gap-10 sm:grid-cols-2">
                {sortedPosts.map((post) => (
                    <article
                        key={post.slug}
                        className="group relative flex flex-col space-y-2"
                    >
                        <h2 className="text-2xl font-extrabold">{post.title}</h2>
                        {post.description && (
                            <p className="text-zinc-600 dark:text-zinc-400">
                                {post.description}
                            </p>
                        )}
                        {post.date && (
                            <p className="text-sm text-zinc-500 dark:text-zinc-500">
                                {new Date(post.date).toLocaleDateString()}
                            </p>
                        )}
                        <Link href={post.url} className="absolute inset-0">
                            <span className="sr-only">View Article</span>
                        </Link>
                    </article>
                ))}
            </div>
        </div>
    );
}