import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDocumentMeta } from '../lib/useDocumentMeta';

// Placeholder content — swap in your real policy text. Having this as a
// real, indexable route (rather than a '#' link) matters for App Store /
// OAuth consent screen requirements as much as SEO.
export default function PrivacyPage() {
  useDocumentMeta({
    title: 'Privacy Policy — Strail',
    description: "Strail's privacy policy.",
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link to="/" className="flex items-center gap-1.5 text-xs font-sans font-bold text-ink-soft hover:text-ink mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Strail
      </Link>
      <h1 className="font-serif font-black text-3xl text-ink mb-4">Privacy Policy</h1>
      <div className="text-sm text-ink-soft leading-relaxed space-y-4">
      <p>
        We collect and use information needed to provide Strail, including information associated with your account and the journeys, tasks, and other content you create. We may also collect basic usage information to understand how Strail is used and improve the service.
      </p>

      <p>
        We do not sell your personal information. The full, detailed Privacy Policy for Strail is currently being finalized. 
      </p>

      <p>
         In the meantime, if you have questions about your data or privacy, you can contact us at {' '}
        <a
          href="mailto:getstrail@gmail.com"
          className="text-ink hover:text-ink-soft underline"
        >
          getstrail@gmail.com
        </a>
        .
      </p>

      <p className="text-xs text-ink-soft pt-2">
        Last updated: September 14, 2026
      </p>
    </div>
    </div>
  );
}
