import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import SiteFooter from '../components/SiteFooter';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-serif font-bold text-lg text-ink mb-2">{title}</h2>
      <div className="text-sm text-ink-soft leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  useDocumentMeta({
    title: 'Terms & Conditions — Strail',
    description: "Strail's terms and conditions of use.",
  });

  return (
    <div className="min-h-screen bg-void flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto px-4 py-12 w-full">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs font-sans font-bold text-ink-soft hover:text-ink mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Strail
        </Link>

        <span className="text-xs font-mono uppercase tracking-widest text-primary-soft">
          Legal
        </span>
        <h1 className="font-serif font-black text-3xl text-ink mt-1">
          Terms &amp; Conditions
        </h1>
        <p className="text-xs text-ink-soft mt-2">Last updated: September 14, 2026</p>

        <div className="mt-6 bg-surface border border-line rounded-2xl shadow-cozy p-6 sm:p-8">
          <p className="text-sm text-ink-soft leading-relaxed">
            These terms cover your use of Strail. By using Strail, you agree to them.
          </p>

          <Section title="What Strail is">
            <p>
              Strail is a free task breakdown tool that turns your goals, assignments, and commitments into small,
              manageable steps, using AI to help generate that breakdown. It's built for students, but anyone who
              meets the eligibility requirements below can use it.
            </p>
          </Section>

          <Section title="Eligibility">
            <p>
              You must be at least 13 years old to create an account or use Strail. By using Strail, you represent
              that you meet this age requirement.
            </p>
          </Section>

          <Section title="Your account">
            <p>
              You are responsible for keeping your account credentials secure and for activity occurring through
              your account. Give us accurate information when you sign up. If you believe your account has been
              compromised, contact us promptly.
            </p>
            <p>
              Browsing as a guest doesn't require an account and doesn't save your activity permanently.
            </p>
          </Section>

          <Section title="Your content">
            <p>
              You retain ownership of the content you submit to Strail. You give Strail the limited rights
              necessary to store, process, display, and provide that content as part of the service.
            </p>
            <p>
              This includes processing information you provide to generate AI-powered trail steps and displaying
              your content within your account.
            </p>
          </Section>

          <Section title="Public Journeys">
            <p>
              If you choose to publish a trail as a Public Journey, you grant Strail the right to display and
              distribute that journey through Strail's public features. Its title, steps, and the display name you
              choose may be visible to anyone who visits Strail, including people who aren't signed in.
            </p>
            <p>
              Other Strail users may view and "fork" a Public Journey, which copies its steps into their own
              account. You can unpublish a journey at any time, which removes the original from the public gallery.
              Copies that other users have already forked into their own accounts may remain available to those
              users.
            </p>
            <p>
              You are responsible for making sure you have the right to publish any content you include in a Public
              Journey.
            </p>
          </Section>

          <Section title="Acceptable use">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use Strail for anything illegal or to harm others</li>
              <li>
                Try to bypass the AI generation rate limit (currently 10 requests per account per day), interfere
                with the service, or otherwise abuse Strail
              </li>
              <li>Scrape, copy, reproduce, or resell Strail's content or functionality</li>
              <li>Attempt to gain unauthorized access to Strail or another user's account or data</li>
              <li>Impersonate someone else or publish a Public Journey under a false identity</li>
              <li>Upload or publish content that you do not have the right to use</li>
            </ul>
          </Section>

          <Section title="AI-generated content">
            <p>
              Trail steps, schedules, and breakdowns are generated using AI (Google's Gemini models) based on what
              you enter. AI output can be wrong, incomplete, outdated, or not quite what you meant — treat it as a
              starting point, not an authority.
            </p>
            <p>
              You are responsible for reviewing and using AI-generated content with your own judgment, especially
              for anything graded, time-sensitive, or otherwise important.
            </p>
          </Section>

          <Section title="Strail's intellectual property">
            <p>
              Strail, including its software, branding, design, logos, and original content, is owned by Strail or
              its licensors and is protected by applicable intellectual-property laws. These Terms do not give you
              ownership of Strail itself or its underlying technology.
            </p>
          </Section>

          <Section title="Service availability">
            <p>
              Strail is provided as a free service and may change, be temporarily unavailable, or be discontinued
              at any time. We may add, modify, or remove features as Strail evolves.
            </p>
          </Section>

          <Section title="No warranty">
            <p>
              Strail is provided "as is," without warranties of any kind, to the extent permitted by law. We don't
              guarantee that Strail will be uninterrupted, error-free, secure, or available at all times, or that
              AI-generated breakdowns will be accurate or suitable for your specific situation.
            </p>
          </Section>

          <Section title="Limitation of liability">
            <p>
              To the extent allowed by law, Strail and its creator aren't liable for indirect, incidental,
              consequential, special, or exemplary damages arising from your use of the service, including missed
              deadlines, academic outcomes, or data loss.
            </p>
            <p>
              Nothing in these Terms limits liability that cannot legally be limited or excluded under applicable
              law.
            </p>
          </Section>

          <Section title="Termination">
            <p>
              You may stop using Strail at any time. We may suspend or terminate an account that violates these
              Terms, abuses the service, or creates security or legal risks. We may also remove content that
              violates these Terms or applicable law.
            </p>
            <p>
              You can request deletion of your account at any time by contacting us at{' '}
              <a
                href="mailto:getstrail@gmail.com"
                className="text-primary-soft hover:text-primary underline"
              >
                getstrail@gmail.com
              </a>
              .
            </p>
            <p>
              Provisions that by their nature should continue after termination, including intellectual property,
              disclaimers, limitations of liability, and other applicable provisions, will remain in effect.
            </p>
          </Section>

          <Section title="Changes to these terms">
            <p>
              If these Terms change in a meaningful way, we'll update the date at the top of this page. Your
              continued use of Strail after the updated Terms take effect means the updated Terms apply to your use
              of the service.
            </p>
          </Section>

          <Section title="Governing law">
            <p>
              These Terms are governed by the laws of the State of Georgia, United States, without regard to
              conflict-of-law principles.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about these terms? Reach us at{' '}
              <a
                href="mailto:getstrail@gmail.com"
                className="text-primary-soft hover:text-primary underline"
              >
                getstrail@gmail.com
              </a>
              .
            </p>
          </Section>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}