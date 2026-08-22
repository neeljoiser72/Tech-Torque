import { useState, useEffect } from 'react';
import { Brain, Mail, Lock, ArrowRight, ArrowLeft, AlertCircle, Eye, EyeOff, ShieldCheck, HeartPulse, Activity, UserRound } from 'lucide-react';
import { api } from '@/lib/api';

interface LoginProps {
  onAuthSuccess: () => void;
  onBack: () => void;
}

export function Login({ onAuthSuccess, onBack }: LoginProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    api.auth.getSession()
      .then(({ user }) => {
        if (user) onAuthSuccess();
      })
      .catch(() => {
        // Session check failed or unauthenticated
      });
  }, [onAuthSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { user, error } = await api.auth.login(email, password);
        if (error) {
          setError(error);
          return;
        }
        if (user) {
          onAuthSuccess();
        } else {
          setError('Unable to sign in. Please try again.');
        }
      } else {
        const { user, error } = await api.auth.signUp(email, password);
        if (error) {
          setError(error);
          return;
        }
        if (user) {
          onAuthSuccess();
        } else {
          setMode('login');
          setSuccessMsg('Account created successfully. Please sign in with your email and password.');
          setPassword('');
          setConfirmPassword('');
        }
      }
    } catch {
      setError('Could not reach backend server. Please make sure the server is running and MongoDB is connected.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setGuestLoading(true);

    try {
      const { user, error } = await api.auth.guestLogin();
      if (error) {
        setError(error || 'Unable to sign in as guest. Please try again.');
        setGuestLoading(false);
        return;
      }

      if (user) {
        onAuthSuccess();
      } else {
        setError('Unable to sign in as guest. Please try again.');
        setGuestLoading(false);
      }
    } catch {
      setError('Network error. Please make sure the server is running.');
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 grid-pattern opacity-30" />
      <div className="fixed top-[-15%] left-[15%] w-[500px] h-[500px] bg-primary-500/15 rounded-full blur-[140px] animate-aurora" />
      <div className="fixed bottom-[-15%] right-[10%] w-[450px] h-[450px] bg-accent-500/10 rounded-full blur-[140px] animate-aurora-delayed" />

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <button onClick={onBack} className="flex items-center gap-2 text-ink-400 hover:text-ink-200 transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </button>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4">
            <Brain className="w-7 h-7 text-ink-950" />
            <div className="absolute inset-0 rounded-2xl bg-primary-400/20 blur-md -z-10" />
          </div>
          <h1 className="font-bold font-display text-2xl text-ink-50">MindGuard AI</h1>
          <p className="text-sm text-ink-500 mt-1">Mental Health Monitor</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-7 shadow-2xl">
          {/* Tab toggle */}
          <div className="flex gap-1 p-1 rounded-xl bg-ink-900/50 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-primary-500 text-ink-950 shadow-lg shadow-primary-500/30'
                  : 'text-ink-400 hover:text-ink-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-primary-500 text-ink-950 shadow-lg shadow-primary-500/30'
                  : 'text-ink-400 hover:text-ink-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-success-500/10 border border-success-400/20 text-success-400 text-sm flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-danger-500/10 border border-danger-400/20 text-danger-400 text-sm flex items-start gap-2 animate-slide-up">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-ink-400 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-ink-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-ink-900/60 border border-white/5 text-ink-100 placeholder-ink-600 text-sm focus:outline-none focus:border-primary-400/40 focus:bg-ink-900/80 transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-ink-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-ink-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter your password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-ink-900/60 border border-white/5 text-ink-100 placeholder-ink-600 text-sm focus:outline-none focus:border-primary-400/40 focus:bg-ink-900/80 transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-600 hover:text-ink-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Confirm password (signup only) */}
            {mode === 'signup' && (
              <div className="animate-slide-up">
                <label className="block text-xs font-semibold text-ink-400 mb-1.5 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-ink-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-ink-900/60 border border-white/5 text-ink-100 placeholder-ink-600 text-sm focus:outline-none focus:border-primary-400/40 focus:bg-ink-900/80 transition-all"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-400 to-primary-600 text-ink-950 font-semibold text-sm shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs text-ink-600 font-medium">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Guest login */}
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loading || guestLoading}
            className="w-full py-3 rounded-xl bg-ink-900/60 border border-white/10 text-ink-200 font-semibold text-sm hover:bg-ink-900/80 hover:border-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {guestLoading ? (
              <div className="w-5 h-5 border-2 border-ink-600 border-t-ink-300 rounded-full animate-spin" />
            ) : (
              <>
                <UserRound className="w-4 h-4" />
                Continue as Guest
              </>
            )}
          </button>

          {/* Mode switch link */}
          <p className="text-center text-sm text-ink-500 mt-5">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
                  className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                >
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
                  className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-5 mt-6 text-xs text-ink-600">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure & private</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Patient-focused</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>HIPAA-aware</span>
          </div>
        </div>

        {/* Crisis note */}
        <p className="text-center text-xs text-ink-600 mt-4 max-w-xs mx-auto">
          If you are in crisis, call or text 988 — the Suicide & Crisis Lifeline is available 24/7.
        </p>
      </div>
    </div>
  );
}
