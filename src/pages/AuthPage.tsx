import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, ArrowLeft, Mail, Lock, UserRound, Leaf } from 'lucide-react';
import BrandHero from '../components/BrandHero';
import { useAppData } from '../lib/appContext';
import { trackEvent } from '../lib/analytics';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginMode = location.pathname === '/login';

  const { signIn, signUp, enterAsGuest, isGuestSubmitting, authError, authInfo, isAuthSubmitting, clearAuthMessages } =
    useAppData();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Wipe stale error/info banners when switching between /login and /signup.
  useEffect(() => {
    clearAuthMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoginMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (!isLoginMode && !name.trim())) {
      return;
    }
    try {
      if (isLoginMode) {
        await signIn(email, password);
        const from = (location.state as any)?.from?.pathname || '/app';
        navigate(from, { replace: true });
      } else {
        trackEvent('create_account_click', { button_label: 'Create Account' });
        const result = await signUp(email, password, name);
        if (!result.needsConfirmation) {
          navigate('/onboarding', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }
      setEmail('');
      setPassword('');
      setName('');
    } catch {
      // Error already surfaced via authError from context.
    }
  };

  const handleGuestEntry = async () => {
    try {
      await enterAsGuest();
      navigate('/journeys');
    } catch {
      // authError already set.
    }
  };

  return (
    <div className="min-h-screen bg-void text-ink overflow-hidden relative flex flex-col">
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-moss/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl w-full bg-white border border-line rounded-[24px] shadow-cozy overflow-hidden flex flex-col md:flex-row"
        >
          <div className="hidden md:block md:w-[45%] min-h-[520px] shrink-0">
            <BrandHero />
          </div>

          <div className="flex-1 p-6 sm:p-10 flex flex-col justify-center">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-sans font-bold text-ink-soft hover:text-ink mb-6 cursor-pointer self-start"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Strail
            </Link>

            <div className="mb-8">
              <div className="flex items-center gap-2.5">
                <div className="inline-flex w-9 h-9 bg-primary/15 items-center justify-center rounded-full text-primary">
                  <Leaf className="w-5 h-5" />
                </div>
                <h1 className="font-sans font-black text-3xl text-ink tracking-tight">Strail</h1>
              </div>
              <p className="text-sm text-ink-soft mt-2">Your journey. Your goals. Your way.</p>
            </div>

            {authError && (
              <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 text-xs flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}
            {authInfo && (
              <div className="mb-6 p-3 bg-moss/10 border border-moss/20 rounded-xl text-moss text-xs flex items-start gap-2">
                <span>{authInfo}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {!isLoginMode && (
                <div className="flex items-center gap-3 px-4 py-3.5 border border-line rounded-xl bg-[#F3ECD8] focus-within:border-primary transition-colors">
                  <UserRound className="w-4.5 h-4.5 text-ink-soft shrink-0" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-transparent text-ink placeholder:text-ink-soft focus:outline-none text-sm"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 px-4 py-3.5 border border-line rounded-xl bg-[#F3ECD8] focus-within:border-primary transition-colors">
                <Mail className="w-4.5 h-4.5 text-ink-soft shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full bg-transparent text-ink placeholder:text-ink-soft focus:outline-none text-sm"
                />
              </div>

              <div className="flex items-center gap-3 px-4 py-3.5 border border-line rounded-xl bg-[#F3ECD8] focus-within:border-primary transition-colors">
                <Lock className="w-4.5 h-4.5 text-ink-soft shrink-0" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-transparent text-ink placeholder:text-ink-soft focus:outline-none text-sm"
                />
              </div>

              {isLoginMode && (
                <div className="text-right">
                  <Link to="/reset-password" className="text-xs font-sans font-bold text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
              )}

              <button
                type="submit"
                disabled={isAuthSubmitting}
                className={`w-full py-3.5 text-white shadow-cozy rounded-xl text-sm font-bold cursor-pointer transition-all ${
                  isAuthSubmitting ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:opacity-90'
                }`}
              >
                {isAuthSubmitting ? 'Please wait...' : isLoginMode ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-line" />
              <span className="text-[11px] font-sans text-ink-soft">or</span>
              <div className="h-px flex-1 bg-line" />
            </div>

            <button
              type="button"
              onClick={handleGuestEntry}
              disabled={isGuestSubmitting}
              className={`mt-5 w-full py-3 border border-line rounded-xl text-sm font-bold cursor-pointer transition-all ${
                isGuestSubmitting ? 'text-ink-soft cursor-not-allowed' : 'text-ink hover:bg-black/5'
              }`}
            >
              {isGuestSubmitting ? 'Entering...' : 'Enter as Guest'}
            </button>
            <p className="text-[11px] text-ink-soft text-center mt-2">
              Browse Public Journeys without an account. Nothing you do as a guest is saved.
            </p>

            <p className="text-center mt-6 text-sm text-ink-soft">
              {isLoginMode ? "Don't have an account? " : 'Already have an account? '}
              <Link
                to={isLoginMode ? '/signup' : '/login'}
                className="font-bold text-primary hover:underline cursor-pointer"
              >
                {isLoginMode ? 'Sign up' : 'Sign in'}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
