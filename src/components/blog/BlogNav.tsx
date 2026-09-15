import { Link } from 'react-router-dom';
import strailLogo from '../../assets/strail-logo.png';

// Deliberately simpler than the landing page's Header — the blog's job is
// to be read and to get someone back to the app, not to re-sell the
// product with a full nav. Kept visually consistent with the landing page
// (same lp- palette, same logo mark) so it never feels like a separate site.
export default function BlogNav() {
  return (
    <header
      className="border-b sticky top-0 z-40 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(247,241,225,0.9)', borderColor: 'rgba(185,143,75,0.2)' }}
    >
      <nav className="mx-auto max-w-6xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="grid place-items-center w-10 h-10 rounded-lg p-1.5" style={{ backgroundColor: 'var(--color-lp-forest-950)' }}>
            <img src={strailLogo} alt="Strail" className="w-full h-full object-contain" />
          </span>
          <span className="font-display font-bold text-lg tracking-tight" style={{ color: 'var(--color-lp-ink)' }}>
            Strail
          </span>
        </Link>

        <div className="flex items-center gap-5 sm:gap-6 font-body text-sm sm:text-[15px]" style={{ color: 'var(--color-lp-ink-soft)' }}>
          <Link to="/blog" className="hover:opacity-70 transition-opacity">
            Blog
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full px-4 sm:px-5 py-2 sm:py-2.5 font-body font-semibold text-sm text-white hover:-translate-y-0.5 transition-all"
            style={{ backgroundColor: 'var(--color-lp-trail-600)' }}
          >
            Start your trail
          </Link>
        </div>
      </nav>
    </header>
  );
}
