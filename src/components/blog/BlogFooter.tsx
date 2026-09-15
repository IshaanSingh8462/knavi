import { Link } from 'react-router-dom';
import strailLogo from '../../assets/strail-logo.png';

export default function BlogFooter() {
  return (
    <footer className="border-t" style={{ backgroundColor: 'var(--color-lp-forest-950)', borderColor: 'rgba(247,241,225,0.1)' }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid place-items-center w-9 h-9 rounded-lg p-1.5" style={{ backgroundColor: 'rgba(247,241,225,0.1)' }}>
            <img src={strailLogo} alt="Strail" className="w-full h-full object-contain" />
          </span>
          <span className="font-display font-bold text-lg" style={{ color: 'var(--color-lp-cream-paper)' }}>
            Strail
          </span>
        </Link>

        <div className="flex items-center gap-6 font-body text-sm" style={{ color: 'rgba(231,242,227,0.7)' }}>
          <Link to="/" className="hover:opacity-80 transition-opacity">
            Home
          </Link>
          <Link to="/blog" className="hover:opacity-80 transition-opacity">
            Blog
          </Link>
        </div>
      </div>
    </footer>
  );
}
