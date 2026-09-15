import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEOHead from './SEOHead';
import BlogNav from './BlogNav';
import BlogFooter from './BlogFooter';
import PostCard from './PostCard';
import { blogPosts } from '../../content/blogPosts';

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen font-body flex flex-col" style={{ backgroundColor: 'var(--color-lp-cream)' }}>
        <SEOHead title="Post not found" description="This post doesn't exist." path="/blog" />
        <BlogNav />
        <main className="flex-1 mx-auto max-w-2xl px-5 py-24 text-center">
          <h1 className="font-display font-extrabold text-2xl" style={{ color: 'var(--color-lp-ink)' }}>
            Post not found
          </h1>
          <p className="mt-2 font-body text-sm" style={{ color: 'var(--color-lp-ink-soft)' }}>
            It may have been moved or renamed.
          </p>
          <Link to="/blog" className="mt-5 inline-block font-body font-semibold underline" style={{ color: 'var(--color-lp-trail-600)' }}>
            Back to the blog
          </Link>
        </main>
        <BlogFooter />
      </div>
    );
  }

  const wordCount = post.paragraphs.join(' ').split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 200));
  const midIndex = Math.ceil(post.paragraphs.length / 2);
  const beforeMid = post.paragraphs.slice(0, midIndex);
  const afterMid = post.paragraphs.slice(midIndex);
  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="min-h-screen font-body" style={{ backgroundColor: 'var(--color-lp-cream)' }}>
      <SEOHead
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        image={post.banner.src}
        type="article"
        article={{ publishedTime: post.date, author: post.author }}
      />
      <BlogNav />

      {/* Banner — same position on every post: full-width, above the title. */}
      <div className="w-full h-[240px] sm:h-[360px] overflow-hidden" style={{ backgroundColor: 'var(--color-lp-trail-100)' }}>
        <img
          src={post.banner.src}
          alt={post.banner.alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = '0';
          }}
        />
      </div>

      <main className="mx-auto max-w-2xl px-5 sm:px-8 py-12 sm:py-16">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 font-body text-sm font-semibold hover:opacity-70 transition-opacity"
          style={{ color: 'var(--color-lp-bark-500)' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All posts
        </Link>

        <h1 className="mt-5 font-display font-extrabold text-3xl sm:text-4xl leading-tight" style={{ color: 'var(--color-lp-ink)' }}>
          {post.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wider" style={{ color: 'var(--color-lp-ink-faint)' }}>
          <span>{post.author}</span>
          <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-lp-ink-faint)', opacity: 0.5 }} />
          <span>{formatDate(post.date)}</span>
          <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--color-lp-ink-faint)', opacity: 0.5 }} />
          <span>{readingMinutes} min read</span>
        </div>

        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] tracking-wider px-2.5 py-1 rounded-full border"
                style={{ borderColor: 'rgba(185,143,75,0.35)', color: 'var(--color-lp-bark-500)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <article className="mt-8 font-body text-[17px] leading-[1.8]" style={{ color: 'var(--color-lp-ink)' }}>
          {beforeMid.map((paragraph, i) => (
            <p key={`before-${i}`} className="mb-5">
              {paragraph}
            </p>
          ))}

          {/* midImage — same position on every post: floated right, partway through the body. */}
          {post.midImage && (
            <img
              src={post.midImage.src}
              alt={post.midImage.alt}
              className="float-none sm:float-right w-full sm:w-64 sm:ml-6 mb-5 rounded-xl"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          )}

          {afterMid.map((paragraph, i) => (
            <p key={`after-${i}`} className="mb-5">
              {paragraph}
            </p>
          ))}

          <div className="clear-both" />

          {post.midImage?.caption && (
            <p className="text-sm italic -mt-1" style={{ color: 'var(--color-lp-ink-faint)' }}>
              {post.midImage.caption}
            </p>
          )}
        </article>
      </main>

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 sm:px-8 pb-20">
          <h2 className="font-display font-bold text-xl mb-6" style={{ color: 'var(--color-lp-ink)' }}>
            Keep reading
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}

      <BlogFooter />
    </div>
  );
}
