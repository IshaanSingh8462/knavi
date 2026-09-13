import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, AlertCircle, KeyRound } from 'lucide-react';
import { requestPasswordReset, confirmPasswordReset } from '../lib/supabase/queries';
import { useAppData } from '../lib/appContext';

// Two modes on the same URL:
// - No recovery session yet -> show "enter your email" form, sends a reset
//   email pointing at /auth/callback?type=recovery, which Supabase turns
//   into a real (temporary) session before redirecting here again.
// - Already have a session because we arrived via that recovery link ->
//   show "set a new password" form instead.
export default function ResetPasswordPage() {
  const { user } = useAppData();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Could not send reset email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      await confirmPasswordReset(newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Could not update your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasRecoverySession = !!user;

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4 py-12">
      <div className="max-w-sm w-full bg-white border border-line rounded-2xl shadow-cozy p-6">
        <Link to="/login" className="flex items-center gap-1.5 text-xs font-sans font-bold text-ink-soft hover:text-ink mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
        </Link>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary shrink-0">
            <KeyRound className="w-4.5 h-4.5" />
          </div>
          <h1 className="font-serif font-black text-lg text-ink leading-tight">Reset your password</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 text-xs flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-3 bg-moss/10 border border-moss/20 rounded-xl text-moss text-sm">
            {hasRecoverySession
              ? 'Your password has been updated. You can now sign in normally.'
              : "If that email has an account, we've sent a reset link. Check your inbox."}
          </div>
        ) : hasRecoverySession ? (
          <form onSubmit={handleConfirmReset} className="space-y-3">
            <div className="flex items-center gap-3 px-4 py-3 border border-line rounded-xl bg-[#F3ECD8] focus-within:border-primary transition-colors">
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
            <div className="flex items-center gap-3 px-4 py-3 border border-line rounded-xl bg-[#F3ECD8] focus-within:border-primary transition-colors">
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
              disabled={isSubmitting}
              className={`w-full py-3 text-white font-sans font-bold rounded-xl shadow-active transition-opacity cursor-pointer text-sm ${
                isSubmitting ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:opacity-90'
              }`}
            >
              {isSubmitting ? 'Updating...' : 'Set new password'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRequestReset} className="space-y-3">
            <div className="flex items-center gap-3 px-4 py-3 border border-line rounded-xl bg-[#F3ECD8] focus-within:border-primary transition-colors">
              <Mail className="w-4 h-4 text-ink-soft shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your account email"
                className="w-full bg-transparent text-ink placeholder:text-ink-soft focus:outline-none text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 text-white font-sans font-bold rounded-xl shadow-active transition-opacity cursor-pointer text-sm ${
                isSubmitting ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:opacity-90'
              }`}
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
