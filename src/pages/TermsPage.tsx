import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDocumentMeta } from '../lib/useDocumentMeta';

export default function TermsPage() {
  useDocumentMeta({
    title: 'Terms & Conditions — Strail',
    description: "Strail's terms and conditions.",
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Link to="/" className="flex items-center gap-1.5 text-xs font-sans font-bold text-ink-soft hover:text-ink mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Strail
      </Link>
      <h1 className="font-serif font-black text-3xl text-ink mb-4">Terms &amp; Conditions</h1>
      <div className="text-sm text-ink-soft leading-relaxed space-y-4">
        <p>
          By creating an account or using Strail, you agree to use the service
          responsibly and in accordance with these terms.
        </p>

        <p>
          Strail is a productivity and task-planning tool designed to help you
          break larger tasks into manageable steps. You are responsible for the
          content you create and should not use Strail for unlawful, abusive, or
          harmful purposes.
        </p>

        <p>
          The full, detailed Terms of Use for Strail are currently being finalized.
          If you have questions about these terms, contact us at{' '}
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
