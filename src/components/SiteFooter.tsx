import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import strailLogo from '../assets/strail-logo.png';

const NAV_LINKS = [
  { label: 'About', href: 'about' },
  { label: 'How it works', href: 'how-it-works' },
  { label: 'Features', href: 'features' },
  { label: 'Journeys', href: 'journeys' },
];

export default function SiteFooter() {
  const location = useLocation();
  const navigate = useNavigate();
  const onLanding = location.pathname === '/';

  // If already on the landing page, jump straight to the section. If
  // not (Privacy, Terms, ...), navigate home first and pass along which
  // section to land on — LandingPage.tsx reads location.state.scrollTo on
  // mount and scrolls there once the sections exist in the DOM.
  const goToSection = (id: string) => {
    if (onLanding) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { scrollTo: id } });
    }
  };

  const goTop = () => {
    if (onLanding) {
      document.getElementById('top')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <footer className="border-t" style={{ backgroundColor: 'var(--color-lp-forest-950)', borderColor: 'rgba(247,241,225,0.1)' }}>
      <div className="mx-auto max-w-6xl px-5 sm:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-10">
          <div>
            <button type="button" onClick={goTop} className="flex items-center gap-2.5 cursor-pointer">
              <span className="grid place-items-center w-9 h-9 rounded-lg p-1.5" style={{ backgroundColor: 'rgba(247,241,225,0.1)' }}>
                <img src={strailLogo} alt="Strail" className="w-full h-full object-contain" />
              </span>
              <span className="font-display font-bold text-lg" style={{ color: 'var(--color-lp-cream-paper)' }}>Strail</span>
            </button>
            <p className="mt-3 font-body text-sm max-w-xs" style={{ color: 'rgba(231,242,227,0.6)' }}>
              Stop overwhelm. Turn big goals into small steps.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-8">
            <div>
              <p className="font-mono text-[11px] tracking-widest uppercase" style={{ color: 'rgba(231,242,227,0.4)' }}>Site</p>
              <ul className="mt-3 space-y-2 font-body text-sm" style={{ color: 'rgba(231,242,227,0.7)' }}>
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <button type="button" onClick={() => goToSection(l.href)} className="hover:opacity-80 transition-opacity cursor-pointer">{l.label}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-widest uppercase" style={{ color: 'rgba(231,242,227,0.4)' }}>Legal</p>
              <ul className="mt-3 space-y-2 font-body text-sm" style={{ color: 'rgba(231,242,227,0.7)' }}>
                <li><Link to="/privacy" className="hover:opacity-80 transition-opacity">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:opacity-80 transition-opacity">Terms &amp; Conditions</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] tracking-widest uppercase" style={{ color: 'rgba(231,242,227,0.4)' }}>Follow</p>
              <ul className="mt-3 space-y-2 font-body text-sm" style={{ color: 'rgba(231,242,227,0.7)' }}>
                <li>
                  <a href="https://www.instagram.com/getstrail/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Instagram className="w-4 h-4" /> Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between" style={{ borderColor: 'rgba(247,241,225,0.1)' }}>
          <p className="font-body text-xs" style={{ color: 'rgba(231,242,227,0.4)' }}>© {new Date().getFullYear()} Strail. Made for the ones juggling too much.</p>
        </div>
      </div>
    </footer>
  );
}
