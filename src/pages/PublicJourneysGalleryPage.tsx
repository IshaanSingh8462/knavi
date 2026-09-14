import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft, UserRound, Sparkles } from 'lucide-react';
import { PublicJourneyCard } from '../types/index';
import { getPublicTasks, getPublicLevelCounts } from '../lib/supabase/queries';
import { useAppData } from '../lib/appContext';
import { useDocumentMeta } from '../lib/useDocumentMeta';

const BRANCH_EMOJI: Record<string, string> = { academic: '📚', light: '✨', custom: '🧭', activity: '🏕️' };

export default function PublicJourneysGalleryPage() {
  useDocumentMeta({
    title: 'Public Journeys — Strail',
    description: 'Browse trails other students have built and shared on Strail — real task breakdowns for real goals.',
  });

  const { user } = useAppData();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<PublicJourneyCard[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const tasks = await getPublicTasks();
        const counts = await getPublicLevelCounts(tasks.map((t) => t.id));
        if (!cancelled) setCards(tasks.map((task) => ({ task, levelCount: counts[task.id] || 0 })));
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Could not load public journeys.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isGuestMode = !!user?.isGuest;
  const isAnonymous = !user;

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-10 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex w-14 h-14 bg-primary/10 items-center justify-center rounded-full text-primary mb-3">
          <Compass className="w-7 h-7" />
        </div>
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink">Public Journeys</h1>
        <p className="text-sm text-ink-soft mt-2 max-w-md mx-auto">
          Trails other students have already climbed — real breakdowns for real goals, shared by the people who built them.
        </p>
      </div>

      {(isGuestMode || isAnonymous) && (
        <div className="mb-6 p-4 bg-primary/10 border border-primary/25 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <span className="text-sm text-primary-soft">
            {isGuestMode
              ? "You're browsing as a guest — sign up to build your own trail and publish it here."
              : 'Sign up to build your own trail and publish it here.'}
          </span>
          <button
            onClick={() => navigate('/signup')}
            className="shrink-0 py-2 px-4 bg-primary text-white font-sans font-bold rounded-lg text-xs cursor-pointer hover:opacity-90 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Create free account
          </button>
        </div>
      )}

      {error && <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-700 p-3 rounded-lg text-xs">{error}</div>}

      {isLoading ? (
        <div className="py-16 text-center text-ink-soft text-sm">Loading public journeys...</div>
      ) : cards.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-3xl mb-2">🌄</p>
          <p className="text-sm font-bold text-ink">No public journeys yet</p>
          <p className="text-xs text-ink-soft mt-1 max-w-xs mx-auto">
            Be the first — open one of your custom trails and flip it public.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map(({ task, levelCount }) => (
            <Link
              key={task.id}
              to={`/journeys/${task.id}`}
              className="text-left bg-surface border border-line rounded-2xl p-5 shadow-cozy hover:border-primary/40 transition-colors cursor-pointer block"
            >
              <span className="text-2xl">{BRANCH_EMOJI[task.branch] || '🧭'}</span>
              <h3 className="font-serif font-black text-lg text-ink mt-2 leading-snug">{task.title}</h3>
              <p className="text-xs text-ink-soft mt-1">{levelCount} step{levelCount === 1 ? '' : 's'} · {task.subject}</p>
              <p className="text-[11px] text-ink-soft/80 mt-2 flex items-center gap-1.5">
                <UserRound className="w-3 h-3" /> {task.author_name || 'A Strail student'}
              </p>
            </Link>
          ))}
        </div>
      )}

      {user && !user.isGuest && (
        <div className="mt-8 text-center">
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 py-3 px-6 bg-primary text-white font-sans font-bold rounded-xl shadow-active hover:opacity-90 transition-opacity cursor-pointer text-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to your trail
          </Link>
        </div>
      )}
    </div>
  );
}
