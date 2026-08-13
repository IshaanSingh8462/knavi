import { useEffect, useMemo, useRef, useState } from 'react';
import { Lock, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Level } from '../types/index';

interface Point {
  x: number;
  y: number;
  level: Level;
  displayStatus: 'locked' | 'active' | 'complete';
}

interface TrailProps {
  levels: Level[];
  selectedLevelId: string | null;
  onSelect: (level: Level) => void;
  /** Small uppercase mono label rendered above the trail's bounding box. */
  title?: string;
  /** Set false for summary/preview instances — hides pines/rocks/bushes/flowers. Defaults to true (full journey view). */
  showClutter?: boolean;
}

const SPACING_Y = 128;
const TOP_PADDING = 70;
const BOTTOM_PADDING = 90;
const NODE_SIZE = 64;

const EMOJI_SET = ['📘', '🎯', '🧠', '✏️', '🔍', '💡', '🗣️', '📐', '🧩', '⚡'];

function computePositions(levels: Level[], width: number): { x: number; y: number; level: Level }[] {
  const amplitude = Math.min(width * 0.26, 170);
  const centerX = width / 2;
  return levels.map((level, i) => ({
    x: centerX + amplitude * Math.sin(i * 1.4),
    y: TOP_PADDING + i * SPACING_Y,
    level,
  }));
}

// Render-time status is derived from position relative to the active node,
// not trusted verbatim from level.status — this is what guarantees a node
// past "active" can never render as an unlocked/"todo" style even if the
// underlying data is stale or out of order.
function deriveDisplayStatuses(levels: Level[]): ('locked' | 'active' | 'complete')[] {
  const activeIdx = levels.findIndex((l) => l.status === 'active');
  const allComplete = levels.length > 0 && levels.every((l) => l.status === 'complete');

  return levels.map((l, i) => {
    if (allComplete) return 'complete';
    if (activeIdx === -1) {
      // No active node found (e.g. everything still locked) — fall back
      // to trusting complete flags only; everything else is locked.
      return l.status === 'complete' ? 'complete' : 'locked';
    }
    if (i < activeIdx) return 'complete';
    if (i === activeIdx) return 'active';
    return 'locked'; // anything after active is ALWAYS locked, never "todo"
  });
}

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const midY = (p0.y + p1.y) / 2;
    d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
  }
  return d;
}

function Pine({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={0.95}>
      <rect x={-3} y={16} width="6" height="9" rx="1.5" fill="#6b4a2b" />
      <path d="M 0 -20 L 12 4 L -12 4 Z" fill="#1F4E2C" />
      <path d="M 0 -9 L 15 12 L -15 12 Z" fill="#2A6E3E" />
    </g>
  );
}
function Bush({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={0.95}>
      <circle cx="0" cy="0" r="10" fill="#2A6E3E" />
      <circle cx="-8" cy="4" r="7.5" fill="#2A6E3E" />
      <circle cx="9" cy="5" r="7" fill="#2A6E3E" />
    </g>
  );
}
function Rock({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={0.95}>
      <ellipse cx="0" cy="4" rx="12" ry="6" fill="#B7A98C" />
      <ellipse cx="9" cy="5.5" rx="7" ry="4" fill="#93805F" />
    </g>
  );
}
function Flower({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="#fbfdf6" opacity={0.95}>
      <circle cx="0" cy="-3" r="2" />
      <circle cx="3" cy="0" r="2" />
      <circle cx="0" cy="3" r="2" />
      <circle cx="-3" cy="0" r="2" />
      <circle cx="0" cy="0" r="1.6" fill="#e8b94a" />
    </g>
  );
}

export default function Trail({ levels, selectedLevelId, onSelect, title, showClutter = true }: TrailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const rawPoints = useMemo(() => computePositions(levels, width), [levels, width]);
  const displayStatuses = useMemo(() => deriveDisplayStatuses(levels), [levels]);
  const points: Point[] = useMemo(
    () => rawPoints.map((p, i) => ({ ...p, displayStatus: displayStatuses[i] })),
    [rawPoints, displayStatuses]
  );
  const pathD = useMemo(() => smoothPath(points), [points]);
  const totalHeight = TOP_PADDING + Math.max(0, levels.length - 1) * SPACING_Y + BOTTOM_PADDING;

  const litCount = useMemo(() => {
    const activeIdx = displayStatuses.findIndex((s) => s === 'active');
    if (activeIdx >= 0) return activeIdx + 1;
    if (levels.length > 0 && displayStatuses.every((s) => s === 'complete')) return levels.length;
    return Math.max(1, displayStatuses.filter((s) => s !== 'locked').length);
  }, [displayStatuses, levels.length]);

  const litPathD = useMemo(() => smoothPath(points.slice(0, litCount)), [points, litCount]);

  const clutter = useMemo(() => {
    if (width === 0 || !showClutter) return [];
    const items: { type: 'pine' | 'bush' | 'rock' | 'flower'; x: number; y: number; scale: number }[] = [];
    const margin = 26;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const midX = (p0.x + p1.x) / 2;
      const midY = (p0.y + p1.y) / 2;
      const side = i % 2 === 0 ? 1 : -1;
      const offset = 85 + (i % 3) * 18;
      const type: 'pine' | 'bush' | 'rock' | 'flower' =
        i % 4 === 0 ? 'pine' : i % 4 === 1 ? 'bush' : i % 4 === 2 ? 'rock' : 'flower';
      items.push({
        type,
        x: Math.min(width - margin, Math.max(margin, midX + side * offset)),
        y: midY - 24,
        scale: 0.85 + ((i * 3) % 3) * 0.15,
      });
      if (i % 3 === 0) {
        items.push({
          type: 'flower',
          x: Math.min(width - margin, Math.max(margin, midX - side * offset * 0.55)),
          y: midY + 30,
          scale: 1,
        });
      }
    }
    return items;
  }, [points, width, showClutter]);

  if (levels.length === 0) {
    return (
      <div className="py-14 text-center">
        <p className="text-3xl mb-2">🥾</p>
        <p className="text-sm text-ink-soft italic">No steps charted on this trail yet.</p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <div className="mb-2 text-left">
          <span className="text-[10px] font-mono uppercase tracking-widest text-ink-soft">{title}</span>
        </div>
      )}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden border border-line shadow-cozy"
        style={{ height: totalHeight, background: 'linear-gradient(180deg, #E7F2E3 0%, #EDE2C4 100%)' }}
      >
        {width > 0 && (
          <>
            <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${width} ${totalHeight}`} aria-hidden="true">
              {clutter.map((c, i) => (
                <g key={i}>
                  {c.type === 'pine' ? (
                    <Pine x={c.x} y={c.y} scale={c.scale} />
                  ) : c.type === 'bush' ? (
                    <Bush x={c.x} y={c.y} scale={c.scale} />
                  ) : c.type === 'rock' ? (
                    <Rock x={c.x} y={c.y} scale={c.scale} />
                  ) : (
                    <Flower x={c.x} y={c.y} />
                  )}
                </g>
              ))}

              <path d={pathD} fill="none" stroke="var(--color-trail)" strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
              <path
                d={pathD}
                fill="none"
                stroke="var(--color-trail-dk)"
                strokeWidth={30}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.18}
                transform="translate(3,3)"
                style={{ mixBlendMode: 'multiply' }}
              />

              <motion.path
                key={litCount}
                d={litPathD}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth={6}
                strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </svg>

            {points.map(({ x, y, level, displayStatus }) => {
              const isCompleted = displayStatus === 'complete';
              const isLocked = displayStatus === 'locked';
              const isActive = displayStatus === 'active';
              const isSelected = selectedLevelId === level.id;
              const emoji = EMOJI_SET[Math.abs(level.title.length + level.branch_order) % EMOJI_SET.length];

              return (
                <div key={level.id} className="absolute" style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}>
                  <motion.button
                    type="button"
                    onClick={() => onSelect(level)}
                    aria-label={`${level.title} — ${displayStatus}`}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="block cursor-pointer"
                  >
                    <div
                      className={`relative rounded-full flex items-center justify-center text-2xl shadow-cozy select-none ${
                        isLocked ? 'border-[3px] border-dashed bg-surface' : 'border-[6px] bg-wood-gradient'
                      } ${isActive ? 'scale-110 shadow-active' : ''} ${isCompleted ? 'opacity-80' : ''} ${
                        isSelected ? 'ring-4 ring-white/60' : ''
                      }`}
                      style={{
                        width: NODE_SIZE,
                        height: NODE_SIZE,
                        borderColor: isLocked ? 'var(--color-line)' : isActive ? '#B98F4B' : 'var(--color-trail)',
                      }}
                    >
                      {isActive && (
                        <motion.span
                          className="absolute -inset-1.5 rounded-full border-2"
                          style={{ borderColor: '#B98F4B' }}
                          animate={{ scale: [1, 1.25], opacity: [0.6, 0] }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                        />
                      )}
                      {isLocked ? <Lock className="w-5 h-5 text-ink-soft" /> : <span>{emoji}</span>}
                      {isCompleted && (
                        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary border-2 border-surface flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </span>
                      )}
                    </div>
                  </motion.button>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}