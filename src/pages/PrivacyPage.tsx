import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Placeholder content — swap in your real policy text. Having this as a
// real, indexable route (rather than a '#' link) matters for App Store /
// OAuth consent screen requirements as much as SEO.
export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link to="/" className="flex items-center gap-1.5 text-xs font-sans font-bold text-ink-soft hover:text-ink mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Strail
      </Link>
      <h1 className="font-serif font-black text-3xl text-ink mb-4">Privacy Policy</h1>
      <p className="text-sm text-ink-soft leading-relaxed">
        Placeholder — replace with Strail's actual privacy policy. This page exists as a real route so it can be
        linked from the footer, app store listings, and OAuth consent screens instead of a dead '#' anchor.
      </p>
    </div>
  );
}
