import React, { useState } from 'react';
import {
  Activity,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Compass,
  Sliders,
  CheckCircle2,
  Sun,
  Moon,
  Loader2
} from 'lucide-react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import { useTheme } from '../../context/ThemeContext.js';

export const AuthPage: React.FC = () => {
  const { login, signup } = useHealthPilot();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const validate = (): string | null => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      return 'Please enter your email address.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return 'Please enter a valid email address.';
    }

    if (mode === 'login') {
      if (!password) {
        return 'Please enter your password.';
      }
      return null;
    }

    // Create Account validations
    if (!name.trim()) {
      return 'Please enter your full name.';
    }

    if (!password) {
      return 'Please enter a password.';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      return 'Please confirm your password.';
    }

    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const result = await login(trimmedEmail, password);
        if (!result.success) {
          if (result.error?.toLowerCase().includes('credential') || result.error?.toLowerCase().includes('invalid') || result.error?.toLowerCase().includes('password')) {
            setError('Unable to sign in. Please check your email and password.');
          } else if (result.error?.toLowerCase().includes('network') || result.error?.toLowerCase().includes('fetch')) {
            setError('Unable to reach the server. Please check your internet connection and try again.');
          } else {
            setError(result.error || 'Unable to sign in. Please check your email and password.');
          }
        }
      } else {
        const result = await signup(trimmedEmail, password, name.trim());
        if (!result.success) {
          if (result.error?.toLowerCase().includes('already exists') || result.error?.toLowerCase().includes('duplicate')) {
            setError('An account with this email already exists. Please sign in instead.');
          } else if (result.error?.toLowerCase().includes('network') || result.error?.toLowerCase().includes('fetch')) {
            setError('Unable to reach the server. Please check your internet connection and try again.');
          } else {
            setError(result.error || 'Something went wrong. Please try again.');
          }
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[var(--background)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--primary)] selection:text-white transition-colors duration-200">
      {/* Subtle ambient wellness background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl opacity-70" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[var(--peach-soft)]/60 rounded-full blur-3xl opacity-80" />
      </div>

      {/* Simplified Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
            HealthPilot <span className="text-[var(--primary)] font-normal">AI</span>
          </span>
        </div>

        {/* Top-Right Context Controls: Switch Prompt & Theme Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            {mode === 'login' ? (
              <>
                <span className="hidden sm:inline">New here?</span>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="px-2.5 py-1 rounded-lg font-semibold text-[var(--primary)] bg-[var(--primary-soft)] hover:opacity-90 transition-all cursor-pointer"
                >
                  Create Account
                </button>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Already have an account?</span>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="px-2.5 py-1 rounded-lg font-semibold text-[var(--primary)] bg-[var(--primary-soft)] hover:opacity-90 transition-all cursor-pointer"
                >
                  Sign In
                </button>
              </>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-300" />
            )}
          </button>
        </div>
      </header>

      {/* Main Two-Sided Content Area - Vertically Centered */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-2 sm:py-4 w-full max-w-6xl mx-auto overflow-y-auto lg:overflow-visible">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          
          {/* ============================================================ */}
          {/* LEFT SIDE: HERO & FITNESS BENEFITS                           */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-3.5 lg:space-y-4">
            
            {/* Display Title & Subtitle */}
            <div className="space-y-1 sm:space-y-1.5">
              <span className="text-[11px] font-bold tracking-wider text-[var(--primary)] uppercase">
                YOUR HEALTH JOURNEY STARTS HERE
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.12]">
                Small Steps, <br />
                <span className="text-[var(--primary)]">Big Changes.</span>
              </h1>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-lg">
                Personalized guidance. Smarter decisions. <br className="hidden sm:inline" />
                A healthier, happier you.
              </p>
            </div>

            {/* Attached Fitness Hero Image - Hidden on mobile/small screens, prominently displayed on desktop/tablet */}
            <div className="hidden sm:block relative w-full h-36 sm:h-44 lg:h-48 rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface-soft)] shadow-sm">
              <img
                src="/image.png"
                alt="HealthPilot AI - Small Steps, Big Changes"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
                loading="eager"
              />
            </div>

            {/* Three Compact Fitness Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-start gap-2.5 shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0 mt-0.5">
                  <Compass className="w-3.5 h-3.5 text-[var(--primary)]" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xs font-bold text-[var(--text-primary)] truncate">Personalized Plans</h2>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-tight mt-0.5">Workouts that fit your life</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-start gap-2.5 shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0 mt-0.5">
                  <Sliders className="w-3.5 h-3.5 text-[var(--primary)]" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xs font-bold text-[var(--text-primary)] truncate">Adapt to You</h2>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-tight mt-0.5">Plans that adjust as you progress</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-start gap-2.5 shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--primary)]" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xs font-bold text-[var(--text-primary)] truncate">Build Better Habits</h2>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-tight mt-0.5">Simple guidance for consistent progress</p>
                </div>
              </div>
            </div>

          </div>

          {/* ============================================================ */}
          {/* RIGHT SIDE: AUTHENTICATION CARD                              */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 w-full max-w-sm sm:max-w-md mx-auto">
            
            {/* Header Above Form */}
            <div className="text-center sm:text-left mb-3 sm:mb-3.5">
              <div className="inline-flex lg:hidden items-center justify-center w-9 h-9 rounded-xl bg-[var(--primary)] text-white mb-1.5 shadow-sm mx-auto sm:mx-0">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
                HealthPilot <span className="text-[var(--primary)] font-normal">AI</span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
                Your Personal Fitness Coach
              </p>
            </div>

            {/* Compact Authentication Card */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-md">
              
              {/* Two Tabs: Sign In / Create Account */}
              <div className="grid grid-cols-2 p-1 bg-[var(--surface-soft)] rounded-xl border border-[var(--border)] mb-3.5">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Friendly Error Notice */}
              {error && (
                <div
                  role="alert"
                  className="mb-3.5 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-xs text-rose-600 dark:text-rose-400 animate-in fade-in duration-150"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                
                {/* Full Name (Create Account only) */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-primary)] mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Doe"
                        autoComplete="name"
                        className="w-full pl-9 pr-3 py-2 bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/30 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--text-primary)] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full pl-9 pr-3 py-2 bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/30 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-[var(--text-primary)]">
                      Password
                    </label>
                    {mode === 'signup' && (
                      <span className="text-[10px] text-[var(--text-muted)] font-normal">
                        Min. 8 characters
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      className="w-full pl-9 pr-9 py-2 bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-hidden cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (Create Account only) */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-primary)] mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="w-full pl-9 pr-9 py-2 bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/30 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-hidden cursor-pointer"
                        aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:scale-[0.99] transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>{mode === 'login' ? 'Signing in...' : 'Creating your account...'}</span>
                    </>
                  ) : mode === 'login' ? (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Privacy & Isolation Statement */}
              <div className="mt-3.5 pt-3 border-t border-[var(--border)] flex items-center justify-center gap-1.5 text-center text-[11px] text-[var(--text-muted)]">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                <span>Your personal health data stays private and isolated.</span>
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
};
