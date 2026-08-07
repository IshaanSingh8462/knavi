import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';
import {
  Leaf,
  ChevronDown,
  ArrowRight,
  Flame,
  Shield,
  Layers,
  Globe2,
  Users,
  GitFork,
  Compass,
} from 'lucide-react';
import BrandHero from './BrandHero';
import SoundToggle from './SoundToggle';

interface LandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
  onGuest: () => void;
  isGuestSubmitting?: boolean;
}

// ---------------------------------------------------------------------------
// Signature element: a scroll-lit trail spine running down the left edge of
// the page (desktop) plus a thin top progress bar (all breakpoints). Both
// are driven by the SAME scrollYProgress motion value as the page's own
// Trail.tsx nodes use branch_order/status — this is the marketing page
// literally climbing itself as you read it, rather than a generic
// scroll-progress-bar template.
// ---------------------------------------------------------------------------

const CAMPS = [
  { percent: 2, emoji: '🏕️', label: 'Basecamp' },
  { percent: 24, emoji: '📖', label: 'About' },
  { percent: 46, emoji: '🧭', label: 'How it works' },
  { percent: 70, emoji: '✨', label: 'Perks' },
  { percent: 94, emoji: '🏔️', label: 'Summit' },
];

function CampDot({ progress, threshold }: { progress: MotionValue<number>; threshold: number }) {
  const t = threshold / 100;
  const bg = useTransform(progress, [Math.max(0, t - 0.03), t], ['#dfc98a', '#3fa35c']);
  const borderColor = useTransform(progress, [Math.max(0, t - 0.03), t], ['#c2a866', '#f0c060']);
  const scale = useTransform(progress, [Math.max(0, t - 0.03), t, Math.min(1, t + 0.03)], [1, 1.15, 1]);
  return (
    <motion.div
      className="absolute w-9 h-9 rounded-full border-4 flex items-center justify-center text-sm shadow-cozy"
      style={{ backgroundColor: bg, borderColor, scale, left: '1.5rem', transform: 'translate(-50%, -50%)' }}
    />
  );
}

function TrailSpine({ progress }: { progress: MotionValue<number> }) {
  const litHeight = useTransform(progress, [0, 1], ['0%', '100%']);
  return (
    <div className="hidden lg:block absolute left-10 top-0 bottom-0 w-0 z-10" aria-hidden="true">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-quest-border rounded-full" />
      <motion.div
        className="absolute left-0 top-0 w-1.5 bg-quest-accent rounded-full origin-top"
        style={{ height: litHeight }}
      />
      {CAMPS.map((c) => (
        <div key={c.label} className="absolute" style={{ top: `${c.percent}%`, left: 0 }}>
          <CampDot progress={progress} threshold={c.percent} />
          <span
            className="absolute left-8 top-1/2 -translate-y-1/2 text-[10px] font-mono uppercase tracking-widest text-quest-muted whitespace-nowrap select-none"
          >
            {c.emoji} {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function ScrollProgressBar({ progress }: { progress: MotionValue<number> }) {
  const width = useTransform(progress, [0, 1], ['0%', '100%']);
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-black/5 z-50">
      <motion.div className="h-full bg-quest-accent" style={{ width }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small shared building blocks
// ---------------------------------------------------------------------------

function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-quest-accent-soft">
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------

export default function LandingPage({ onSignIn, onSignUp, onGuest, isGuestSubmitting }: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  const heroParallax = useTransform(scrollYProgress, [0, 0.18], ['0%', '-6%']);

  const steps = [
    {
      n: '01',
      title: 'Drop in a goal',
      body: 'Homework, a recital, a side project — anything you keep putting off because it feels too big to start.',
    },
    {
      n: '02',
      title: 'Gemini plans the climb',
      body: 'Knavi asks Gemini to split it into 3 to 6 specific steps, each sized to 20–30 focused minutes.',
    },
    {
      n: '03',
      title: 'Climb node by node',
      body: 'Steps unlock one at a time as you finish them, so you always know exactly what comes next.',
    },
    {
      n: '04',
      title: 'Protect what matters',
      body: 'Tell Knavi about practice, rehearsal, or standing plans — it schedules around them and keeps your streak alive.',
    },
  ];

  const perks = [
    {
      icon: Flame,
      title: 'Streaks & Basecamp',
      body: 'A daily streak counter and a per-trail progress dashboard, so momentum is something you can actually see.',
    },
    {
      icon: Shield,
      title: 'Protected Time',
      body: "Block out sports, music, or anything else that's non-negotiable. Knavi routes your steps around it, never through it.",
    },
    {
      icon: Layers,
      title: 'Break Down Further',
      body: "Stuck on a step? Split it into smaller sub-steps on the spot — up to two layers deep before Knavi tells you to just try it.",
    },
    {
      icon: Globe2,
      title: 'Public Journeys',
      body: 'Browse trails other students have already climbed for real goals, and fork one straight into your own account.',
    },
    {
      icon: Users,
      title: 'Guest Sandbox',
      body: 'Try a full trail — breakdowns included — before creating an account. Nothing saves, nothing required.',
    },
    {
      icon: GitFork,
      title: 'One Trail Per Goal',
      body: 'Every task gets its own independently publishable trail. No mixed buckets, no losing track of what belongs where.',
    },
  ];

  return (
    <div ref={containerRef} className="relative bg-void text-ink">
      <ScrollProgressBar progress={scrollYProgress} />
      <TrailSpine progress={scrollYProgress} />
      <SoundToggle className="fixed top-4 right-4 z-40 bg-paper border border-quest-border rounded-full w-9 h-9 shadow-cozy" />

      <div className="lg:pl-24">
        {/* ---------------- HERO ---------------- */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          <div className="absolute top-[-120px] left-[-80px] w-[480px] h-[480px] bg-quest-accent/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-140px] right-[-100px] w-[520px] h-[520px] bg-quest-moss/10 rounded-full blur-[130px] pointer-events-none" />

          <div className="relative z-10 max-w-6xl w-full mx-auto px-6 sm:px-10 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-2.5 mb-6">
                <div className="inline-flex w-10 h-10 bg-quest-accent/15 items-center justify-center rounded-full text-quest-accent">
                  <Leaf className="w-5.5 h-5.5" />
                </div>
                <span className="font-sans font-black text-2xl text-ink tracking-tight">Knavi</span>
              </div>

              <Eyebrow>For students who stare at blank to-do lists</Eyebrow>
              <h1 className="font-serif font-black text-4xl sm:text-5xl lg:text-[3.4rem] text-ink leading-[1.05] mt-3">
                Turn any goal into a trail you can actually finish.
              </h1>
              <p className="text-quest-muted text-base sm:text-lg mt-5 leading-relaxed max-w-lg">
                Knavi breaks your homework, projects, and side quests into a mountain trail of 20–30 minute steps.
                One node unlocks at a time, so you always know exactly what's next.
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-8">
                <button
                  onClick={onSignUp}
                  className="flex items-center gap-2 py-3.5 px-7 bg-quest-accent text-white font-sans font-bold rounded-xl shadow-active hover:opacity-90 hover:-translate-y-0.5 transition-all cursor-pointer text-sm"
                >
                  Create free account <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onSignIn}
                  className="py-3.5 px-6 text-ink font-sans font-bold rounded-xl border border-quest-border hover:bg-black/5 transition-colors cursor-pointer text-sm"
                >
                  Sign in
                </button>
                <button
                  onClick={onGuest}
                  disabled={isGuestSubmitting}
                  className="py-3.5 px-2 text-quest-muted hover:text-ink font-sans font-bold text-sm cursor-pointer transition-colors underline underline-offset-4 disabled:opacity-60"
                >
                  {isGuestSubmitting ? 'Entering...' : 'Browse as a guest'}
                </button>
              </div>
            </motion.div>

            <motion.div
              className="relative h-[340px] sm:h-[420px] lg:h-[520px] rounded-[28px] overflow-hidden border border-quest-border shadow-cozy"
              style={{ y: heroParallax }}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <BrandHero />
            </motion.div>
          </div>

          <motion.div
            className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-1 text-quest-muted"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-[11px] font-mono uppercase tracking-widest">See how it works</span>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </section>

        {/* ---------------- ABOUT ---------------- */}
        <section className="max-w-4xl mx-auto px-6 sm:px-10 py-24">
          <Reveal>
            <Eyebrow>Why we built this</Eyebrow>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-ink mt-3 leading-tight">
              Task lists don't move. Trails do.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-quest-muted text-base sm:text-lg leading-relaxed mt-6 max-w-2xl">
              Most to-do apps hand you a wall of text and call it done. Knavi asks Google Gemini to actually plan
              the climb — it turns "study for the AP Calc exam" into steps small enough to start today, and
              specific enough to matter. No vague "work on it" nodes, and no bottomless to-do list staring back at
              you.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="grid grid-cols-3 gap-4 mt-10 max-w-lg">
              {[
                { value: '3–6', label: 'steps per trail' },
                { value: '20–30', label: 'minutes per step' },
                { value: '1', label: 'trail per goal' },
              ].map((s) => (
                <div key={s.label} className="bg-paper border border-quest-border rounded-xl p-4 text-center shadow-cozy">
                  <div className="font-serif font-black text-2xl text-quest-accent">{s.value}</div>
                  <div className="text-[11px] text-quest-muted mt-1 leading-snug">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ---------------- HOW IT WORKS ---------------- */}
        <section className="max-w-5xl mx-auto px-6 sm:px-10 py-24">
          <Reveal>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-ink mt-3">Four steps up the mountain.</h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <div className="flex gap-4 p-5 rounded-2xl bg-paper border border-quest-border shadow-cozy h-full">
                  <span className="font-mono font-black text-2xl text-quest-gold shrink-0 leading-none">{s.n}</span>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-ink">{s.title}</h3>
                    <p className="text-sm text-quest-muted mt-1.5 leading-relaxed">{s.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------------- PERKS ---------------- */}
        <section className="max-w-6xl mx-auto px-6 sm:px-10 py-24">
          <Reveal>
            <Eyebrow>Perks of the climb</Eyebrow>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-ink mt-3">
              Everything waiting on the trail.
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {perks.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.06}>
                <div className="p-5 rounded-2xl bg-paper border border-quest-border shadow-cozy hover:shadow-cozy-hover transition-shadow h-full">
                  <div className="w-10 h-10 rounded-full bg-quest-accent/10 border border-quest-accent/20 flex items-center justify-center text-quest-accent mb-3">
                    <p.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-ink">{p.title}</h3>
                  <p className="text-sm text-quest-muted mt-1.5 leading-relaxed">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------------- DUSK CTA ---------------- */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #16301f 0%, #0d1f15 100%)' }} />
          <div className="absolute inset-0 opacity-40" style={{ filter: 'hue-rotate(200deg) brightness(0.55) saturate(0.7)' }}>
            <BrandHero />
          </div>
          <div className="absolute inset-0" aria-hidden="true">
            {[...Array(24)].map((_, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-white/70"
                style={{
                  width: 2 + (i % 3),
                  height: 2 + (i % 3),
                  left: `${(i * 37) % 100}%`,
                  top: `${(i * 53) % 60}%`,
                  opacity: 0.15 + ((i * 7) % 40) / 100,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-10 py-28 text-center">
            <Reveal>
              <span className="text-4xl block mb-4">🏔️</span>
              <h2 className="font-serif font-black text-3xl sm:text-4xl text-white leading-tight">
                Basecamp's ready when you are.
              </h2>
              <p className="text-white/70 text-base sm:text-lg mt-4 max-w-xl mx-auto">
                Bring one goal. Leave with a trail.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-9">
                <button
                  onClick={onSignUp}
                  className="flex items-center gap-2 py-3.5 px-7 bg-quest-accent text-white font-sans font-bold rounded-xl shadow-active hover:opacity-90 hover:-translate-y-0.5 transition-all cursor-pointer text-sm"
                >
                  Create free account <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onSignIn}
                  className="py-3.5 px-6 text-white font-sans font-bold rounded-xl border border-white/25 hover:bg-white/10 transition-colors cursor-pointer text-sm"
                >
                  Sign in
                </button>
                <button
                  onClick={onGuest}
                  disabled={isGuestSubmitting}
                  className="py-3.5 px-2 text-white/70 hover:text-white font-sans font-bold text-sm cursor-pointer transition-colors underline underline-offset-4 disabled:opacity-60 flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" /> {isGuestSubmitting ? 'Entering...' : 'Enter as guest'}
                </button>
              </div>
            </Reveal>

            <p className="text-white/40 text-xs mt-8 font-mono uppercase tracking-widest">
              No credit card. No spam. Just a mountain and a few steps at a time.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
