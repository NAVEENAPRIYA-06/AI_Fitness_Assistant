import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Sparkles,
  Sliders,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Activity,
  User
} from 'lucide-react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { QuickSearch } from './QuickSearch.js';

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setMobileOpen }) => {
  const { setActiveModule, profile, currentUser, logout } = useHealthPilot();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userName = currentUser?.name || profile?.name || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)] px-3 sm:px-6 py-2.5 sm:py-3 transition-colors duration-200">
      <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto">
        {/* 1. HealthPilot Branding */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => setActiveModule('today')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105 shrink-0">
              <Activity className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] tracking-tight">
                  HealthPilot
                </span>
                <span className="text-[var(--primary)] font-extrabold text-xs">AI</span>
              </div>
              <p className="hidden md:block text-[11px] text-[var(--text-muted)] font-medium tracking-tight truncate">
                Your Personal Fitness Coach
              </p>
            </div>
          </div>
        </div>

        {/* 2. Quick Search: Center */}
        <div className="flex-1 max-w-xs sm:max-w-md mx-1 sm:mx-4">
          <QuickSearch />
        </div>

        {/* 3. Actions & Profile: Right Side */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Theme Switcher Toggle (Light <-> Dark) */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            className="p-2 sm:p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] transition-colors border border-[var(--border)] cursor-pointer"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-[var(--text-secondary)]" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Check In */}
          <button
            type="button"
            onClick={() => setActiveModule('context')}
            title="Update your daily context and recovery readiness"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-soft)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>Check In</span>
          </button>

          {/* Ask Coach */}
          <button
            type="button"
            onClick={() => setActiveModule('coach')}
            title="Chat with HealthPilot Coach"
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask Coach</span>
          </button>

          {/* User Profile Menu */}
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2 sm:pr-2.5 py-1 bg-[var(--surface-soft)] border border-[var(--border)] rounded-full hover:bg-[var(--surface-elevated)] transition-all cursor-pointer"
              aria-expanded={dropdownOpen}
              aria-label="User account menu"
            >
              <div className="w-6 h-6 rounded-full bg-[var(--primary-soft)] border border-[var(--primary)]/40 text-[var(--primary)] font-bold text-xs flex items-center justify-center shrink-0">
                {userInitial}
              </div>
              <span className="hidden md:inline text-xs font-semibold text-[var(--text-primary)] max-w-[90px] truncate">
                {userName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {userName}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                    {currentUser?.email || ''}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    setActiveModule('settings');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] transition-colors text-left font-medium cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Settings & Preferences</span>
                </button>

                <div className="border-t border-[var(--border)] mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-colors text-left font-semibold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
