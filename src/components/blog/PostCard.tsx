import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BlogPost } from '../../content/blogPosts';

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl border overflow-hidden hover:-translate-y-0.5 transition-transform"
      style={{ borderColor: 'rgba(168,130,90,0.25)', backgroundColor: 'var(--color-lp-cream-paper)' }}
    >
      <div className="aspect-[16/9] w-full overflow-hidden" style={{ backgroundColor: 'var(--color-lp-trail-100)' }}>
        <img
          src={post.banner.src}
          alt={post.banner.alt}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--color-lp-bark-500)' }}>
          {formatDate(post.date)}
        </span>
        <h3 className="mt-2 font-display font-bold text-lg leading-snug" style={{ color: 'var(--color-lp-ink)' }}>
          {post.title}
        </h3>
        <p className="mt-2 font-body text-sm leading-relaxed flex-1" style={{ color: 'var(--color-lp-ink-soft)' }}>
          {post.excerpt}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 font-body font-semibold text-sm" style={{ color: 'var(--color-lp-trail-600)' }}>
          Read more <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
