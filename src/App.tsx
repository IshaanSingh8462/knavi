import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, LogOut, Compass, AlertCircle, Smile, Globe2, Leaf, Mail, Lock, UserRound, ArrowLeft, KeyRound } from 'lucide-react';
import OnboardingFlow from './components/OnboardingFlow';
import WeeklySetup from './components/WeeklySetup';
import JourneyView from './components/JourneyView';
import Dashboard from './components/Dashboard';
import PublicJourneys from './components/PublicJourneys';
import BrandHero from './components/BrandHero';
import LandingPage from './components/LandingPage';
import BackgroundScene from './components/BackgroundScene';
import SoundToggle from './components/SoundToggle';
import ChangePasswordModal from './components/ChangePasswordModal';

import { User, Level, Streak, Activity, Task } from './types/index';
import { supabase, isSupabaseConfigured } from './lib/supabase/client';
import { signIn, signUp, signOut, getActivities, getLevels, getActivePlan, getTasksForPlan, getStreak, completeLevel } from './lib/supabase/queries';
import { sound } from './lib/sound';

// Delegated, document-level click sound for every ordinary <button> in the
// app (nav tabs, add/remove rows, close buttons, etc). Buttons that already
// play a more specific sound in their own handler (Mark Complete, Break
// Down Further, toggle switches...) opt out with data-sound="none" so the
// two don't layer into noise. Installed once, unconditionally, near the
// top of App so it covers every screen — including the landing page,
// which renders from inside this same component tree.
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

const EMPTY_STREAK: Streak = { id: '', user_id: '', streak_count: 0, last_active_date: null, longest_streak: 0 };

function GlassWrapper({ children, showScenery = false }: { children: React.ReactNode; showScenery?: boolean }) {
  return (
    <div className="min-h-screen bg-void text-ink overflow-hidden relative flex flex-col">
      {showScenery ? (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <BackgroundScene preserveAspectRatio="xMidYMid slice" />
        </div>
      ) : (
        <>
          <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
          <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-moss/10 rounded-full blur-[140px] pointer-events-none z-0" />
        </>
      )}
      <div className="relative z-10 flex-1 flex flex-col">{children}</div>
    </div>
  );
}

function userFromSupabase(supaUser: any): User {
  return {
    id: supaUser.id,
    email: supaUser.email || '',
    name: supaUser.user_metadata?.name,
    isGuest: supaUser.app_metadata?.provider === 'anonymous' || supaUser.is_anonymous === true,
  };
}

function hasSeenOnboarding(userId: string): boolean {
  try {
    return window.localStorage.getItem(`strail_onboarding_seen_${userId}`) === '1';
  } catch {
    return false;
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticatedChecked, setIsAuthenticatedChecked] = useState(false);
  const [isAuthModeLogin, setIsAuthModeLogin] = useState(true);

  // Marketing/landing page shown before the auth card. Anyone signed out
  // starts here; the landing page's own CTAs are what flip this to false
  // (and set isAuthModeLogin appropriately) rather than the auth card
  // being the default entry point.
  const [showLanding, setShowLanding] = useState(true);

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authInfo, setAuthInfo] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isGuestSubmitting, setIsGuestSubmitting] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);

  const [onboardingFinished, setOnboardingFinished] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  const [levels, setLevels] = useState<Level[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [streak, setStreak] = useState<Streak>(EMPTY_STREAK);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [hasPlan, setHasPlan] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<'journey' | 'dashboard' | 'setup' | 'public'>('journey');

  useGlobalClickSound();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsAuthenticatedChecked(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? userFromSupabase(session.user) : null);
      setIsAuthenticatedChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? userFromSupabase(session.user) : null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const syncUserStateAndSchedule = async () => {
    if (!user) return;

    // Guests (anonymous auth) never touch personal data at all — they're
    // routed straight to a read-only Public Journeys view in the render
    // below, so there's nothing here to fetch or create for them.
    if (user.isGuest) {
      setHasCheckedOnboarding(true);
      setOnboardingFinished(true);
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    setSyncError(null);
    try {
      const userActivities = await getActivities();
      setActivities(userActivities);
      // Protected activities are optional now, so "has this person finished
      // onboarding" can no longer be inferred from activities.length > 0 —
      // it's tracked as its own flag, set once they save OR explicitly skip.
      setOnboardingFinished(userActivities.length > 0 || hasSeenOnboarding(user.id));
      setHasCheckedOnboarding(true);

      const activePlan = await getActivePlan();
      const allLevels = await getLevels();
      const planTasks = activePlan ? await getTasksForPlan(activePlan.id) : [];

      setLevels(allLevels);
      setTasks(planTasks);
      const planActive = Boolean(activePlan) && allLevels.length > 0;
      setHasPlan(planActive);
      setCurrentView(planActive ? 'journey' : 'setup');

      const userStreak = await getStreak();
      setStreak(userStreak);
    } catch (err: any) {
      console.error('User data syncing failed:', err);
      setSyncError(err.message || 'Could not load your data. Check your Supabase configuration.');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      syncUserStateAndSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthInfo(null);
    if (!authEmail.trim() || !authPassword.trim() || (!isAuthModeLogin && !authName.trim())) {
      setAuthError('Please fill out all credential lines.');
      return;
    }

    setIsAuthSubmitting(true);
    try {
      if (isAuthModeLogin) {
        await signIn(authEmail.trim(), authPassword);
      } else {
        const result = await signUp(authEmail.trim(), authPassword, authName.trim());
        if (!result.session) {
          setAuthInfo('Account created! Check your email to confirm it, then sign in.');
          setIsAuthModeLogin(true);
        }
      }
      setAuthEmail('');
      setAuthPassword('');
      setAuthName('');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleGuestEntry = async () => {
    setAuthError(null);
    setAuthInfo(null);
    setIsGuestSubmitting(true);
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
    } catch (err: any) {
      // Most likely cause: Anonymous Sign-Ins isn't turned on for this
      // Supabase project yet (Authentication -> Providers -> Anonymous).
      setAuthError(err.message || 'Guest access is not enabled for this project yet.');
    } finally {
      setIsGuestSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setLevels([]);
      setStreak(EMPTY_STREAK);
      setActivities([]);
      setHasPlan(false);
      setOnboardingFinished(false);
      setHasCheckedOnboarding(false);
      setShowLanding(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLevelComplete = async (levelId: string, options?: { skipped?: boolean }) => {
    try {
      const result = await completeLevel(levelId, !!options?.skipped);
      const updatedLevels = levels.map((l) => {
        if (l.id === levelId) {
          return { ...l, status: 'complete' as const, skipped: !!options?.skipped };
        }
        if (result.nextUnlockedLevel && l.id === result.nextUnlockedLevel.id) {
          return { ...l, status: 'active' as const };
        }
        return l;
      });
      setLevels(updatedLevels);
      if (result.streak) setStreak(result.streak);
    } catch (err: any) {
      console.error(err);
      setSyncError(err.message || 'Could not sync progress. Please check your connection.');
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <GlassWrapper>
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-lg w-full bg-surface border border-line p-8 rounded-2xl shadow-cozy text-left">
            <AlertCircle className="w-8 h-8 text-rose mb-3" />
            <h1 className="font-serif font-black text-2xl text-ink">Supabase isn't configured yet</h1>
            <p className="text-sm text-ink-soft mt-2 leading-relaxed">
              Add <code className="text-primary-soft">VITE_SUPABASE_URL</code> and{' '}
              <code className="text-primary-soft">VITE_SUPABASE_ANON_KEY</code> to a <code>.env.local</code> file
              in the project root, then restart the dev server. See <code>.env.example</code> and{' '}
              <code>supabase/schema.sql</code> for setup steps.
            </p>
          </div>
        </div>
      </GlassWrapper>
    );
  }

  if (!isAuthenticatedChecked) {
    return (
      <GlassWrapper>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-2 border-primary border-dashed rounded-full animate-spin" />
          <h3 className="font-serif font-black text-xl text-ink mt-4">Consulting Strail archives...</h3>
        </div>
      </GlassWrapper>
    );
  }

  if (!user) {
    if (showLanding) {
      return (
        <LandingPage
          onSignIn={() => {
            setIsAuthModeLogin(true);
            setAuthError(null);
            setAuthInfo(null);
            setShowLanding(false);
          }}
          onSignUp={() => {
            setIsAuthModeLogin(false);
            setAuthError(null);
            setAuthInfo(null);
            setShowLanding(false);
          }}
          onGuest={handleGuestEntry}
          isGuestSubmitting={isGuestSubmitting}
        />
      );
    }

    return (
      <GlassWrapper showScenery>
        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-4xl w-full bg-white border border-line rounded-[24px] shadow-cozy overflow-hidden flex flex-col md:flex-row"
          >
            <div className="hidden md:block md:w-[45%] min-h-[520px] shrink-0">
              <BrandHero />
            </div>

            <div className="flex-1 p-6 sm:p-10 flex flex-col justify-center">
              <button
                type="button"
                onClick={() => setShowLanding(true)}
                className="flex items-center gap-1.5 text-xs font-sans font-bold text-ink-soft hover:text-ink mb-6 cursor-pointer self-start"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Strail
              </button>

              <div className="mb-8">
                <div className="flex items-center gap-2.5">
                  <div className="inline-flex w-9 h-9 bg-primary/15 items-center justify-center rounded-full text-primary">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <h1 className="font-sans font-black text-3xl text-ink tracking-tight">Strail</h1>
                </div>
                <p className="text-sm text-ink-soft mt-2">Your journey. Your goals. Your way.</p>
              </div>

              {authError && (
                <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 text-xs flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
              {authInfo && (
                <div className="mb-6 p-3 bg-moss/10 border border-moss/20 rounded-xl text-moss text-xs flex items-start gap-2">
                  <span>{authInfo}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                {!isAuthModeLogin && (
                  <div className="flex items-center gap-3 px-4 py-3.5 border border-line rounded-xl bg-[#F3ECD8] focus-within:border-primary transition-colors">
                    <UserRound className="w-4.5 h-4.5 text-ink-soft shrink-0" />
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-transparent text-ink placeholder:text-ink-soft focus:outline-none text-sm"
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 px-4 py-3.5 border border-line rounded-xl bg-[#F3ECD8] focus-within:border-primary transition-colors">
                  <Mail className="w-4.5 h-4.5 text-ink-soft shrink-0" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full bg-transparent text-ink placeholder:text-ink-soft focus:outline-none text-sm"
                  />
                </div>

                <div className="flex items-center gap-3 px-4 py-3.5 border border-line rounded-xl bg-[#F3ECD8] focus-within:border-primary transition-colors">
                  <Lock className="w-4.5 h-4.5 text-ink-soft shrink-0" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-transparent text-ink placeholder:text-ink-soft focus:outline-none text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAuthSubmitting}
                  className={`w-full py-3.5 text-white shadow-cozy rounded-xl text-sm font-bold cursor-pointer transition-all ${
                    isAuthSubmitting ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:opacity-90'
                  }`}
                >
                  {isAuthSubmitting ? 'Please wait...' : isAuthModeLogin ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="mt-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-line" />
                <span className="text-[11px] font-sans text-ink-soft">or</span>
                <div className="h-px flex-1 bg-line" />
              </div>

              <button
                type="button"
                onClick={handleGuestEntry}
                disabled={isGuestSubmitting}
                className={`mt-5 w-full py-3 border border-line rounded-xl text-sm font-bold cursor-pointer transition-all ${
                  isGuestSubmitting ? 'text-ink-soft cursor-not-allowed' : 'text-ink hover:bg-black/5'
                }`}
              >
                {isGuestSubmitting ? 'Entering...' : 'Enter as Guest'}
              </button>
              <p className="text-[11px] text-ink-soft text-center mt-2">
                Browse Public Journeys without an account. Nothing you do as a guest is saved.
              </p>

              <p className="text-center mt-6 text-sm text-ink-soft">
                {isAuthModeLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => {
                    setIsAuthModeLogin(!isAuthModeLogin);
                    setAuthError(null);
                    setAuthInfo(null);
                  }}
                  className="font-bold text-primary hover:underline cursor-pointer"
                >
                  {isAuthModeLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </GlassWrapper>
    );
  }

  if (user && user.isGuest) {
    return (
      <GlassWrapper>
        <header className="border-b border-line bg-surface backdrop-blur-md py-4 px-6 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 text-primary flex items-center justify-center font-serif font-black text-sm select-none">
                G
              </div>
              <strong className="font-serif font-black text-xl tracking-tight text-ink">Guest Mode</strong>
            </div>
            <div className="flex items-center gap-4">
              <SoundToggle />
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-ink-soft hover:text-primary font-bold cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Exit
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <PublicJourneys
            isGuestMode
            onRequestSignup={async () => {
              await handleLogout();
              setIsAuthModeLogin(false);
              setShowLanding(false);
            }}
          />
        </main>
      </GlassWrapper>
    );
  }

  if (user && !hasCheckedOnboarding && isLoadingData) {
    return (
      <GlassWrapper>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-2 border-primary border-dashed rounded-full animate-spin" />
          <h3 className="font-serif font-black text-xl text-ink mt-4">Drafting active trails...</h3>
          {syncError && <p className="text-rose-700 text-xs mt-3 max-w-sm text-center">{syncError}</p>}
        </div>
      </GlassWrapper>
    );
  }

  if (user && !onboardingFinished) {
    return (
      <GlassWrapper>
        <div className="flex-1 py-10">
          <OnboardingFlow user={user} onOnboardingComplete={syncUserStateAndSchedule} />
        </div>
      </GlassWrapper>
    );
  }

  if (user && onboardingFinished && !hasPlan && currentView === 'setup') {
    return (
      <GlassWrapper>
        <header className="border-b border-line bg-surface backdrop-blur-md py-4 px-6 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-serif font-black text-sm select-none">
                {user?.name ? user.name.trim()[0].toUpperCase() : 'U'}
              </div>
              <strong className="font-serif font-black text-xl tracking-tight text-ink">{user?.name || 'User'}</strong>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-ink-soft hover:text-primary font-bold cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
          </div>
        </header>
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 py-8">
          <WeeklySetup user={user} onPlanGenerated={syncUserStateAndSchedule} />
        </main>
      </GlassWrapper>
    );
  }

  return (
    <GlassWrapper>
      <header className="border-b border-line bg-surface backdrop-blur-md py-3 sm:py-4 px-4 sm:px-6 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 cursor-pointer min-w-0" onClick={() => setCurrentView('journey')}>
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-serif font-black text-sm select-none shrink-0">
              {user?.name ? user.name.trim()[0].toUpperCase() : 'U'}
            </div>
            <strong className="font-serif font-black text-lg sm:text-xl tracking-tight text-ink truncate max-w-[110px] sm:max-w-none">
              {user?.name || 'User'}
            </strong>
          </div>

          <nav className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => setCurrentView('journey')}
              className={`px-4 py-1.5 rounded-lg font-extrabold text-xs cursor-pointer transition-colors ${
                currentView === 'journey' ? 'bg-primary text-white' : 'text-ink-soft hover:text-ink'
              }`}
            >
              Daily Trail
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-1.5 rounded-lg font-extrabold text-xs cursor-pointer transition-colors ${
                currentView === 'dashboard' ? 'bg-primary text-white' : 'text-ink-soft hover:text-ink'
              }`}
            >
              Standings
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Public Journeys — hidden on mobile since the bottom nav already has it */}
            <button
              onClick={() => setCurrentView('public')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-extrabold text-xs cursor-pointer transition-colors border ${
                currentView === 'public'
                  ? 'bg-primary text-white border-primary'
                  : 'text-ink-soft hover:text-ink border-line'
              }`}
              title="Browse journeys other students have shared"
            >
              <Globe2 className="w-3.5 h-3.5" /> <span className="hidden md:inline">Public Journeys</span>
            </button>

            <div className="flex items-center gap-1 bg-black/5 border border-line px-2.5 py-1 rounded-full text-xs select-none">
              <Flame className="w-4 h-4 text-primary fill-primary" />
              <strong className="font-mono text-ink">{streak.streak_count}d</strong>
            </div>
            <SoundToggle />
            <button
              onClick={() => setShowChangePassword(true)}
              className="flex items-center justify-center text-ink-soft hover:text-ink transition-colors cursor-pointer"
              title="Change password"
            >
              <KeyRound className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-ink-soft hover:text-primary font-bold cursor-pointer transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" /> <span className="hidden md:inline">Exit</span>
            </button>
          </div>
        </div>
      </header>

      {showChangePassword && user?.email && (
        <ChangePasswordModal email={user.email} onClose={() => setShowChangePassword(false)} />
      )}

      <div className="block sm:hidden fixed bottom-0 left-0 right-0 border-t border-line bg-surface backdrop-blur-md py-3 px-4 z-40">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setCurrentView('journey')}
            className={`font-bold text-xs flex flex-col items-center gap-1 cursor-pointer ${
              currentView === 'journey' ? 'text-primary' : 'text-ink-soft'
            }`}
          >
            <Compass className="w-4 h-4" /> Daily Trail
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`font-bold text-xs flex flex-col items-center gap-1 cursor-pointer ${
              currentView === 'dashboard' ? 'text-primary' : 'text-ink-soft'
            }`}
          >
            <Smile className="w-4 h-4" /> Standings
          </button>
          <button
            onClick={() => setCurrentView('public')}
            className={`font-bold text-xs flex flex-col items-center gap-1 cursor-pointer ${
              currentView === 'public' ? 'text-primary' : 'text-ink-soft'
            }`}
          >
            <Globe2 className="w-4 h-4" /> Public
          </button>
        </div>
      </div>

      <main className="flex-1 pb-16 sm:pb-8">
        {syncError && (
          <div className="max-w-3xl mx-auto mt-4 px-4">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-700 text-xs">{syncError}</div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {currentView === 'journey' && (
              <JourneyView
                levels={levels}
                tasks={tasks}
                streak={streak}
                activities={activities}
                user={user || undefined}
                onLevelComplete={handleLevelComplete}
                onRefresh={syncUserStateAndSchedule}
              />
            )}

            {currentView === 'dashboard' && (
              <Dashboard
                streak={streak}
                levels={levels}
                activities={activities}
                onNavigateToJourney={() => setCurrentView('journey')}
                onNavigateToSetup={() => setCurrentView('setup')}
                hasActivePlan={hasPlan}
              />
            )}

            {currentView === 'setup' && <WeeklySetup user={user} onPlanGenerated={syncUserStateAndSchedule} />}

            {currentView === 'public' && (
              <PublicJourneys
                onBack={() => setCurrentView('journey')}
                onForked={() => {
                  syncUserStateAndSchedule();
                  setCurrentView('journey');
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </GlassWrapper>
  );
}
