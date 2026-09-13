import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppData } from '../lib/appContext';

function FullScreenLoader({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-void">
      <div className="w-12 h-12 border-2 border-primary border-dashed rounded-full animate-spin" />
      <h3 className="font-serif font-black text-xl text-ink mt-4">{label}</h3>
    </div>
  );
}

/** Blocks everything until we know whether a session exists at all. */
export function RequireSessionChecked() {
  const { isAuthenticatedChecked } = useAppData();
  if (!isAuthenticatedChecked) return <FullScreenLoader label="Consulting Strail archives..." />;
  return <Outlet />;
}

/** Only for signed-in, non-guest users. Guests get their own separate
 *  read-only routes (/guest, /journeys) — they never reach the full app
 *  shell, matching the original app's behavior. */
export function RequireAuth() {
  const { user } = useAppData();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.isGuest) return <Navigate to="/journeys" replace />;
  return <Outlet />;
}

/** Redirects a signed-in user away from marketing/auth pages they no
 *  longer need (e.g. hitting /login while already authenticated). */
export function RedirectIfAuthenticated() {
  const { user, onboardingFinished, hasCheckedOnboarding } = useAppData();
  if (user && !user.isGuest) {
    if (!hasCheckedOnboarding) return <FullScreenLoader label="Loading your account..." />;
    return <Navigate to={onboardingFinished ? '/app' : '/onboarding'} replace />;
  }
  return <Outlet />;
}

/** Gates the onboarding flow: must be signed in, and must NOT have
 *  finished onboarding already (otherwise bounce to the app). */
export function RequireNeedsOnboarding() {
  const { user, hasCheckedOnboarding, onboardingFinished, isLoadingData } = useAppData();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.isGuest) return <Navigate to="/journeys" replace />;
  if (!hasCheckedOnboarding || isLoadingData) return <FullScreenLoader label="Drafting active trails..." />;
  if (onboardingFinished) return <Navigate to="/app" replace />;
  return <Outlet />;
}

/** Wraps every /app/* route: signed in, non-guest, AND onboarded. Also
 *  routes a signed-in-but-not-onboarded user to /onboarding instead of
 *  silently rendering an empty app shell. */
export function RequireOnboardedApp() {
  const { user, hasCheckedOnboarding, onboardingFinished, isLoadingData } = useAppData();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.isGuest) return <Navigate to="/journeys" replace />;
  if (!hasCheckedOnboarding || isLoadingData) return <FullScreenLoader label="Drafting active trails..." />;
  if (!onboardingFinished) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}
