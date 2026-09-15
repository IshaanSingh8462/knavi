import SEOHead from './SEOHead';
import BlogNav from './BlogNav';
import BlogFooter from './BlogFooter';
import PostCard from './PostCard';
import { blogPosts } from '../../content/blogPosts';

export default function BlogListPage() {
  const sorted = [...blogPosts].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="min-h-screen font-body" style={{ backgroundColor: 'var(--color-lp-cream)' }}>
      <SEOHead
        title="Blog"
        description="Notes on task paralysis, breaking down big goals, and why we built Strail — for students juggling too much."
        path="/blog"
      />
      <BlogNav />

      <main className="mx-auto max-w-6xl px-5 sm:px-8 py-16 sm:py-20">
        <span className="font-mono text-[11px] tracking-widest uppercase" style={{ color: 'var(--color-lp-bark-500)' }}>
          From Strail
        </span>
        <h1 className="mt-4 font-display font-extrabold text-3xl sm:text-4xl leading-tight" style={{ color: 'var(--color-lp-ink)' }}>
          Ideas on getting unstuck.
        </h1>
        <p className="mt-4 max-w-xl font-body leading-relaxed" style={{ color: 'var(--color-lp-ink-soft)' }}>
          Notes on task paralysis, breaking big goals into small ones, and how Strail came to be.
        </p>

        {sorted.length === 0 ? (
          <p className="mt-16 font-body text-sm" style={{ color: 'var(--color-lp-ink-soft)' }}>
            Nothing posted yet — check back soon.
          </p>
        ) : (
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </main>

      <BlogFooter />
    </div>
  );
}
