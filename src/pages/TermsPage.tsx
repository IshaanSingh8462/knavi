import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link to="/" className="flex items-center gap-1.5 text-xs font-sans font-bold text-ink-soft hover:text-ink mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Strail
      </Link>
      <h1 className="font-serif font-black text-3xl text-ink mb-4">Terms &amp; Conditions</h1>
      <p className="text-sm text-ink-soft leading-relaxed">
        Placeholder — replace with Strail's actual terms of service.
      </p>
    </div>
  );
}
