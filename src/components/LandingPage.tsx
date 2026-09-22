import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import { useScrollDepthTracking } from '../lib/useScrollDepth';

interface LandingPageProps {
  onSignIn: () => void;          // opens login mode on the auth card
  onSignUp: () => void;          // opens signup mode on the auth card
  onGuest: () => void;           // triggers guest entry
  isGuestSubmitting?: boolean;   // reflects App.tsx's guest-auth in-flight state
}

// ============================================================================
// Node shape math — every node on the trail uses the exact same rounded
// hexagon + offset "wall" stack (the pseudo-3D puck effect), so it's pure
// geometry computed once at module load rather than per render or per node.
// ============================================================================
type Pt = { x: number; y: number };

function hexPoints(cx: number, cy: number, r: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 90); // pointy top & bottom
    pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  return pts;
}

function roundedPolygonPath(points: Pt[], radius: number): string {
  const n = points.length;
  const d: string[] = [];
  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const curr = points[i];
    const next = points[(i + 1) % n];

    const v1x = prev.x - curr.x, v1y = prev.y - curr.y;
    const v1len = Math.hypot(v1x, v1y);
    const p1 = { x: curr.x + (v1x / v1len) * radius, y: curr.y + (v1y / v1len) * radius };

    const v2x = next.x - curr.x, v2y = next.y - curr.y;
    const v2len = Math.hypot(v2x, v2y);
    const p2 = { x: curr.x + (v2x / v2len) * radius, y: curr.y + (v2y / v2len) * radius };

    d.push((i === 0 ? 'M ' : 'L ') + p1.x.toFixed(2) + ' ' + p1.y.toFixed(2));
    d.push('Q ' + curr.x.toFixed(2) + ' ' + curr.y.toFixed(2) + ' ' + p2.x.toFixed(2) + ' ' + p2.y.toFixed(2));
  }
  d.push('Z');
  return d.join(' ');
}

const NODE_FRONT_PATH = roundedPolygonPath(hexPoints(50, 50, 46), 14);
const NODE_WALL_PATHS: string[] = (() => {
  const offsetX = -3, offsetY = 4, steps = 5;
  const paths: string[] = [];
  for (let i = steps; i >= 1; i--) {
    const t = i / steps;
    paths.push(roundedPolygonPath(hexPoints(50 + offsetX * t, 50 + offsetY * t, 46), 14));
  }
  return paths;
})();

/** Every node on the page renders through this — the gradient front face
 *  with the stepped dark-green "wall" behind it that reads as a 3D puck. */
function NodeGraphic() {
  return (
    <svg className="node" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <g>
        {NODE_WALL_PATHS.map((d, i) => (
          <path key={i} d={d} fill="#14311C" />
        ))}
      </g>
      <path d={NODE_FRONT_PATH} fill="url(#lp2NodeFill)" />
    </svg>
  );
}

// ---- smooth bezier-through-points helpers. The vertical one is the same
// technique Trail.tsx already uses for the real in-app trail; the
// horizontal one is its mirror image, used for the background waves.
function smoothPathVertical(points: Pt[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1], p1 = points[i];
    const midY = (p0.y + p1.y) / 2;
    d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
  }
  return d;
}

function smoothPathHorizontal(points: Pt[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1], p1 = points[i];
    const midX = (p0.x + p1.x) / 2;
    d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

const FEATURES = [
  { title: 'AI trail-building', body: 'Describe a goal — Strail drafts and sequences actionable nodes dynamically.' },
  { title: 'Protected time', body: 'Block off practice and rest before the week fills up without overwhelming yourself.' },
  { title: 'Public journeys', body: 'Browse trails other students walked, see how they broke it down, and fork one.' },
  { title: "Streaks that don't guilt you", body: 'Miss a day and the trail reshuffles gracefully — no shame, no reset.' },
];

const JOURNEYS = [
  { title: 'Robotics build season', body: '34 sequential milestones', nodes: '34 nodes' },
  { title: 'Common App, start to submit', body: '21 manageable steps', nodes: '21 nodes' },
  { title: 'Learn to solo a 12-bar blues', body: '16 practice sessions', nodes: '16 nodes' },
];

const HOW_STEPS = [
  { n: '01', title: 'Tell it your goal', body: "A class, a competition, a college app, a habit you keep dropping — say what you're aiming for, in your own words." },
  { n: '02', title: 'Strail lays the trail', body: 'It breaks the goal into small nodes sized for a single sitting, in an order that actually makes sense.' },
  { n: '03', title: 'You walk it, node by node', body: 'Finish one, the next lights up. No wall of tasks staring back at you — just the next right step.' },
  { n: '04', title: 'Your week protects itself', body: "Strail schedules nodes around the time you've already promised to practice, work, or rest." },
];

export default function LandingPage({ onSignIn, onSignUp, onGuest, isGuestSubmitting }: LandingPageProps) {
  useScrollDepthTracking('Main Landing');
  const location = useLocation();

  // Honors SiteFooter's cross-page section jumps (About/How it works/
  // Features/Journeys from Privacy/Terms) exactly the way it already
  // expects: read location.state.scrollTo once, scroll there, clear it.
  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (scrollTo) {
      const el = document.getElementById(scrollTo);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      window.history.replaceState({}, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const waveSvgRef = useRef<SVGSVGElement>(null);
  const trailSvgRef = useRef<SVGSVGElement>(null);
  const bgPathRef = useRef<SVGPathElement>(null);
  const fgPathRef = useRef<SVGPathElement>(null);

  const heroNodeRef = useRef<HTMLDivElement>(null);
  const problemNodeRef = useRef<HTMLDivElement>(null);
  const howNodeRef = useRef<HTMLDivElement>(null);
  const featuresNodeRef = useRef<HTMLDivElement>(null);
  const journeysNodeRef = useRef<HTMLDivElement>(null);
  const endNodeRef = useRef<HTMLDivElement>(null);

  const problemSectionRef = useRef<HTMLElement>(null);
  const journeysSectionRef = useRef<HTMLElement>(null);
  const ctaSectionRef = useRef<HTMLElement>(null);
  const problemBgRef = useRef<HTMLDivElement>(null);
  const journeysBgRef = useRef<HTMLDivElement>(null);
  const ctaBgRef = useRef<HTMLDivElement>(null);

  const trailStartY = useRef(0);
  const trailEndY = useRef(0);
  const cachedLength = useRef(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const waveSvg = waveSvgRef.current;
    const trailSvg = trailSvgRef.current;
    const bgPath = bgPathRef.current;
    const fgPath = fgPathRef.current;
    if (!wrapper || !waveSvg || !trailSvg || !bgPath || !fgPath) return;

    const nodeEls = [
      heroNodeRef.current,
      problemNodeRef.current,
      howNodeRef.current,
      featuresNodeRef.current,
      journeysNodeRef.current,
      endNodeRef.current,
    ];
    const sectionBgs = [
      { el: problemBgRef.current, target: problemSectionRef.current },
      { el: journeysBgRef.current, target: journeysSectionRef.current },
      { el: ctaBgRef.current, target: ctaSectionRef.current },
    ];

    function nodeCenters(): Pt[] {
      const wrapperRect = wrapper!.getBoundingClientRect();
      return nodeEls.map((el) => {
        const r = el!.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - wrapperRect.left,
          y: r.top + r.height / 2 - wrapperRect.top,
        };
      });
    }

    function positionSectionBackgrounds() {
      const wrapperRect = wrapper!.getBoundingClientRect();
      sectionBgs.forEach(({ el, target }) => {
        if (!el || !target) return;
        const r = target.getBoundingClientRect();
        el.style.top = r.top - wrapperRect.top + 'px';
        el.style.height = r.height + 'px';
      });
    }

    function updateWaveBackground() {
      const docHeight = wrapper!.scrollHeight;
      const width = wrapper!.clientWidth;
      waveSvg!.setAttribute('width', String(width));
      waveSvg!.setAttribute('height', String(docHeight));
      waveSvg!.setAttribute('viewBox', `0 0 ${width} ${docHeight}`);

      const spacing = 220;
      const count = Math.ceil(docHeight / spacing) + 1;
      const step = Math.max(36, width / 14);
      let html = '';
      for (let i = 0; i < count; i++) {
        const baseY = i * spacing + 70;
        const amplitude = 16 + (i % 3) * 6;
        const wavelength = width / (1.6 + (i % 2) * 0.6);
        const phase = (i % 2) * Math.PI;
        const pts: Pt[] = [];
        for (let x = 0; x <= width; x += step) {
          pts.push({ x, y: baseY + amplitude * Math.sin((x / wavelength) * Math.PI * 2 + phase) });
        }
        if (pts[pts.length - 1].x < width) {
          pts.push({ x: width, y: baseY + amplitude * Math.sin((width / wavelength) * Math.PI * 2 + phase) });
        }
        html += `<path d="${smoothPathHorizontal(pts)}"></path>`;
      }
      waveSvg!.innerHTML = html;
    }

    function updateTrailPath() {
      const docHeight = wrapper!.scrollHeight;
      trailSvg!.setAttribute('height', String(docHeight));
      trailSvg!.setAttribute('width', String(wrapper!.clientWidth));
      trailSvg!.setAttribute('viewBox', `0 0 ${wrapper!.clientWidth} ${docHeight}`);

      positionSectionBackgrounds();

      const pts = nodeCenters();
      trailStartY.current = pts[0].y;
      trailEndY.current = pts[pts.length - 1].y;
      const d = smoothPathVertical(pts);
      bgPath!.setAttribute('d', d);
      fgPath!.setAttribute('d', d);
      cachedLength.current = fgPath!.getTotalLength();
      fgPath!.style.strokeDasharray = String(cachedLength.current);
      updateScrollProgress();
    }

    function updateScrollProgress() {
      if (!cachedLength.current) return;

      const wrapperRect = wrapper!.getBoundingClientRect();
      const viewportY = window.innerHeight / 2 - wrapperRect.top;

      const points = nodeCenters();

      const calibration = [
        { y: points[0].y, progress: 0.00 },
        { y: points[1].y, progress: 0.12 },
        { y: points[2].y, progress: 0.35 },
        { y: points[3].y, progress: 0.60 },
        { y: points[4].y, progress: 0.83 },
        { y: points[5].y, progress: 1.00 },
      ];

      let progress = 0;

      for (let i = 0; i < calibration.length - 1; i++) {
        const a = calibration[i];
        const b = calibration[i + 1];

        if (viewportY >= a.y && viewportY <= b.y) {
          const t = (viewportY - a.y) / (b.y - a.y);
          progress = a.progress + t * (b.progress - a.progress);
          break;
        }

        if (viewportY > b.y) {
          progress = b.progress;
        }
      }

      progress = Math.min(1, Math.max(0, progress));

      fgPath!.style.strokeDashoffset =
        String(cachedLength.current * (1 - progress));
    }

    

    let rafScroll: number | null = null;
    const onScroll = () => {
      if (rafScroll) return;
      rafScroll = requestAnimationFrame(() => {
        updateScrollProgress();
        rafScroll = null;
      });
    };

    let rafResize: number | null = null;
    const onResize = () => {
      if (rafResize) return;
      rafResize = requestAnimationFrame(() => {
        updateTrailPath();
        updateWaveBackground();
        rafResize = null;
      });
    };

    updateTrailPath();
    updateWaveBackground();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(document.body);

    let cancelled = false;
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (!cancelled) {
          updateTrailPath();
          updateWaveBackground();
        }
      });
    }

    return () => {
      cancelled = true;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      resizeObserver.disconnect();
      if (rafScroll) cancelAnimationFrame(rafScroll);
      if (rafResize) cancelAnimationFrame(rafResize);
    };
  }, []);

  return (
    <div className="lp2">
      <style>{`
        .lp2 { position: relative; background: var(--lp2-cream); color: var(--lp2-ink); font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden;
          --lp2-cream: #FAF8F5; --lp2-cream-deep: #F1EBDE; --lp2-card: rgba(250, 248, 245, 0.72); --lp2-card-border: rgba(200, 140, 34, 0.22);
          --lp2-gold-1: #F8DA89; --lp2-gold-2: #EBB448; --lp2-gold-3: #C88C22;
          --lp2-forest-1: #3B8E53; --lp2-forest-2: #265C35; --lp2-forest-3: #14311C;
          --lp2-ink: #231F18; --lp2-ink-soft: rgba(35, 31, 24, 0.64); --lp2-ink-faint: rgba(35, 31, 24, 0.42);
          --lp2-on-dark: #FAF8F5; --lp2-on-dark-soft: rgba(250, 248, 245, 0.66);
        }
        .lp2, .lp2 *, .lp2 *::before, .lp2 *::after { box-sizing: border-box; }
        .lp2 a { color: inherit; }
        .lp2 img { max-width: 100%; display: block; }
        .lp2 button { font: inherit; }

        .lp2-wrapper { position: relative; overflow: hidden;}
        #lp2-wave-bg { position: absolute; inset: 0; z-index: 2; pointer-events: none; width: 100%; }
        #lp2-wave-bg path { fill: none; stroke: rgba(107, 74, 46, 0.13); stroke-width: 1.2; }
        #lp2-trail-svg { position: absolute; inset: 0; z-index: 10; pointer-events: none; width: 100%; }
        #lp2-trail-svg path { fill: none; }
        #lp2-trail-bg { stroke: var(--lp2-gold-2); stroke-opacity: 0.22; stroke-width: 26; stroke-linecap: round; }
        #lp2-trail-fg { stroke: url(#lp2GoldStroke); stroke-width: 26; stroke-linecap: round; }

        .lp2-section-bg { position: absolute; left: 0; width: 100%; z-index: 5; background: var(--lp2-cream-deep); pointer-events: none; overflow: hidden; }
        .lp2-section-bg.lp2-bg-forest { background: linear-gradient(180deg, var(--lp2-cream-deep) 0%, var(--lp2-forest-3) 190px, var(--lp2-forest-3) 100%); }
        .lp2-cta-mountains { position: absolute; left: 0; bottom: 0; width: 100%; height: clamp(170px, 26vw, 260px); display: block; }

        .lp2-node-layer { position: relative; z-index: 20; }
        .lp2-content-layer { position: relative; z-index: 30; }

        .lp2-header { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; padding: 18px clamp(20px, 5vw, 56px); background: rgba(250, 248, 245, 0.86); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(35, 31, 24, 0.06); }
        .lp2-logo { display: flex; align-items: center; gap: 10px; font-weight: 800; letter-spacing: 0.06em; font-size: 18px; text-decoration: none; cursor: pointer; background: none; border: none; padding: 0; color: var(--lp2-ink); }
        .lp2-logo-dot { width: 54px; height: 54px; border-radius: 50%; background: rgba(250, 248, 245, 0); flex-shrink: 0; }
        .lp2-main-nav { display: flex; align-items: center; gap: 28px; font-size: 14.5px; }
        .lp2-main-nav a { text-decoration: none; color: var(--lp2-ink-soft); cursor: pointer; }
        .lp2-main-nav a:hover { color: var(--lp2-ink); }
        .lp2-nav-signin { text-decoration: none; color: var(--lp2-ink); font-weight: 600; font-size: 14px; background: none; border: none; cursor: pointer; padding: 0; font-family: inherit; }
        .lp2-nav-signin:hover { opacity: 0.7; }
        .lp2-header-actions { display: flex; align-items: center; gap: 16px; }
        @media (max-width: 860px) { .lp2-main-nav { display: none; } }

        .lp2-pill {display: inline-flex; align-items: center; justify-content: center; padding: 11px 22px; border-radius: 999px; font-weight: 700; font-size: 14px; letter-spacing: 0.01em; border: none; cursor: pointer; text-decoration: none; font-family: inherit; transform: translateY(0); transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease, border-color 0.12s ease;}
        .lp2-pill-dark { background: var(--lp2-forest-3); color: var(--lp2-on-dark); box-shadow: 0 4px 0 rgba(8, 21, 12, 0.9);}
        .lp2-pill-dark:active {transform: translateY(4px); box-shadow: none;}
        .lp2-pill-dark:hover { transform: translateY(2px); box-shadow: 0 2px 0 rgba(8, 21, 12, 0.9); }
        .lp2-pill-light { background: var(--lp2-cream); color: var(--lp2-ink); box-shadow: 0 4px 0 rgba(180, 175, 165, 0.9);}
        .lp2-pill-light:hover { transform: translateY(2px); box-shadow: 0 2px 0 rgba(180, 175, 165, 0.9);}
        .lp2-pill-light:active {transform: translateY(4px); box-shadow: none;}
        .lp2-pill-outline {background: transparent; color: var(--lp2-on-dark); border: 1.5px solid rgba(250,248,245,0.45); box-shadow: 0 4px 0 rgba(15, 41, 22, 0.9);}
        .lp2-pill-outline:hover {border-color: rgba(250,248,245,0.8); transform: translateY(2px); box-shadow: 0 2px 0 rgba(15, 41, 22, 0.9);}
        .lp2-pill-outline:active {transform: translateY(4px);box-shadow: none;}

        .lp2 section { position: relative; padding: clamp(64px, 10vw, 120px) clamp(20px, 6vw, 64px); }
        .lp2-section-inner { max-width: 1180px; margin: 0 auto; }
        .lp2-eyebrow { display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: var(--lp2-gold-3); }
        .lp2-eyebrow-dark { color: var(--lp2-gold-1); }
        .lp2-heading { margin: 14px 0 0; font-weight: 800; letter-spacing: -0.01em; font-size: clamp(28px, 4vw, 42px); line-height: 1.12; color: var(--lp2-ink); max-width: 16ch; }
        .lp2-lede { margin: 18px 0 0; color: var(--lp2-ink-soft); font-size: 17px; line-height: 1.65; max-width: 46ch; }

        .lp2 .node { display: block; width: 100%; aspect-ratio: 1 / 1; overflow: visible; filter: drop-shadow(0 20px 36px rgba(20, 49, 28, 0.32)); }

        #lp2-hero-section { padding-top: clamp(12px, 2.5vw, 24px); padding-bottom: clamp(24px, 4vw, 40px); }
        .lp2-hero-inner { max-width: 760px; margin: 0 auto; text-align: center; }
        .lp2-hero-node-wrap { position: relative; margin: 0 auto; width: min(65vw, 500px); }
        .lp2-hero-node-content { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8% 14% 12%; text-align: center; }
        .lp2-hero-node-scrim { position: absolute; left: 50%; top: 46%; transform: translate(-50%, -50%); width: 92%; height: 58%; background: radial-gradient(ellipse at center, rgba(15, 38, 23, 0.34) 0%, rgba(15, 38, 23, 0) 72%); z-index: -1; }
        .lp2-hero-title { margin: 0; color: var(--lp2-on-dark); font-weight: 800; letter-spacing: -0.015em; font-size: clamp(26px, 4.6vw, 40px); line-height: 1.06; }
        .lp2-hero-cta-row { margin-top: clamp(16px, 3vw, 26px); display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
        .lp2-hero-below { margin-top: clamp(16px, 2.4vw, 24px); }
        .lp2-hero-below p { margin: 0; color: var(--lp2-ink-soft); font-size: 16px; line-height: 1.65; max-width: 46ch; margin-inline: auto; }
        .lp2-guest-link { margin-top: 12px; background: none; border: none; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 600; color: var(--lp2-ink-faint); text-decoration: underline; display: block; margin-inline: auto; }
        .lp2-guest-link:hover { color: var(--lp2-ink-soft); }
        .lp2-guest-link:disabled { cursor: not-allowed; opacity: 0.6; }
        .lp2-scroll-hint { position: absolute; left: 50%; top: 75%; transform: translate(-50%, -50%); font-family: 'JetBrains Mono', monospace; font-size: 11px; white-space: nowrap; letter-spacing: 0.14em; color: var(--lp2-on-dark-soft); display: flex; align-items: center; justify-content: center; gap: 8px; }
        .lp2-scroll-hint svg { animation: lp2-bob 1.8s ease-in-out infinite; }
        @keyframes lp2-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(4px); } }

        .lp2-split { display: grid; grid-template-columns: 220px 1fr; gap: clamp(24px, 5vw, 64px); align-items: center; }
        .lp2-split.lp2-right { grid-template-columns: 1fr 220px; }
        .lp2-split .lp2-node-col { display: flex; justify-content: center; }
        .lp2-split.lp2-right .lp2-node-col { order: 2; }
        .lp2-split.lp2-right .lp2-content-col { order: 1; }
        .lp2-waypoint-node { position: relative; width: 168px; }
        .lp2-waypoint-label { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 12%; }
        .lp2-waypoint-label span { font-family: 'JetBrains Mono', monospace; font-size: 16.5px; font-weight: 700; letter-spacing: 0.08em; color: var(--lp2-on-dark); text-align: center; line-height: 1.3; }

        .lp2-problem-quote { margin-top: 28px; padding-top: 22px; border-top: 1px solid rgba(200,140,34,0.28); font-weight: 700; line-height: 1.5; color: var(--lp2-forest-2); font-size: clamp(19px, 2.3vw, 24px); max-width: 38ch; }

        .lp2-how-grid { margin-top: 36px; display: grid; grid-template-columns: 0.95fr 1.05fr; gap: clamp(24px, 4vw, 44px); align-items: start; }
        .lp2-how-steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 24px; }
        .lp2-how-steps li { position: relative; padding-left: 46px; }
        .lp2-step-num { position: absolute; left: 0; top: 0; width: 32px; height: 32px; border-radius: 50%; border: 1px solid rgba(200,140,34,0.4); background: var(--lp2-cream); color: var(--lp2-gold-3); font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 600; display: grid; place-items: center; }
        .lp2-how-steps h3 { margin: 0; font-size: 16px; font-weight: 700; }
        .lp2-how-steps p { margin: 4px 0 0; font-size: 14px; color: var(--lp2-ink-soft); line-height: 1.6; }
        .lp2-laptop-screen { width: 90%; margin: 0 auto; background: rgba(84, 83, 80, 0.5); border: 7px solid rgba(24, 24, 24, 0.72); border-radius: 14px 14px 4px 4px; padding: 22px 22px 26px; box-shadow: 0 22px 44px -20px rgba(20,49,28,0.45); }
        .lp2-laptop-base { height: 12px; margin: 0 auto; width: 92%; background: linear-gradient(180deg, rgba(29, 84, 25, 1), rgba(16, 47, 14, 1)); border-radius: 0 0 10px 10px; }
        .lp2-laptop-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.12em; color: var(--lp2-gold-1); text-transform: uppercase; margin: 0 0 16px; }
        .lp2-mini-node-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .lp2-mini-node-row:last-child { margin-bottom: 0; }
        .lp2-mini-dot { flex-shrink: 0; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; }
        .lp2-mini-dot.lp2-complete { background: linear-gradient(135deg, rgba(47, 139, 40, 1), rgba(25, 72, 21, 1)); }
        .lp2-mini-dot.lp2-active { background: var(--lp2-gold-1); box-shadow: 0 0 0 3px rgba(3, 92, 6, 0.28); }
        .lp2-mini-dot.lp2-locked { border: 1.5px dashed rgba(250,248,245,0.38); }
        .lp2-mini-node-row .lp2-mini-label { font-size: 13.5px; color: var(--lp2-on-dark); font-weight: 600; }
        .lp2-mini-node-row.lp2-locked .lp2-mini-label { color: var(--lp2-on-dark-soft); font-weight: 500; }

        .lp2-card-grid { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .lp2-card { padding: 26px 24px; border-radius: 20px; background: var(--lp2-card); border: 1px solid var(--lp2-card-border); backdrop-filter: blur(12px); transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
        .lp2-card:hover { transform: translateY(-3px); border-color: rgba(200,140,34,0.5); box-shadow: 0 16px 30px -20px rgba(20,49,28,0.35); }
        .lp2-card h3 { margin: 0; font-size: 17px; font-weight: 700; }
        .lp2-card p { margin: 8px 0 0; font-size: 14.5px; line-height: 1.6; color: var(--lp2-ink-soft); }

        .lp2-journey-list { margin-top: 32px; display: flex; flex-direction: column; gap: 12px; }
        .lp2-journey-card { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 22px; border-radius: 18px; background: var(--lp2-card); border: 1px solid var(--lp2-card-border); backdrop-filter: blur(12px); transition: transform 0.2s ease, border-color 0.2s ease; }
        .lp2-journey-card:hover { transform: translateY(-2px); border-color: rgba(200,140,34,0.5); }
        .lp2-journey-card h3 { margin: 0 0 4px; font-size: 16px; font-weight: 700; }
        .lp2-journey-card p { margin: 0; font-size: 13.5px; color: var(--lp2-ink-soft); }
        .lp2-node-count { flex-shrink: 0; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: var(--lp2-gold-3); background: rgba(235, 180, 72, 0.14); padding: 7px 14px; border-radius: 999px; white-space: nowrap; }

        #lp2-cta-section { overflow: hidden; }
        #lp2-cta-section .lp2-eyebrow { display: block; text-align: center; }
        .lp2-end-below { margin-top: clamp(18px, 2.6vw, 26px); text-align: center; }
        .lp2-end-below p { margin: 0; color: var(--lp2-on-dark-soft); font-size: 16px; line-height: 1.65; max-width: 46ch; margin-inline: auto; }
        .lp2-sparkle { position: absolute; border-radius: 50%; background: var(--lp2-gold-1); box-shadow: 0 0 8px 2px rgba(248, 218, 137, 0.4); animation: lp2-sparkle-pulse 3s ease-in-out infinite; }
        @keyframes lp2-sparkle-pulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.85; } }

        .lp2-footer { background: var(--lp2-forest-3); color: rgba(250, 248, 245, 0.7); padding: 56px clamp(20px, 6vw, 64px) 28px; }
        .lp2-footer-grid { max-width: 1180px; margin: 0 auto; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 40px; }
        .lp2-footer-brand { display: flex; align-items: center; gap: 10px; font-weight: 800; color: var(--lp2-on-dark); text-decoration: none; font-size: 16px; background: none; border: none; cursor: pointer; padding: 0; font-family: inherit; }
        .lp2-footer-tagline { margin: 10px 0 0; font-size: 13.5px; max-width: 26ch; color: rgba(250,248,245,0.55); }
        .lp2-footer-cols { display: flex; flex-wrap: wrap; gap: 44px; }
        .lp2-footer-col p { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.12em; color: rgba(250,248,245,0.4); text-transform: uppercase; margin: 0 0 12px; }
        .lp2-footer-col ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 9px; font-size: 14px; }
        .lp2-footer-col a, .lp2-footer-col button { text-decoration: none; color: inherit; background: none; border: none; cursor: pointer; padding: 0; font-size: inherit; font-family: inherit; text-align: left; }
        .lp2-footer-col a:hover, .lp2-footer-col button:hover { opacity: 0.8; }
        .lp2-footer-bottom { max-width: 1180px; margin: 40px auto 0; padding-top: 20px; border-top: 1px solid rgba(250,248,245,0.1); font-size: 12px; color: rgba(250,248,245,0.4); }

        @media (max-width: 760px) {
          .lp2-split, .lp2-split.lp2-right { grid-template-columns: 1fr; }
          .lp2-split .lp2-node-col, .lp2-split.lp2-right .lp2-node-col { order: -1; }
          .lp2-waypoint-node { width: 128px; }
          .lp2-card-grid { grid-template-columns: 1fr; }
          .lp2-how-grid { grid-template-columns: 1fr; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lp2 *, .lp2 *::before, .lp2 *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <header className="lp2-header">
        <a className="lp2-logo" href="#top">
          <img
            className="lp2-logo-dot"
            src="/strail-logo.png"
            alt=""
          /> STRAIL
        </a>
        <nav className="lp2-main-nav">
          <a href="#about">About</a>
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#journeys">Journeys</a>
          <Link to="/blog">Blog</Link>
        </nav>
        <div className="lp2-header-actions">
          <button type="button" className="lp2-nav-signin" onClick={onSignIn}>Sign in</button>
          <button type="button" className="lp2-pill lp2-pill-dark" onClick={onSignUp}>Get started</button>
        </div>
      </header>

      <div className="lp2-wrapper" ref={wrapperRef}>
        <svg ref={waveSvgRef} id="lp2-wave-bg" xmlns="http://www.w3.org/2000/svg" />

        <svg ref={trailSvgRef} id="lp2-trail-svg" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lp2GoldStroke" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F8DA89" />
              <stop offset="55%" stopColor="#EBB448" />
              <stop offset="100%" stopColor="#C88C22" />
            </linearGradient>
            <linearGradient id="lp2NodeFill" x1="0.15" y1="0" x2="0.85" y2="1">
              <stop offset="0%" stopColor="#3B8E53" />
              <stop offset="55%" stopColor="#265C35" />
              <stop offset="100%" stopColor="#14311C" />
            </linearGradient>
          </defs>
          <path ref={bgPathRef} id="lp2-trail-bg" d="" />
          <path ref={fgPathRef} id="lp2-trail-fg" d="" />
        </svg>

        <div className="lp2-section-bg" ref={problemBgRef} aria-hidden="true" />
        <div className="lp2-section-bg" ref={journeysBgRef} aria-hidden="true" />
        <div className="lp2-section-bg lp2-bg-forest" ref={ctaBgRef} aria-hidden="true">
          <svg className="lp2-cta-mountains" viewBox="0 0 1440 260" preserveAspectRatio="none">
            <path d="M0 260 L0 170 L120 60 L230 150 L340 40 L460 160 L600 70 L760 180 L900 50 L1080 170 L1250 90 L1440 200 L1440 260 Z" fill="#0e2214ff" />
            <path d="M0 260 L0 210 Q180 150 360 200 T720 190 T1080 205 T1440 195 L1440 260 Z" fill="#08150cff" />
          </svg>
        </div>

        <main className="lp2-content-layer">
          {/* ================= HERO ================= */}
          <section id="top" style={{ paddingTop: 'clamp(12px, 2.5vw, 24px)', paddingBottom: 'clamp(24px, 4vw, 40px)' }}>
            <div className="lp2-hero-inner">
              <div className="lp2-hero-node-wrap lp2-node-layer" ref={heroNodeRef}>
                <NodeGraphic />
                <div className="lp2-hero-node-content">
                  <div className="lp2-hero-node-scrim" />
                  <h1 className="lp2-hero-title">One step at a time.</h1>
                  <div className="lp2-hero-cta-row">
                    <button type="button" className="lp2-pill lp2-pill-light" onClick={onSignUp}>Start your Trail</button>
                    <a className="lp2-pill lp2-pill-outline" onClick={onGuest}>Try as Guest</a>
                  </div>
                </div>
                <div className="lp2-scroll-hint">
                  <span>Scroll to follow the trail</span>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 3.5 5 7.5 9 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>

              <div className="lp2-hero-below">
              </div>
            </div>
          </section>

          {/* ================= PROBLEM ================= */}
          <section id="about" ref={problemSectionRef}>
            <div className="lp2-section-inner">
              <div className="lp2-split">
                <div className="lp2-node-col lp2-node-layer">
                  <div className="lp2-waypoint-node" ref={problemNodeRef}>
                    <NodeGraphic />
                    <div className="lp2-waypoint-label"><span>Problem</span></div>
                  </div>
                </div>
                <div className="lp2-content-col">
                  <span className="lp2-eyebrow"></span>
                  <h2 className="lp2-heading">Every student is carrying five things at once.</h2>
                  <p className="lp2-lede">Classes, clubs, a job, applications, a life outside all of it. The advice is always the same: break it down. But nobody says how, or where to start, or what to do when the list keeps growing faster than you can cross things off.</p>
                  <p className="lp2-problem-quote">Strail turns your goals into a path you can actually walk — one step, one node, at a time.</p>
                </div>
              </div>
            </div>
          </section>

          {/* ================= HOW IT WORKS ================= */}
          <section id="how-it-works">
            <div className="lp2-section-inner">
              <div className="lp2-split lp2-right">
                <div className="lp2-content-col">
                  <span className="lp2-eyebrow"></span>
                  <h2 className="lp2-heading">One node at a time, not one giant to-do list.</h2>
                  <div className="lp2-how-grid">
                    <ol className="lp2-how-steps">
                      {HOW_STEPS.map((s) => (
                        <li key={s.n}>
                          <span className="lp2-step-num">{s.n}</span>
                          <h3>{s.title}</h3>
                          <p>{s.body}</p>
                        </li>
                      ))}
                    </ol>

                    <div>
                      <div className="lp2-laptop-screen">
                        <p className="lp2-laptop-label">🗺️ Research Paper Trail</p>
                        <div className="lp2-mini-node-row"><span className="lp2-mini-dot lp2-complete" /><span className="lp2-mini-label">Pick a Topic</span></div>
                        <div className="lp2-mini-node-row"><span className="lp2-mini-dot lp2-complete" /><span className="lp2-mini-label">Gather Sources</span></div>
                        <div className="lp2-mini-node-row"><span className="lp2-mini-dot lp2-active" /><span className="lp2-mini-label">Build an Outline</span></div>
                        <div className="lp2-mini-node-row lp2-locked"><span className="lp2-mini-dot lp2-locked" /><span className="lp2-mini-label">Write Introduction</span></div>
                        <div className="lp2-mini-node-row lp2-locked"><span className="lp2-mini-dot lp2-locked" /><span className="lp2-mini-label">Draft &amp; Submit</span></div>
                      </div>
                      <div className="lp2-laptop-base" />
                    </div>
                  </div>
                </div>
                <div className="lp2-node-col lp2-node-layer">
                  <div className="lp2-waypoint-node" ref={howNodeRef}>
                    <NodeGraphic />
                    <div className="lp2-waypoint-label"><span>How It<br />Works</span></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= FEATURES ================= */}
          <section id="features">
            <div className="lp2-section-inner">
              <div className="lp2-split">
                <div className="lp2-node-col lp2-node-layer">
                  <div className="lp2-waypoint-node" ref={featuresNodeRef}>
                    <NodeGraphic />
                    <div className="lp2-waypoint-label"><span>Features</span></div>
                  </div>
                </div>
                <div className="lp2-content-col">
                  <span className="lp2-eyebrow"></span>
                  <h2 className="lp2-heading">Everything is in service of the next step.</h2>
                  <p className="lp2-lede">No leaderboards, no mascots, no notifications designed to make you anxious. Just the tools that get a goal from idea to done.</p>
                  <div className="lp2-card-grid">
                    {FEATURES.map((f) => (
                      <div className="lp2-card" key={f.title}>
                        <h3>{f.title}</h3>
                        <p>{f.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= PUBLIC JOURNEYS ================= */}
          <section id="journeys" ref={journeysSectionRef}>
            <div className="lp2-section-inner">
              <div className="lp2-split lp2-right">
                <div className="lp2-content-col">
                  <span className="lp2-eyebrow"></span>
                  <h2 className="lp2-heading">Someone's already walked a trail like yours.</h2>
                  <p className="lp2-lede">Browse trails other students built for goals like yours, see exactly how they broke it down, and fork one as a starting point for your own.</p>
                  <div className="lp2-journey-list">
                    {JOURNEYS.map((j) => (
                      <div className="lp2-journey-card" key={j.title}>
                        <div><h3>{j.title}</h3><p>{j.body}</p></div>
                        <span className="lp2-node-count">{j.nodes}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="lp2-node-col lp2-node-layer">
                  <div className="lp2-waypoint-node" ref={journeysNodeRef}>
                    <NodeGraphic />
                    <div className="lp2-waypoint-label"><span>Public<br />Journeys</span></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= CTA / END NODE ================= */}
          <section id="cta" ref={ctaSectionRef}>
            {[
              { left: '8%', top: '20%', size: 6, dur: '3.2s' },
              { left: '18%', top: '55%', size: 4, dur: '4.1s' },
              { left: '30%', top: '15%', size: 5, dur: '2.6s' },
              { left: '46%', top: '40%', size: 3, dur: '3.8s' },
              { left: '62%', top: '22%', size: 5, dur: '3.4s' },
              { left: '74%', top: '50%', size: 4, dur: '4.4s' },
              { left: '85%', top: '18%', size: 6, dur: '2.9s' },
              { left: '93%', top: '45%', size: 3, dur: '3.6s' },
              { left: '52%', top: '64%', size: 4, dur: '3.1s' },
              { left: '12%', top: '74%', size: 3, dur: '4.6s' },
            ].map((s, i) => (
              <div
                key={i}
                className="lp2-sparkle"
                style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDuration: s.dur }}
              />
            ))}

            <div className="lp2-hero-inner">
              <span className="lp2-eyebrow lp2-eyebrow-dark"></span>
              <div className="lp2-hero-node-wrap lp2-node-layer" ref={endNodeRef} style={{ marginTop: 22 }}>
                <NodeGraphic />
                <div className="lp2-hero-node-content">
                  <div className="lp2-hero-node-scrim" />
                  <h1 className="lp2-hero-title">Find Your Trail</h1>
                  <div className="lp2-hero-cta-row">
                    <button type="button" className="lp2-pill lp2-pill-light" onClick={onSignUp}>Start your Trail — it's free</button>
                  </div>
                </div>
              </div>
              <div className="lp2-end-below">
                <p>Free to start. No mascot, no guilt-trip notifications — just a clear next step, whenever you're ready to take it.</p>
              </div>
            </div>
          </section>
        </main>
      </div>

      <footer className="lp2-footer">
        <div className="lp2-footer-grid">
          <div>
            <a className="lp2-logo" href="#top">
              <img
                className="lp2-logo-dot"
                src="/strail-logo.png"
                alt=""
              /> STRAIL
            </a>
            <p className="lp2-footer-tagline">Stop overwhelm. Turn big goals into small steps.</p>
          </div>
          <div className="lp2-footer-cols">
            <div className="lp2-footer-col">
              <p>Site</p>
              <ul>
                <li><a href="#about">About</a></li>
                <li><a href="#how-it-works">How it works</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#journeys">Journeys</a></li>
                <li><Link to="/blog">Blog</Link></li>
              </ul>
            </div>
            <div className="lp2-footer-col">
              <p>Legal</p>
              <ul>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms &amp; Conditions</Link></li>
              </ul>
            </div>
            <div className="lp2-footer-col">
              <p>Follow</p>
              <ul>
                <li><a href="https://www.instagram.com/getstrail/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Instagram size={14} /> Instagram</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="lp2-footer-bottom">© {new Date().getFullYear()} Strail. Made for the ones juggling too much.</div>
      </footer>
    </div>
  );
}
