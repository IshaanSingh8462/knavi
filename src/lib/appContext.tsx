import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Level, Streak, Activity, Task } from '../types/index';
import { supabase, isSupabaseConfigured } from './supabase/client';
import {
  signIn as queriesSignIn,
  signUp as queriesSignUp,
  signOut,
  getActivities,
  getLevels,
  getActivePlan,
  getTasksForPlan,
  getStreak,
  completeLevel,
} from './supabase/queries';
import { setGaUserId, trackEvent } from './analytics';

const EMPTY_STREAK: Streak = { id: '', user_id: '', streak_count: 0, last_active_date: null, longest_streak: 0 };

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

export function markOnboardingSeen(userId: string) {
  try {
    window.localStorage.setItem(`strail_onboarding_seen_${userId}`, '1');
  } catch {
    // localStorage can fail in private-browsing contexts; not fatal here.
  }
}

interface AppDataContextValue {
  isSupabaseConfigured: boolean;
  user: User | null;
  isAuthenticatedChecked: boolean;

  levels: Level[];
  tasks: Task[];
  streak: Streak;
  activities: Activity[];
  hasPlan: boolean;
  isLoadingData: boolean;
  syncError: string | null;

  onboardingFinished: boolean;
  hasCheckedOnboarding: boolean;

  syncUserStateAndSchedule: () => Promise<void>;
  markOnboardingComplete: () => void;

  authError: string | null;
  authInfo: string | null;
  isAuthSubmitting: boolean;
  isGuestSubmitting: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ needsConfirmation: boolean }>;
  enterAsGuest: () => Promise<void>;
  clearAuthMessages: () => void;
  logout: () => Promise<void>;

  handleLevelComplete: (levelId: string, options?: { skipped?: boolean }) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticatedChecked, setIsAuthenticatedChecked] = useState(false);

  const [levels, setLevels] = useState<Level[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [streak, setStreak] = useState<Streak>(EMPTY_STREAK);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [hasPlan, setHasPlan] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [onboardingFinished, setOnboardingFinished] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  const [authError, setAuthError] = useState<string | null>(null);
  const [authInfo, setAuthInfo] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isGuestSubmitting, setIsGuestSubmitting] = useState(false);

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

  // Feed GA4 a stable user_id once we know who's signed in, so authenticated
  // usage is trackable across sessions/devices instead of only by client id.
  // Guests intentionally get no user_id — their anonymous auth id is
  // per-browser and re-created every guest session, so attaching it would
  // just be noise.
  useEffect(() => {
    if (user && !user.isGuest) {
      setGaUserId(user.id);
    } else {
      setGaUserId(null);
    }
  }, [user?.id, user?.isGuest]);

  const syncUserStateAndSchedule = async () => {
    if (!user) return;

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
      setOnboardingFinished(userActivities.length > 0 || hasSeenOnboarding(user.id));
      setHasCheckedOnboarding(true);

      const activePlan = await getActivePlan();
      const allLevels = await getLevels();
      const planTasks = activePlan ? await getTasksForPlan(activePlan.id) : [];

      setLevels(allLevels);
      setTasks(planTasks);
      const planActive = Boolean(activePlan) && allLevels.length > 0;
      setHasPlan(planActive);

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
    } else {
      // Signed out — reset so a subsequent sign-in doesn't briefly show
      // stale data from the previous session.
      setLevels([]);
      setTasks([]);
      setStreak(EMPTY_STREAK);
      setActivities([]);
      setHasPlan(false);
      setOnboardingFinished(false);
      setHasCheckedOnboarding(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const markOnboardingComplete = () => {
    if (user) markOnboardingSeen(user.id);
    setOnboardingFinished(true);
  };

  const clearAuthMessages = () => {
    setAuthError(null);
    setAuthInfo(null);
  };

  const handleSignIn = async (email: string, password: string) => {
    setAuthError(null);
    setAuthInfo(null);
    setIsAuthSubmitting(true);
    try {
      await queriesSignIn(email.trim(), password);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed.');
      throw err;
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    setAuthError(null);
    setAuthInfo(null);
    setIsAuthSubmitting(true);
    try {
      const result = await queriesSignUp(email.trim(), password, name.trim());
      if (!result.session) {
        setAuthInfo('Account created! Check your email to confirm it, then sign in.');
        return { needsConfirmation: true };
      }
      return { needsConfirmation: false };
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed.');
      throw err;
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const enterAsGuest = async () => {
    setAuthError(null);
    setAuthInfo(null);
    setIsGuestSubmitting(true);
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      trackEvent('guest_entry');
    } catch (err: any) {
      setAuthError(err.message || 'Guest access is not enabled for this project yet.');
      throw err;
    } finally {
      setIsGuestSubmitting(false);
    }
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLevelComplete = async (levelId: string, options?: { skipped?: boolean }) => {
    try {
      const result = await completeLevel(levelId, !!options?.skipped);
      setLevels((prev) =>
        prev.map((l) => {
          if (l.id === levelId) {
            return { ...l, status: 'complete' as const, skipped: !!options?.skipped };
          }
          if (result.nextUnlockedLevel && l.id === result.nextUnlockedLevel.id) {
            return { ...l, status: 'active' as const };
          }
          return l;
        })
      );
      if (result.streak) setStreak(result.streak);
    } catch (err: any) {
      console.error(err);
      setSyncError(err.message || 'Could not sync progress. Please check your connection.');
    }
  };

  const value: AppDataContextValue = {
    isSupabaseConfigured,
    user,
    isAuthenticatedChecked,
    levels,
    tasks,
    streak,
    activities,
    hasPlan,
    isLoadingData,
    syncError,
    onboardingFinished,
    hasCheckedOnboarding,
    syncUserStateAndSchedule,
    markOnboardingComplete,
    authError,
    authInfo,
    isAuthSubmitting,
    isGuestSubmitting,
    signIn: handleSignIn,
    signUp: handleSignUp,
    enterAsGuest,
    clearAuthMessages,
    logout,
    handleLevelComplete,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
