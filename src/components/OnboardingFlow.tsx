import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Music, Palette, Compass, Clock, Sparkles, Plus, Trash2, Shield } from 'lucide-react';
import { Activity, ActivityType, User } from '../types/index';
import { saveActivities } from '../lib/supabase/queries';
import { sound } from '../lib/sound';

interface OnboardingFlowProps {
  user: User;
  onOnboardingComplete: () => void;
}

export default function OnboardingFlow({ user, onOnboardingComplete }: OnboardingFlowProps) {
  const [addedActivities, setAddedActivities] = useState<Omit<Activity, 'id' | 'user_id'>[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentName, setCurrentName] = useState('');
  const [currentType, setCurrentType] = useState<ActivityType>('sport');
  const [currentDays, setCurrentDays] = useState<string[]>(['Tue', 'Thu']);
  const [currentStartTime, setCurrentStartTime] = useState('16:00');
  const [currentDuration, setCurrentDuration] = useState(90);

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day: string) => {
    setCurrentDays(currentDays.includes(day) ? currentDays.filter((d) => d !== day) : [...currentDays, day]);
  };

  const addActivityToList = () => {
    setError(null);
    if (!currentName.trim()) {
      setError('Please enter a name for the event.');
      return;
    }
    if (currentDays.length === 0) {
      setError('Please select at least one day for this event.');
      return;
    }
    setAddedActivities([
      ...addedActivities,
      {
        name: currentName.trim(),
        type: currentType,
        days_of_week: currentDays,
        start_time: currentStartTime,
        duration_minutes: currentDuration,
      },
    ]);
    sound.pop();
    setCurrentName('');
    setCurrentDays(['Mon', 'Wed']);
  };

  const removeActivity = (index: number) => {
    setAddedActivities(addedActivities.filter((_, i) => i !== index));
  };

  const markOnboardingSeen = () => {
    try {
      window.localStorage.setItem(`strail_onboarding_seen_${user.id}`, '1');
    } catch {
      // localStorage can fail in private-browsing contexts; not fatal here.
    }
  };

  const handleSaveAndStart = async () => {
    setIsSaving(true);
    setError(null);
    try {
      if (addedActivities.length > 0) {
        await saveActivities(addedActivities);
      }
      markOnboardingSeen();
      sound.complete();
      onOnboardingComplete();
    } catch (err: any) {
      setError(err.message || 'Something went wrong saving your activities. Please try again.');
      sound.denied();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    markOnboardingSeen();
    onOnboardingComplete();
  };

  const displayName = user.name ? user.name.trim() : user.email.split('@')[0];

  const categoryTypes = [
    { type: 'sport' as ActivityType, label: 'Sport', icon: Trophy, bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25' },
    { type: 'music' as ActivityType, label: 'Music/Art', icon: Music, bg: 'bg-amber-500/10 text-amber-700 border-amber-500/25' },
    { type: 'creative' as ActivityType, label: 'Creative/Design', icon: Palette, bg: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/25' },
    { type: 'other' as ActivityType, label: 'Other/Meet', icon: Compass, bg: 'bg-slate-500/10 text-slate-600 border-slate-500/25' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <span className="p-1 px-3 bg-primary/10 border border-primary/30 text-primary-soft text-xs font-mono font-bold uppercase rounded-full tracking-wider">
          Optional: Protect Your Time 🏕️
        </span>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-ink mt-3">
          Hey {displayName}, anything you want to protect this week?
        </h1>
        <p className="text-ink-soft mt-2 text-sm max-w-xl mx-auto">
          If you've got soccer, rehearsal, lessons, or standing meetings, add them here and Strail will route your
          climbs around them. Totally optional — you can skip this and add it anytime.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 bg-surface/80 p-6 rounded-2xl border border-line shadow-cozy backdrop-blur-md">
          <h2 className="font-serif font-bold text-lg text-ink mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Customize Protected Event
          </h2>

          <div className="space-y-4">
            <div className="flex flex-col">
              <label className="font-bold text-ink text-xs uppercase tracking-wider mb-1.5 text-left">
                Event Name
              </label>
              <input
                type="text"
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
                placeholder="e.g. Soccer Practice, Math Club, Debate Prep"
                className="p-3 border border-line rounded-lg text-ink bg-[#f7fbf8] focus:outline-none focus:border-primary transition-colors text-sm"
              />
            </div>

            <div className="flex flex-col">
              <label className="font-bold text-ink text-xs uppercase tracking-wider mb-2 text-left">
                Activity Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categoryTypes.map((cat) => {
                  const Icon = cat.icon;
                  const isSel = currentType === cat.type;
                  return (
                    <button
                      key={cat.type}
                      type="button"
                      onClick={() => setCurrentType(cat.type)}
                      className={`flex items-center gap-2 p-2 px-3 rounded-lg border text-left text-xs font-medium cursor-pointer transition-colors ${
                        isSel ? 'border-primary bg-primary/20 text-ink' : 'border-black/5 hover:border-black/10 bg-[#f7fbf8]/40 text-ink-soft'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="font-bold text-ink text-xs uppercase tracking-wider mb-2 text-left">
                Protected Days
              </label>
              <div className="flex flex-wrap gap-1.5 justify-start">
                {DAYS.map((d) => {
                  const isPicked = currentDays.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={`w-9 h-9 font-medium text-xs rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                        isPicked ? 'bg-primary text-white border-primary' : 'border-line bg-[#f7fbf8] text-ink-soft'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="font-bold text-ink text-xs uppercase tracking-wider mb-1.5 text-left flex items-center gap-1">
                  <Clock className="w-3 h-3 text-primary" /> Start Time
                </label>
                <input
                  type="time"
                  value={currentStartTime}
                  onChange={(e) => setCurrentStartTime(e.target.value)}
                  className="p-2 border border-line rounded-lg text-sm text-ink bg-[#f7fbf8] focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col">
                <label className="font-bold text-ink text-xs uppercase tracking-wider mb-1.5 text-left">
                  Duration (mins)
                </label>
                <select
                  value={currentDuration}
                  onChange={(e) => setCurrentDuration(Number(e.target.value))}
                  className="p-2 border border-line rounded-lg text-sm text-ink bg-[#f7fbf8] focus:outline-none focus:border-primary"
                >
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>1 hr</option>
                  <option value={90}>1.5 hrs</option>
                  <option value={120}>2 hrs</option>
                  <option value={180}>3 hrs</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={addActivityToList}
              className="w-full mt-2 py-2 px-4 rounded-lg bg-moss hover:opacity-90 font-extrabold text-white text-xs uppercase tracking-wider cursor-pointer shadow-cozy flex items-center justify-center gap-1.5 transition-all active:translate-y-0.5"
            >
              <Plus className="w-4 h-4" /> Protect This Event
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-surface/85 border border-line p-6 rounded-2xl shadow-cozy min-h-[340px] flex flex-col backdrop-blur-md">
            <h2 className="font-serif font-bold text-lg text-ink mb-4 pb-2 border-b border-line flex items-center justify-between">
              <span>Your Shielded Commitments</span>
              <span className="p-1 px-3.5 bg-primary/10 border border-primary/20 text-primary-soft text-xs font-mono font-bold rounded-full">
                {addedActivities.length} protected
              </span>
            </h2>

            {error && (
              <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-700 p-2.5 text-xs rounded-lg">
                {error}
              </div>
            )}

            {addedActivities.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-ink-soft select-none">
                <Shield className="w-12 h-12 text-ink-soft/50 mb-3 stroke-[1.5]" />
                <p className="text-sm font-bold">Nothing protected yet — and that's fine.</p>
                <p className="text-xs text-ink-soft/80 mt-1 max-w-xs">
                  Add something on the left if you want Strail to route around it, or just skip this step below.
                </p>
              </div>
            ) : (
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[360px] pr-2">
                <AnimatePresence>
                  {addedActivities.map((act, idx) => {
                    const matchCat = categoryTypes.find((c) => c.type === act.type) || categoryTypes[3];
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="p-4 bg-[#f7fbf8] border border-black/5 hover:border-black/10 rounded-xl flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${matchCat.bg} border`}>
                            <matchCat.icon className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <h4 className="font-serif font-black text-ink text-sm">{act.name}</h4>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px] text-ink-soft">
                              <span className="capitalize text-ink/80">{act.type}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-primary" /> {act.start_time} ({act.duration_minutes}m)
                              </span>
                            </div>
                            <div className="flex gap-1 mt-1.5">
                              {act.days_of_week.map((d) => (
                                <span key={d} className="px-1.5 py-0.5 bg-primary/20 border border-primary/30 text-primary-soft text-[9px] font-bold rounded">
                                  {d}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeActivity(idx)}
                          className="p-2 border border-black/5 hover:bg-rose-500/10 hover:border-rose-500/30 text-ink-soft hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                          title="Remove activity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-line flex flex-col gap-3">
              {addedActivities.length > 0 && (
                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 p-3 rounded-lg text-primary-soft text-xs">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>These events are locked! Strail will design steps around them.</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  data-sound="none"
                  disabled={isSaving}
                  onClick={handleSaveAndStart}
                  className={`flex-1 py-3 text-white rounded-xl shadow-active font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isSaving ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:opacity-95 hover:-translate-y-0.5'
                  }`}
                >
                  {isSaving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4" />
                  )}
                  {isSaving
                    ? 'Saving...'
                    : addedActivities.length > 0
                    ? `Save & Continue (${addedActivities.length} Protected)`
                    : 'Continue'}
                </button>

                {addedActivities.length === 0 && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    disabled={isSaving}
                    className="py-3 px-6 text-ink-soft hover:text-ink border border-line rounded-xl font-bold text-sm cursor-pointer transition-colors"
                  >
                    Skip for now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
