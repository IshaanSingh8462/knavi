import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

import { AppDataProvider, useAppData } from './lib/appContext';
import { usePageTracking } from './lib/analytics';
import { sound } from './lib/sound';

import { RequireSessionChecked, RedirectIfAuthenticated, RequireNeedsOnboarding, RequireOnboardedApp } from './routes/guards';

import LandingPageRoute from './pages/LandingPageRoute';
import AuthPage from './pages/AuthPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import GuestPage from './pages/GuestPage';
import OnboardingPage from './pages/OnboardingPage';
import AppLayout from './pages/AppLayout';
import JourneyPage from './pages/JourneyPage';
import DashboardPage from './pages/DashboardPage';
import SetupPage from './pages/SetupPage';
import PublicJourneysGalleryPage from './pages/PublicJourneysGalleryPage';
import PublicJourneyDetailPage from './pages/PublicJourneyDetailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import NotFoundPage from './pages/NotFoundPage';

// Delegated, document-level click sound for every ordinary <button> in the
// app. Buttons that already play a more specific sound in their own
// handler opt out with data-sound="none". Unchanged from before — still
// installed once near the root, now inside the routed tree.
function useGlobalClickSound() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const btn = target.closest('button');
      if (!btn || btn.hasAttribute('disabled')) return;
      if (btn.getAttribute('data-sound') === 'none') return;
      sound.click();
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, []);
}

function NotConfiguredScreen() {
  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-surface border border-line p-8 rounded-2xl shadow-cozy text-left">
        <AlertCircle className="w-8 h-8 text-rose mb-3" />
        <h1 className="font-serif font-black text-2xl text-ink">Supabase isn't configured yet</h1>
        <p className="text-sm text-ink-soft mt-2 leading-relaxed">
          Add <code className="text-primary-soft">VITE_SUPABASE_URL</code> and{' '}
          <code className="text-primary-soft">VITE_SUPABASE_ANON_KEY</code> to a <code>.env.local</code> file in the
          project root, then restart the dev server. See <code>.env.example</code> and <code>supabase/schema.sql</code>{' '}
          for setup steps.
        </p>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isSupabaseConfigured } = useAppData();
  usePageTracking();
  useGlobalClickSound();

  if (!isSupabaseConfigured) return <NotConfiguredScreen />;

  return (
    <Routes>
      <Route element={<RequireSessionChecked />}>
        {/* Public / marketing */}
        <Route element={<RedirectIfAuthenticated />}>
          <Route path="/" element={<LandingPageRoute />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
        </Route>

        <Route path="/guest" element={<GuestPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* Public Journeys gallery + shareable per-journey URLs — open to
            anonymous visitors, guests, and signed-in users alike. */}
        <Route path="/journeys" element={<PublicJourneysGalleryPage />} />
        <Route path="/journeys/:taskId" element={<PublicJourneyDetailPage />} />

        {/* Onboarding: signed in, not yet onboarded */}
        <Route element={<RequireNeedsOnboarding />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>

        {/* Main app shell: signed in + onboarded (non-guest) */}
        <Route element={<RequireOnboardedApp />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<JourneyPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="setup" element={<SetupPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AppDataProvider>
      <AppRoutes />
    </AppDataProvider>
  );
}
