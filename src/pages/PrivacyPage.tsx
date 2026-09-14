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

export default function PrivacyPage() {
  useDocumentMeta({
    title: 'Privacy Policy — Strail',
    description: "Strail's privacy policy — what data we collect, why, and how it's used.",
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
        <h1 className="font-serif font-black text-3xl text-ink mt-1">Privacy Policy</h1>
        <p className="text-xs text-ink-soft mt-2">Last updated: September 14, 2026</p>

        <div className="mt-6 bg-surface border border-line rounded-2xl shadow-cozy p-6 sm:p-8">
          <p className="text-sm text-ink-soft leading-relaxed">
            This policy explains what information Strail collects, why, and how it's used. Strail is a task
            breakdown tool built for students — we try to collect no more than what's needed to make that work.
          </p>

          <Section title="Information we collect">
            <p>
              <strong className="text-ink">Account information.</strong> If you create an account, we collect your
              email address and the name you give us. Authentication is handled by Supabase; we don't see or store
              your raw password ourselves.
            </p>

            <p>
              <strong className="text-ink">What you enter into Strail.</strong> We collect the information you
              choose to enter into Strail, including your goals, tasks, subjects, due dates, protected activities
              (like practice or rehearsal times), and trail steps generated from them. This is the core data Strail
              needs to function.
            </p>

            <p>
              <strong className="text-ink">Guest mode.</strong> Browsing as a guest creates a temporary, anonymous
              session with no email or password attached. Nothing you do in the guest sandbox (including completing
              steps or trying "Break Down Further") is saved to a Strail account or permanently stored by Strail;
              it exists only in your browser for that session.
            </p>

            <p>
              <strong className="text-ink">Usage analytics.</strong> We use Google Analytics (GA4) to understand
              how Strail is used, such as which pages are visited and general usage patterns. For signed-in users,
              we may associate analytics data with a pseudonymous account identifier so we can understand usage
              over time. Guest users are not associated with a Strail account identifier.
            </p>

            <p>
              <strong className="text-ink">Local storage.</strong> Strail stores a small number of preferences
              directly in your browser (not as cookies), including whether sound effects are enabled and whether
              you've already seen the onboarding flow. These preferences remain on your device and are not sent to
              Strail's servers.
            </p>
          </Section>

          <Section title="How we use your information">
            <p>
              We use your information to operate the core product, including saving your trails, tracking your
              progress and streaks, and generating new trail steps.
            </p>

            <p>
              When you request an AI-generated breakdown, Strail sends the information necessary to generate it —
              such as the goal, task titles, subjects, and related context you provide — to Google's Gemini API.
              We limit AI-generation requests to 10 per account per day.
            </p>

            <p>
              We also use aggregated and non-identifying usage data to understand which parts of Strail are useful
              and to improve the service.
            </p>
          </Section>

          <Section title="Public Journeys">
            <p>
              Publishing a trail as a "Public Journey" is opt-in and happens only when you explicitly turn it on
              for a specific trail. Once public, that trail's title, steps, and the display name you choose become
              visible to anyone who visits Strail, including people who aren't signed in.
            </p>

            <p>
              Other users can "fork" a Public Journey, which copies its steps into their own account. You can make
              a trail private again at any time, which removes the original from the public gallery going forward.
              However, copies that other users have already forked into their own accounts may remain available to
              those users.
            </p>

            <p>
              Do not include passwords, contact information, sensitive personal information, or other information
              you do not want publicly visible in a Public Journey.
            </p>
          </Section>

          <Section title="Third parties we rely on">
            <p>
              <strong className="text-ink">Supabase</strong> — authentication and database hosting for your
              account and trail data.
            </p>

            <p>
              <strong className="text-ink">Google Gemini API</strong> — generates trail steps from the goals,
              tasks, and related information you provide.
            </p>

            <p>
              <strong className="text-ink">Google Analytics</strong> — usage analytics, as described above.
            </p>

            <p>
              We do not sell your personal information. We may disclose information to service providers that
              process information on our behalf when necessary to operate, secure, maintain, and improve Strail.
            </p>
          </Section>

          <Section title="Data retention & deletion">
            <p>
              Your account data stays in your account until you delete it or request that we delete it. To request
              deletion of your account and the personal information associated with it, contact us at
              getstrail@gmail.com.
            </p>

            <p>
              Deleting an individual trail or task from within the app removes it from your account. Public
              Journeys that you unpublish are removed from the public gallery, although copies already forked by
              other users may remain in their accounts.
            </p>
          </Section>

          <Section title="Children's privacy">
            <p>
              Strail is intended for users who are at least 13 years old. We do not knowingly allow children under
              13 to create accounts or provide personal information through Strail.
            </p>

            <p>
              If we learn that we have collected personal information from a child under 13, we will take reasonable
              steps to delete that information. If you believe a child under 13 has provided us with personal
              information, please contact us at getstrail@gmail.com.
            </p>
          </Section>

          <Section title="Security">
            <p>
              We use security measures provided by our service providers, including encrypted connections and
              database access controls such as Supabase Row Level Security, to help protect your information.
              However, no system is perfectly secure, and we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              If this policy changes in a meaningful way, we'll update the date at the top of this page. Your
              continued use of Strail after changes take effect means the updated policy applies to your use of the
              service.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about this policy or your data? Reach us at{' '}
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