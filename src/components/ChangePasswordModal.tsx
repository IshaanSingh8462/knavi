import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Lock, AlertCircle, KeyRound } from 'lucide-react';
import { signIn, updatePassword } from '../lib/supabase/queries';
import { sound } from '../lib/sound';

interface ChangePasswordModalProps {
  email: string;
  onClose: () => void;
}

// Change Password for an already-signed-in user — no email involved at
// all. "Proof of identity" here is re-entering the current password and
// having it verified via a real sign-in call, not just trusting whatever's
// already in the session. Only reachable for real (non-guest) accounts;
// App.tsx doesn't render the trigger button for guests.
export default function ChangePasswordModal({ email, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Re-authenticating with the current password IS the identity check
      // here — if it fails, Supabase rejects it and we never reach
      // updateUser(). There's no separate "verify password" endpoint;
      // signing in again with it is the verification.
      await signIn(email, currentPassword);
      await updatePassword(newPassword);
      sound.complete();
      setSuccess(true);
    } catch (err: any) {
      const message = /invalid login credentials/i.test(err.message || '')
        ? 'Current password is incorrect.'
        : err.message || 'Could not update your password. Please try again.';
      setError(message);
      sound.denied();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-[#2d3748]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white border border-line rounded-2xl shadow-cozy max-w-sm w-full p-6"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0">
              <KeyRound className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-serif font-black text-lg text-ink leading-tight">Change Password</h3>
          </div>
          <button
            type="button"
            data-sound="none"
            onClick={onClose}
            aria-label="Close"
            className="text-ink-soft hover:text-ink transition-colors cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <>
            <div className="p-3 bg-moss/10 border border-moss/20 rounded-xl text-moss text-sm">
              Your password has been updated.
            </div>
            <button
              type="button"
              data-sound="none"
              onClick={onClose}
              className="w-full mt-4 py-3 bg-primary text-white font-sans font-bold rounded-xl shadow-active hover:opacity-90 transition-opacity cursor-pointer text-sm"
            >
              Done
            </button>
          </>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 text-xs flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-center gap-3 px-4 py-3 border border-line rounded-xl bg-[#f7fbf8] focus-within:border-primary transition-colors">
                <Lock className="w-4 h-4 text-ink-soft shrink-0" />
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full bg-transparent text-ink placeholder:text-ink-soft focus:outline-none text-sm"
                />
              </div>

              <div className="flex items-center gap-3 px-4 py-3 border border-line rounded-xl bg-[#f7fbf8] focus-within:border-primary transition-colors">
                <Lock className="w-4 h-4 text-ink-soft shrink-0" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full bg-transparent text-ink placeholder:text-ink-soft focus:outline-none text-sm"
                />
              </div>

              <div className="flex items-center gap-3 px-4 py-3 border border-line rounded-xl bg-[#f7fbf8] focus-within:border-primary transition-colors">
                <Lock className="w-4 h-4 text-ink-soft shrink-0" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-transparent text-ink placeholder:text-ink-soft focus:outline-none text-sm"
                />
              </div>

              <button
                type="submit"
                data-sound="none"
                disabled={isSubmitting}
                className={`w-full py-3 text-white font-sans font-bold rounded-xl shadow-active transition-opacity cursor-pointer text-sm ${
                  isSubmitting ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:opacity-90'
                }`}
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
