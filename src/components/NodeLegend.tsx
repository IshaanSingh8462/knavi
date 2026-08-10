import { Lock, Check } from 'lucide-react';
import { motion } from 'motion/react';

const CIRCLE = 48;

function Connector() {
  return <div className="flex-1 h-[3px] mx-1" style={{ backgroundColor: 'var(--color-trail)' }} />;
}

export default function NodeLegend() {
  return (
    <div className="flex items-center w-full max-w-md mx-auto py-4">
      {/* Locked */}
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <div
          className="rounded-full border-[3px] border-dashed bg-surface flex items-center justify-center"
          style={{ width: CIRCLE, height: CIRCLE, borderColor: 'var(--color-line)' }}
        >
          <Lock className="w-4 h-4 text-ink-soft" />
        </div>
        <span className="text-[10px] font-mono uppercase text-ink-soft">Locked</span>
      </div>

      <Connector />

      {/* To Do */}
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <div
          className="rounded-full border-[6px] bg-wood-gradient"
          style={{ width: CIRCLE, height: CIRCLE, borderColor: 'var(--color-trail)' }}
        />
        <span className="text-[10px] font-mono uppercase text-ink-soft">To Do</span>
      </div>

      <Connector />

      {/* Active */}
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <div className="relative">
          <div
            className="rounded-full border-[6px] bg-wood-gradient"
            style={{ width: CIRCLE, height: CIRCLE, borderColor: '#f0c060' }}
          />
          <motion.span
            className="absolute -inset-1.5 rounded-full border-2"
            style={{ borderColor: '#f0c060' }}
            animate={{ scale: [1, 1.25], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
        </div>
        <span className="text-[10px] font-mono uppercase text-ink-soft">Active</span>
      </div>

      <Connector />

      {/* Done */}
      <div className="flex flex-col items-center gap-1.5 shrink-0">
        <div
          className="rounded-full bg-primary flex items-center justify-center"
          style={{ width: CIRCLE, height: CIRCLE }}
        >
          <Check className="w-5 h-5 text-white" />
        </div>
        <span className="text-[10px] font-mono uppercase text-ink-soft">Done</span>
      </div>
    </div>
  );
}