import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sound } from '../lib/sound';

interface SoundToggleProps {
  className?: string;
}

// A small, reusable mute toggle. Deliberately local useState rather than
// global React state — sound.ts is a plain singleton, so each mounted
// toggle just reads the current preference once and updates its own
// display when clicked. Multiple toggles across the app (header, guest
// header, landing page) all read/write the same localStorage-backed value,
// they just don't live-sync with each other mid-session, which is fine
// since there's normally only one visible at a time.
export default function SoundToggle({ className = '' }: SoundToggleProps) {
  const [enabled, setEnabled] = useState(sound.isEnabled());

  return (
    <button
      type="button"
      data-sound="none"
      onClick={() => setEnabled(sound.toggle())}
      aria-pressed={enabled}
      title={enabled ? 'Mute sound effects' : 'Unmute sound effects'}
      className={`flex items-center justify-center text-ink-soft hover:text-ink transition-colors cursor-pointer ${className}`}
    >
      {enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
    </button>
  );
}
