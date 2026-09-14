import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, UserRound, GitFork, Info, AlertTriangle, Sparkles } from 'lucide-react';
import { Task, Level } from '../types/index';
import {
  getPublicTaskById,
  getPublicLevelsForTask,
  forkPublicJourney,
  previewDecomposeFurther,
  getMyTaskTitles,
} from '../lib/supabase/queries';
import Trail from '../components/Trail';
import NodeDetail from '../components/NodeDetail';
import { useAppData } from '../lib/appContext';
import { sound } from '../lib/sound';
import { useDocumentMeta } from '../lib/useDocumentMeta';

const BRANCH_EMOJI: Record<string, string> = { academic: '📚', light: '✨', custom: '🧭', activity: '🏕️' };

export default function PublicJourneyDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user, syncUserStateAndSchedule } = useAppData();

  const isAnonymous = !user;
  const isGuestMode = !!user?.isGuest;
  const isFullUser = !!user && !user.isGuest;

  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);

  const [sandboxLevels, setSandboxLevels] = useState<Level[]>([]);
  const [previewLevel, setPreviewLevel] = useState<Level | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerInterval, setTimerInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  // Per-journey browser tab title/meta once the task has loaded. See the
  // caveat in useDocumentMeta.ts — this does NOT fix link-preview/social
  // share cards for this URL, since those are read from index.html's
  // static tags before any JS runs. Fixing that needs SSR/prerendering.
  useDocumentMeta({
    title: task ? `${task.title} — A Strail Journey` : 'Public Journey — Strail',
    description: task
      ? `A ${levels.length}-step trail for "${task.title}", shared by ${task.author_name || 'a Strail student'}.`
      : undefined,
  });

  const [isForking, setIsForking] = useState(false);
  const [forkError, setForkError] = useState<string | null>(null);
  const [duplicateTitleWarning, setDuplicateTitleWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const fetchedTask = await getPublicTaskById(taskId);
        if (!fetchedTask) {
          if (!cancelled) setNotFound(true);
          return;
        }
        const fetchedLevels = await getPublicLevelsForTask(taskId);
        if (!cancelled) {
          setTask(fetchedTask);
          setLevels(fetchedLevels);
          if (isGuestMode) setSandboxLevels(fetchedLevels.map((l) => ({ ...l })));
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Could not load this journey.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, isGuestMode]);

  const stopAndClearTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
    setTimerInterval(null);
    setTimeLeft(null);
  };

  const formatTimer = (totSeconds: number) => {
    const mins = Math.floor(totSeconds / 60);
    const secs = totSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const startTimer = (secs: number) => {
    if (timerInterval) clearInterval(timerInterval);
    setTimeLeft(secs);
    const intVal = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(intVal);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerInterval(intVal);
  };

  const handleSandboxSelect = (lvl: Level) => {
    if (previewLevel?.id === lvl.id) {
      stopAndClearTimer();
      setPreviewLevel(null);
      return;
    }
    setPreviewLevel(lvl);
    if (lvl.status === 'active') startTimer(lvl.estimated_minutes * 60);
    else stopAndClearTimer();
  };

  const handleSandboxComplete = async (levelId: string, skipped: boolean) => {
    const target = sandboxLevels.find((l) => l.id === levelId);
    if (!target) return;
    setSandboxLevels(
      sandboxLevels.map((l) => {
        if (l.id === levelId) return { ...l, status: 'complete', skipped };
        if (l.branch_order === target.branch_order + 1 && l.status === 'locked') return { ...l, status: 'active' };
        return l;
      })
    );
    stopAndClearTimer();
    setPreviewLevel(null);
  };

  const handleSandboxRevert = async (level: Level) => {
    const next = sandboxLevels.find((l) => l.branch_order === level.branch_order + 1);
    if (next && next.status !== 'active') {
      throw new Error('Can only undo the most recently completed step on this trail.');
    }
    setSandboxLevels(
      sandboxLevels.map((l) => {
        if (l.id === level.id) return { ...l, status: 'active', skipped: false, completed_at: null };
        if (next && l.id === next.id) return { ...l, status: 'locked' };
        return l;
      })
    );
    stopAndClearTimer();
    setPreviewLevel(null);
  };

  const handleSandboxBreakDown = async (level: Level) => {
    const alreadyHasChildren = sandboxLevels.some((l) => l.parent_level_id === level.id);
    if (alreadyHasChildren) return { stopped: false, message: null };

    const result = await previewDecomposeFurther(level.title, level.description, level.branch, level.depth);
    if (result.stopped || result.levels.length === 0) {
      return { stopped: true, message: result.message };
    }

    const newCount = result.levels.length;
    const shifted = sandboxLevels.map((l) =>
      l.branch_order > level.branch_order ? { ...l, branch_order: l.branch_order + newCount } : l
    );
    const newNodes: Level[] = result.levels.map((lvl, idx) => ({
      id: `sandbox-${level.id}-${Date.now()}-${idx}`,
      task_id: level.task_id,
      user_id: level.user_id,
      title: lvl.title,
      description: lvl.description,
      estimated_minutes: lvl.estimated_minutes,
      branch: level.branch,
      branch_order: level.branch_order + idx + 1,
      status: 'locked',
      skipped: false,
      completed_at: null,
      depth: level.depth + 1,
      parent_level_id: level.id,
    }));
    setSandboxLevels([...shifted, ...newNodes]);
    return { stopped: false, message: null };
  };

  const handleFork = async () => {
    if (!task) return;
    setForkError(null);

    if (!duplicateTitleWarning) {
      try {
        const titles = await getMyTaskTitles();
        const isDuplicate = titles.some((t) => t.trim().toLowerCase() === task.title.trim().toLowerCase());
        if (isDuplicate) {
          setDuplicateTitleWarning(task.title);
          return;
        }
      } catch {
        // Ignore — proceed with the fork rather than blocking on a check that itself couldn't run.
      }
    }

    setIsForking(true);
    try {
      await forkPublicJourney(task, levels);
      sound.complete();
      setDuplicateTitleWarning(null);
      await syncUserStateAndSchedule();
      navigate('/app');
    } catch (err: any) {
      setForkError(err.message || 'Could not fork this journey.');
      sound.denied();
    } finally {
      setIsForking(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-ink-soft text-sm">Loading trail...</div>;
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <p className="text-3xl mb-2">🌄</p>
        <h1 className="font-serif font-black text-xl text-ink">This journey isn't public (or doesn't exist)</h1>
        <p className="text-sm text-ink-soft mt-2">It may have been unpublished or deleted by its owner.</p>
        <Link to="/journeys" className="inline-flex items-center gap-1.5 mt-6 text-sm font-bold text-primary hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Public Journeys
        </Link>
      </div>
    );
  }

  if (error || !task) {
    return <div className="max-w-2xl mx-auto py-16 px-4 text-center text-rose-700 text-sm">{error || 'Something went wrong.'}</div>;
  }

  const sandboxSelected = isGuestMode ? sandboxLevels.find((l) => l.id === previewLevel?.id) || null : null;
  const sandboxChildCount = sandboxSelected
    ? sandboxLevels.filter((l) => l.parent_level_id === sandboxSelected.id).length
    : 0;

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <Link to="/journeys" className="flex items-center gap-1.5 text-xs font-sans font-bold text-ink-soft hover:text-ink mb-4 cursor-pointer">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to gallery
      </Link>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-primary-soft">
            {BRANCH_EMOJI[task.branch] || '🧭'} Public Journey
          </span>
          <h1 className="font-serif font-black text-2xl text-ink mt-1">{task.title}</h1>
          <p className="text-xs text-ink-soft mt-1 flex items-center gap-1.5">
            <UserRound className="w-3.5 h-3.5" /> Shared by {task.author_name || 'a Strail student'}
          </p>
        </div>

        {isFullUser && (
          <button
            type="button"
            data-sound="none"
            onClick={handleFork}
            disabled={isForking}
            className={`shrink-0 w-full sm:w-auto flex items-center justify-center gap-1.5 py-2.5 px-5 font-sans font-bold rounded-xl shadow-active transition-opacity cursor-pointer text-sm disabled:opacity-60 ${
              duplicateTitleWarning ? 'bg-amber-600 text-white hover:opacity-90' : 'bg-primary text-white hover:opacity-90'
            }`}
          >
            <GitFork className="w-4 h-4" />
            {isForking ? 'Forking...' : duplicateTitleWarning ? 'Fork Anyway' : 'Fork this Journey'}
          </button>
        )}

        {isAnonymous && (
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="shrink-0 w-full sm:w-auto flex items-center justify-center gap-1.5 py-2.5 px-5 font-sans font-bold rounded-xl shadow-active bg-primary text-white hover:opacity-90 transition-opacity cursor-pointer text-sm"
          >
            <Sparkles className="w-4 h-4" /> Sign up to fork this
          </button>
        )}
      </div>

      {duplicateTitleWarning && (
        <div className="mb-4 flex items-start gap-2 bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            You already have a trail called "{duplicateTitleWarning}". Forking again will create a separate trail for the same topic.
          </span>
        </div>
      )}

      {forkError && <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-700 p-3 rounded-lg text-xs">{forkError}</div>}

      {isGuestMode && (
        <div className="mb-4 flex items-start gap-2 bg-primary/10 border border-primary/25 rounded-xl p-3 text-xs text-primary-soft">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            You can complete steps and try "Break Down Further" here to see how it feels — it's a local sandbox, nothing saves.
            Create a free account to keep progress for real.
          </span>
        </div>
      )}

      {isAnonymous && (
        <div className="mb-4 flex items-start gap-2 bg-primary/10 border border-primary/25 rounded-xl p-3 text-xs text-primary-soft">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>You're viewing this trail read-only. Sign up (or browse as a guest) to try completing steps yourself.</span>
        </div>
      )}

      {isGuestMode ? (
        <Trail levels={sandboxLevels} selectedLevelId={previewLevel?.id || null} onSelect={handleSandboxSelect} />
      ) : (
        <Trail levels={levels} selectedLevelId={previewLevel?.id || null} onSelect={setPreviewLevel} />
      )}

      {isGuestMode ? (
        <NodeDetail
          level={sandboxSelected}
          childCount={sandboxChildCount}
          timeLeft={timeLeft}
          formatTimer={formatTimer}
          onClose={() => {
            stopAndClearTimer();
            setPreviewLevel(null);
          }}
          onComplete={handleSandboxComplete}
          onBreakDownFurther={handleSandboxBreakDown}
          onRevertCompletion={handleSandboxRevert}
        />
      ) : (
        previewLevel && (
          <motion.div
            className="fixed inset-0 bg-[#1B1B16]/70 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setPreviewLevel(null)}
          >
            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-[#FBF8F1] border-t border-line rounded-t-3xl shadow-cozy px-6 pt-5 pb-8 max-w-xl mx-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-black/15 rounded-full mx-auto mb-4" />
              <h4 className="font-serif font-black text-xl text-ink leading-tight">{previewLevel.title}</h4>
              <p className="text-sm text-ink-soft leading-relaxed mt-3">{previewLevel.description}</p>
              <p className="text-xs text-ink-soft mt-4">~{previewLevel.estimated_minutes} min</p>
              {isAnonymous && (
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="w-full mt-4 py-3 bg-primary text-white font-sans font-bold rounded-xl shadow-active hover:opacity-90 transition-opacity cursor-pointer text-sm"
                >
                  Sign up to try this step
                </button>
              )}
            </motion.div>
          </motion.div>
        )
      )}
    </div>
  );
}
