import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, Lock, Check, Compass, PenLine, CheckCircle2, Instagram } from 'lucide-react';
import Logo from './Logo';
import Trail from './Trail';
import NodeLegend from './NodeLegend';
import BackgroundScene from './BackgroundScene';
import { Level } from '../types/index';

interface LandingPageProps {
  onSignIn: () => void;          // opens login mode on the auth card
  onSignUp: () => void;          // opens signup mode on the auth card
  onGuest: () => void;           // triggers guest entry
  isGuestSubmitting?: boolean;   // reflects App.tsx's guest-auth in-flight state
}

const SECTIONS = [
  { id: 'hero', label: 'Basecamp' },
  { id: 'how', label: 'How It Works' },
  { id: 'features', label: 'Features' },
  { id: 'about', label: 'About Us' },
];

// Demo levels for the hero's live Trail — this is the SAME Trail.tsx
// component used in the real app, just fed fake data with showClutter off,
// so the marketing page can never visually drift from the product.
const DEMO_LEVELS: Level[] = [
  { id: 'demo-1', task_id: null, user_id: '', title: 'Pick a Topic', description: '', estimated_minutes: 25, branch: 'custom', branch_order: 0, status: 'complete', skipped: false, completed_at: null, depth: 0, parent_level_id: null },
  { id: 'demo-2', task_id: null, user_id: '', title: 'Gather Sources', description: '', estimated_minutes: 25, branch: 'custom', branch_order: 1, status: 'complete', skipped: false, completed_at: null, depth: 0, parent_level_id: null },
  { id: 'demo-3', task_id: null, user_id: '', title: 'Build an Outline', description: '', estimated_minutes: 25, branch: 'custom', branch_order: 2, status: 'active', skipped: false, completed_at: null, depth: 0, parent_level_id: null },
  { id: 'demo-4', task_id: null, user_id: '', title: 'Write Introduction', description: '', estimated_minutes: 25, branch: 'custom', branch_order: 3, status: 'locked', skipped: false, completed_at: null, depth: 0, parent_level_id: null },
  { id: 'demo-5', task_id: null, user_id: '', title: 'Draft & Submit', description: '', estimated_minutes: 25, branch: 'custom', branch_order: 4, status: 'locked', skipped: false, completed_at: null, depth: 0, parent_level_id: null },
];

// The side nav uses the app's own node-state visual language (locked /
// active / done) to represent scroll progress through the page — sections
// behind you read as "done," the current one pulses "active," sections
// ahead are "locked." Same idea as Trail.tsx, just driven by scroll
// position instead of node index.
function SideTrailNav({ activeIndex, onJump }: { activeIndex: number; onJump: (id: string) => void }) {
  return (
    <div className="hidden lg:flex flex-col fixed left-6 top-1/2 -translate-y-1/2 z-40">
      {SECTIONS.map((s, i) => {
        const state: 'done' | 'active' | 'locked' = i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'locked';
        return (
          <div key={s.id} className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => onJump(s.id)}
              aria-label={s.label}
              className="group relative flex items-center cursor-pointer"
            >
              <div
                className={`relative rounded-full flex items-center justify-center shrink-0 transition-transform ${
                  state === 'locked' ? 'w-10 h-10 border-[3px] border-dashed bg-surface' : 'w-12 h-12 border-[5px] bg-wood-gradient'
                } ${state === 'active' ? 'scale-110 shadow-active' : ''} ${state === 'done' ? 'opacity-80' : ''}`}
                style={{
                  borderColor: state === 'locked' ? 'var(--color-line)' : state === 'active' ? '#f0c060' : 'var(--color-trail)',
                }}
              >
                {state === 'active' && (
                  <motion.span
                    className="absolute -inset-1.5 rounded-full border-2"
                    style={{ borderColor: '#f0c060' }}
                    animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
                {state === 'locked' ? (
                  <Lock className="w-4 h-4 text-ink-soft" />
                ) : state === 'done' ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-white" />
                )}
              </div>
              <span
                className={`ml-3 text-[11px] font-mono uppercase tracking-widest whitespace-nowrap transition-opacity ${
                  state === 'active' ? 'opacity-100 text-ink font-bold' : 'opacity-0 group-hover:opacity-100 text-ink-soft'
                }`}
              >
                {s.label}
              </span>
            </button>
            {i < SECTIONS.length - 1 && <div className="w-[3px] h-10" style={{ backgroundColor: 'var(--color-trail)' }} />}
          </div>
        );
      })}
    </div>
  );
}

export default function LandingPage({ onSignIn, onSignUp, onGuest, isGuestSubmitting }: LandingPageProps) {
  const pageRef = useRef<HTMLDivElement>(null);
  const sectionElsRef = useRef<Record<string, HTMLElement | null>>({});
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = SECTIONS.findIndex((s) => s.id === entry.target.id);
          if (idx !== -1) setActiveIndex(idx);
        });
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    );

    // Safely filter and observe elements while keeping TypeScript satisfied
    Object.values(sectionElsRef.current).forEach((el) => {
      if (el instanceof Element) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, (v) => v * 0.32);

  return (
    <div ref={pageRef} className="relative bg-void text-ink overflow-x-hidden">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 w-full pointer-events-none z-0"
        style={{ y: bgY }}
      >
        <BackgroundScene />
      </motion.div>

      <div className="relative z-10">
        {/* NAVBAR */}
        <header className="sticky top-0 z-50 flex items-center justify-between gap-4 px-6 sm:px-10 py-4 bg-void/80 backdrop-blur-md border-b border-line">
          <button
            type="button"
            onClick={() => jumpTo('hero')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <Logo className="w-7 h-8 text-primary" />
            <span className="font-sans font-extrabold text-xl text-ink tracking-tight">Strail</span>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {SECTIONS.slice(1).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => jumpTo(s.id)}
                className="text-sm font-bold text-ink-soft hover:text-primary-dk transition-colors cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={onSignUp}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white font-bold text-sm shadow-active hover:opacity-90 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </header>

        <SideTrailNav activeIndex={activeIndex} onJump={jumpTo} />

        {/* HERO */}
        <section
          id="hero"
          ref={(el) => { sectionElsRef.current.hero = el; }}
          className="max-w-6xl mx-auto px-6 sm:px-10 pt-16 sm:pt-20 pb-6 text-center"
        >
          <span className="inline-flex items-center gap-2 bg-surface border border-line text-primary-dk font-mono font-semibold text-xs tracking-wide px-3.5 py-1.5 rounded-full mb-6">
            🥾 TRAIL-01 · Built for students
          </span>
          <h1 className="font-sans font-extrabold text-[clamp(32px,4.6vw,56px)] leading-[1.08] tracking-tight text-ink max-w-3xl mx-auto">
            Stop Overwhelm.
            <br />
            Turn Big Goals Into <span className="text-primary-dk">Small Steps.</span>
          </h1>
          <p className="mt-5 text-ink-soft text-base sm:text-lg leading-relaxed max-w-md mx-auto">
            Strail is the gamified path tracker that breaks your academics, hobbies, and projects into a trail you
            can actually walk — one step at a time.
          </p>
          <div className="flex flex-wrap gap-3 justify-center items-center mt-7">
            <button
              type="button"
              onClick={onSignUp}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-bold text-sm shadow-active hover:opacity-90 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Create free account <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onSignIn}
              className="px-6 py-3 rounded-full bg-surface text-ink font-bold text-sm border-2 border-line hover:border-trail-dk transition-colors cursor-pointer"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={onGuest}
              disabled={isGuestSubmitting}
              className={`px-4 py-3 font-bold text-sm underline transition-colors ${
                isGuestSubmitting ? 'text-ink-soft/60 cursor-not-allowed' : 'text-ink-soft hover:text-primary-dk cursor-pointer'
              }`}
            >
              {isGuestSubmitting ? 'Entering...' : 'Browse as a guest'}
            </button>
          </div>

          {/* SIGNATURE: real Trail.tsx, fed demo data, clutter off for a clean preview */}
          <div className="mt-14 max-w-4xl mx-auto text-left">
            <Trail
              levels={DEMO_LEVELS}
              selectedLevelId={null}
              onSelect={() => {}}
              title="🗺️ RESEARCH PAPER TRAIL"
              showClutter={false}
            />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how"
          ref={(el) => { sectionElsRef.current.how = el; }}
          className="max-w-6xl mx-auto px-6 sm:px-10 py-20"
        >
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-primary-dk font-mono font-semibold text-xs tracking-wide uppercase block mb-2">
              How It Works
            </span>
            <h2 className="font-sans font-extrabold text-[clamp(26px,3vw,36px)] tracking-tight">
              From overwhelmed to moving, in four steps.
            </h2>
            <p className="mt-3 text-ink-soft text-[15.5px] leading-relaxed">
              Strail turns any goal — big or small — into a clear, walkable trail.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { num: '01', title: 'Pick a Goal', body: 'Tell Strail what you want to accomplish, from an essay to a new hobby.', comingSoon: false },
              { num: '02', title: 'Get Your Trail', body: 'Strail turns your goal into a sequence of manageable waypoints.', comingSoon: false },
              { num: '03', title: 'Zoom In', body: 'Stuck on a step? Break it down again into smaller actions.', comingSoon: false },
              { num: '04', title: 'Group Trails', body: 'Walk a trail alongside classmates. Coming soon.', comingSoon: true },
            ].map((step) => (
              <div
                key={step.num}
                className={`bg-surface rounded-[22px] p-6 text-left shadow-cozy ${
                  step.comingSoon ? 'border-2 border-dashed border-trail-dk' : 'border border-line'
                }`}
              >
                <div className="w-[34px] h-[34px] rounded-[10px] bg-trail text-[#5A4B22] font-mono font-bold text-sm flex items-center justify-center mb-4">
                  {step.num}
                </div>
                <h3 className="font-bold text-[16.5px] mb-2">{step.title}</h3>
                <p className="text-[13.5px] text-ink-soft leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES — reuses the real NodeLegend component */}
        <section
          id="features"
          ref={(el) => { sectionElsRef.current.features = el; }}
          className="max-w-6xl mx-auto px-6 sm:px-10 py-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="bg-surface border border-line rounded-[26px] p-8 sm:p-10 shadow-cozy">
              <NodeLegend />
            </div>

            <div className="flex flex-col gap-6">
              <span className="text-primary-dk font-mono font-semibold text-xs tracking-wide uppercase">
                Features
              </span>
              <h2 className="font-sans font-extrabold text-2xl sm:text-[26px] -mt-4 leading-snug">
                Every waypoint tells you what it's about — at a glance.
              </h2>

              {[
                { icon: Compass, title: 'Smart hint icons', body: "Each step shows a small emoji hinting at its content — a protractor for trigonometry practice, a guitar for a music step." },
                { icon: PenLine, title: 'One clear focus', body: 'Only one waypoint is ever "Active," with a soft pulsing ring, so you always know exactly what\'s next.' },
                { icon: CheckCircle2, title: 'Visible momentum', body: 'Completed waypoints get a checkmark badge and settle back slightly, so progress is always visible along the trail.' },
              ].map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div className="w-[42px] h-[42px] rounded-xl bg-trail flex items-center justify-center shrink-0">
                    <f.icon className="w-5 h-5 text-[#5A4B22]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[15.5px] mb-1">{f.title}</h4>
                    <p className="text-[13.5px] text-ink-soft leading-relaxed">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT / CTA */}
        <section
          id="about"
          ref={(el) => { sectionElsRef.current.about = el; }}
          className="max-w-6xl mx-auto px-6 sm:px-10 pb-4"
        >
          <div
            className="max-w-6xl mx-auto rounded-[30px] border border-line text-center p-10 sm:p-14"
            style={{ background: 'linear-gradient(160deg, #EAF7EE, #F3ECD3)' }}
          >
            <h2 className="font-sans font-extrabold text-[clamp(24px,3vw,34px)] mb-3">
              Your trail starts with one small step.
            </h2>
            <p className="text-ink-soft text-[15.5px] mb-6">
              Join students turning overwhelm into steady, visible progress.
            </p>
            <button
              type="button"
              onClick={onSignUp}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-bold text-sm shadow-active hover:opacity-90 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Start Your Journey <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="max-w-6xl mx-auto px-6 sm:px-10 py-8 flex flex-wrap items-center justify-between gap-4 border-t border-line text-[13.5px] text-ink-soft">
          <div className="flex items-center gap-2.5">
            <Logo className="w-5 h-6 text-primary" />
            <span className="font-bold text-ink">Strail</span>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <a href="#" className="flex items-center gap-1.5 font-bold text-ink-soft hover:text-primary-dk transition-colors">
              <Instagram className="w-4 h-4" /> Instagram
            </a>
            <a href="#" className="font-bold text-ink-soft hover:text-primary-dk transition-colors">Privacy Policy</a>
            <a href="#" className="font-bold text-ink-soft hover:text-primary-dk transition-colors">Terms &amp; Conditions</a>
          </div>
          <div className="font-mono text-[11px] tracking-wide">© 2026 STRAIL · SMALL STEPS, REAL PROGRESS</div>
        </footer>
      </div>
    </div>
  );
}