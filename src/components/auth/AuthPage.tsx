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
          if (
            result.error?.toLowerCase().includes('credential') ||
            result.error?.toLowerCase().includes('invalid') ||
            result.error?.toLowerCase().includes('password')
          ) {
            setError('Unable to sign in. Please check your email and password.');
          } else if (
            result.error?.toLowerCase().includes('network') ||
            result.error?.toLowerCase().includes('fetch')
          ) {
            setError('Unable to reach the server. Please check your internet connection and try again.');
          } else {
            setError(result.error || 'Unable to sign in. Please check your email and password.');
          }
        }
      } else {
        const result = await signup(trimmedEmail, password, name.trim());
        if (!result.success) {
          if (
            result.error?.toLowerCase().includes('already exists') ||
            result.error?.toLowerCase().includes('duplicate')
          ) {
            setError('An account with this email already exists. Please sign in instead.');
          } else if (
            result.error?.toLowerCase().includes('network') ||
            result.error?.toLowerCase().includes('fetch')
          ) {
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--primary)] selection:text-white transition-colors duration-200">
      {/* Subtle ambient wellness background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl opacity-70" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[var(--peach-soft)]/60 rounded-full blur-3xl opacity-80" />
      </div>

      {/* Top Navigation */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex items-center justify-between shrink-0">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)]">
            HealthPilot <span className="text-[var(--primary)] font-normal">AI</span>
          </span>
        </div>

        {/* Top-Right: Mode switch + Theme Toggle */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
            {mode === 'login' ? (
              <>
                <span className="hidden sm:inline">New here?</span>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="px-3 py-1.5 rounded-lg font-semibold text-[var(--primary)] bg-[var(--primary-soft)] hover:opacity-90 transition-all cursor-pointer"
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
                  className="px-3 py-1.5 rounded-lg font-semibold text-[var(--primary)] bg-[var(--primary-soft)] hover:opacity-90 transition-all cursor-pointer"
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
            className="p-2 sm:p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shadow-xs"
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

      {/* Main Content Area: Responsive Two-Column on Desktop/Tablet, Single Column on Mobile */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full max-w-7xl mx-auto">
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
          
          {/* ============================================================ */}
          {/* LEFT SIDE: HERO & FITNESS BENEFITS (Desktop / Tablet)         */}
          {/* ============================================================ */}
          <div className="hidden md:flex md:col-span-6 lg:col-span-7 flex-col justify-center space-y-5 lg:space-y-6">
            
            {/* Display Title & Subtitle */}
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-widest text-[var(--primary)] uppercase">
                YOUR HEALTH JOURNEY STARTS HERE
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-[42px] xl:text-[46px] font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.14]">
                Small Steps, <br />
                <span className="text-[var(--primary)]">Big Changes.</span>
              </h1>

              <p className="text-sm lg:text-base text-[var(--text-secondary)] leading-relaxed max-w-lg">
                Personalized guidance. Smarter decisions. <br className="hidden sm:inline" />
                A healthier, happier you.
              </p>
            </div>

            {/* Large Fitness Hero Image — Visible on Tablet/Desktop, Completely Hidden on Mobile */}
            <div className="hidden md:block relative w-full rounded-2xl lg:rounded-3xl overflow-hidden border border-[var(--border)] bg-[var(--surface-soft)] shadow-md group">
              <img
                src="/image.png"
                alt="HealthPilot AI - Personal Fitness & Wellness Journey"
                className="w-full h-56 md:h-64 lg:h-72 xl:h-80 object-cover object-[center_20%] transition-transform duration-500 group-hover:scale-[1.01]"
                referrerPolicy="no-referrer"
                loading="eager"
              />
              {/* Subtle ambient lighting blend gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Three Compact Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs transition-shadow hover:shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center mb-2.5">
                  <Compass className="w-4 h-4 text-[var(--primary)]" />
                </div>
                <h2 className="text-xs font-bold text-[var(--text-primary)]">Personalized Plans</h2>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-snug">
                  Workouts that fit your life
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs transition-shadow hover:shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center mb-2.5">
                  <Sliders className="w-4 h-4 text-[var(--primary)]" />
                </div>
                <h2 className="text-xs font-bold text-[var(--text-primary)]">Adapt to You</h2>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-snug">
                  Plans that adjust as you progress
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs transition-shadow hover:shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center mb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />
                </div>
                <h2 className="text-xs font-bold text-[var(--text-primary)]">Build Better Habits</h2>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-snug">
                  Simple guidance for consistent progress
                </p>
              </div>
            </div>

          </div>

          {/* ============================================================ */}
          {/* RIGHT SIDE: AUTHENTICATION CARD (Clean, Focused, Responsive)  */}
          {/* ============================================================ */}
          <div className="w-full md:col-span-6 lg:col-span-5 max-w-md mx-auto">
            
            {/* Header Above Form */}
            <div className="text-center md:text-left mb-4">
              <div className="inline-flex md:hidden items-center justify-center w-10 h-10 rounded-xl bg-[var(--primary)] text-white mb-2 shadow-sm">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                HealthPilot <span className="text-[var(--primary)] font-normal">AI</span>
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
                Your Personal Fitness Coach
              </p>
            </div>

            {/* Authentication Card */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-lg shadow-black/5">
              
              {/* Tabs: Sign In / Create Account */}
              <div className="grid grid-cols-2 p-1 bg-[var(--surface-soft)] rounded-xl border border-[var(--border)] mb-4">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
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
                  className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
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
                  className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2 text-xs sm:text-sm text-rose-600 dark:text-rose-400 animate-in fade-in duration-150"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
                
                {/* Full Name (Create Account only) */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jane Doe"
                        autoComplete="name"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[var(--text-primary)]">
                      Password
                    </label>
                    {mode === 'signup' && (
                      <span className="text-[11px] text-[var(--text-muted)] font-normal">
                        Min. 8 characters
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      className="w-full pl-10 pr-10 py-2.5 bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-hidden cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (Create Account only) */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="w-full pl-10 pr-10 py-2.5 bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-hidden cursor-pointer"
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
                  className="w-full mt-3 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] active:scale-[0.99] transition-all shadow-md shadow-[var(--primary)]/20 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
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
              <div className="mt-4 pt-3.5 border-t border-[var(--border)] flex items-center justify-center gap-2 text-center text-xs text-[var(--text-muted)]">
                <ShieldCheck className="w-4 h-4 text-[var(--primary)] shrink-0" />
                <span>Your personal health data stays private and isolated.</span>
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* Footer / Copyright subtle note */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-center text-[11px] text-[var(--text-muted)] shrink-0">
        HealthPilot AI &bull; Intelligent Fitness & Adaptive Decision Intelligence
      </footer>
    </div>
  );
};
