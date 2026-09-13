import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAppData } from '../lib/appContext';

// Set this as your Supabase project's "Site URL" / email-template redirect
// target (Authentication -> URL Configuration) so confirmation and
// magic-link emails land here: https://getstrail.me/auth/callback
//
// The Supabase client already has detectSessionInUrl: true (see
// src/lib/supabase/client.ts), so by the time this component's effect
// below fires, the `?code=...` in the URL should already have been
// exchanged for a real session. This page's only job is to wait for that
// and then route the person somewhere sensible.
export default function AuthCallbackPage() {
  const { user, isAuthenticatedChecked, hasCheckedOnboarding, onboardingFinished } = useAppData();
  const [timedOut, setTimedOut] = useState(false);
  const [searchParams] = useSearchParams();
  const isRecovery = searchParams.get('type') === 'recovery';

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 6000);
    return () => clearTimeout(t);
  }, []);

  if (!isAuthenticatedChecked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-void">
        <div className="w-12 h-12 border-2 border-primary border-dashed rounded-full animate-spin" />
        <h3 className="font-serif font-black text-xl text-ink mt-4">Confirming your account...</h3>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={timedOut ? '/login' : '/'} replace />;
  }

  // A password-recovery link creates a real (temporary) session just like
  // signing in — route it to /reset-password instead of into the app.
  if (isRecovery) return <Navigate to="/reset-password" replace />;

  if (user.isGuest) return <Navigate to="/journeys" replace />;
  if (!hasCheckedOnboarding) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-void">
        <div className="w-12 h-12 border-2 border-primary border-dashed rounded-full animate-spin" />
      </div>
    );
  }

  return <Navigate to={onboardingFinished ? '/app' : '/onboarding'} replace />;
}
