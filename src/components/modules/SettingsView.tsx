import React, { useState, useEffect } from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import {
  User,
  Settings2,
  Save,
  Check,
  Shield,
  Layers,
  Activity,
  Sun,
  Moon,
  Bell,
  Calendar,
  Clock,
  Sparkles,
  FlaskConical,
  ArrowRight
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { profile, updateProfile, currentUser, setActiveModule } = useHealthPilot();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(profile?.name || currentUser?.name || '');
  const [age, setAge] = useState(profile?.age || 29);
  const [heightCm, setHeightCm] = useState(profile?.heightCm || 178);
  const [weightKg, setWeightKg] = useState(profile?.weightKg || 74);
  const [fitnessLevel, setFitnessLevel] = useState(profile?.fitnessLevel || 'intermediate');
  const [targetWeeklyWorkouts, setTargetWeeklyWorkouts] = useState(profile?.targetWeeklyWorkouts || 4);
  const [preferredDuration, setPreferredDuration] = useState(30);

  // Preference toggles
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [enableResearch, setEnableResearch] = useState(() => {
    return localStorage.getItem('healthpilot_enable_research') === 'true';
  });

  const [selectedActivities, setSelectedActivities] = useState<string[]>([
    'functional_strength',
    'zone2_cardio',
    'restorative_mobility'
  ]);

  const [selectedDays, setSelectedDays] = useState<string[]>([
    'Monday',
    'Wednesday',
    'Friday',
    'Saturday'
  ]);

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || currentUser?.name || '');
      setAge(profile.age || 29);
      setHeightCm(profile.heightCm || 178);
      setWeightKg(profile.weightKg || 74);
      setFitnessLevel(profile.fitnessLevel || 'intermediate');
      setTargetWeeklyWorkouts(profile.targetWeeklyWorkouts || 4);
    }
  }, [profile, currentUser]);

  const toggleActivity = (act: string) => {
    setSelectedActivities(prev =>
      prev.includes(act) ? prev.filter(a => a !== act) : [...prev, act]
    );
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleResearchToggle = (enabled: boolean) => {
    setEnableResearch(enabled);
    localStorage.setItem('healthpilot_enable_research', String(enabled));
    window.dispatchEvent(new Event('storage'));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name,
      age,
      heightCm,
      weightKg,
      fitnessLevel: fitnessLevel as any,
      targetWeeklyWorkouts
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? (weightKg / (heightM * heightM)).toFixed(1) : '23.3';

  return (
    <div className="space-y-8 max-w-4xl mx-auto transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold mb-2">
            <Settings2 className="w-3.5 h-3.5" />
            <span>Preferences & Settings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Account & Preferences
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-normal">
            Customize your training targets, theme preferences, and schedule parameters.
          </p>
        </div>

        {isSaved && (
          <div className="px-3.5 py-1.5 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Saved successfully!</span>
          </div>
        )}
      </div>

      {/* 1. APPEARANCE & THEME SELECTION */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Theme & Appearance
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Choose between Light and Dark mode.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-xs">
          {[
            { id: 'light', label: 'Light Mode', icon: Sun },
            { id: 'dark', label: 'Dark Mode', icon: Moon }
          ].map(t => {
            const Icon = t.icon;
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id as any)}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--primary-soft)] border-[var(--primary)] text-[var(--primary)] font-bold shadow-xs'
                    : 'bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. PROFILE BIOMETRICS */}
      <form onSubmit={handleSaveProfile} className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Personal Profile & Biometrics
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Used to calculate recovery demands, basal expenditure, and workout scaling
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
            BMI: {bmi}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">Fitness Level</label>
            <select
              value={fitnessLevel}
              onChange={(e) => setFitnessLevel(e.target.value as any)}
              className="w-full p-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            >
              <option value="beginner">Beginner (Getting started)</option>
              <option value="intermediate">Intermediate (Consistent baseline)</option>
              <option value="advanced">Advanced (High athletic capacity)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">Height (cm)</label>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">Weight (kg)</label>
            <input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">Target Workouts / Week</label>
            <input
              type="number"
              min={1}
              max={7}
              value={targetWeeklyWorkouts}
              onChange={(e) => setTargetWeeklyWorkouts(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>

      {/* 3. WORKOUT PREFERENCES */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 space-y-6 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Workout & Schedule Preferences
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Help HealthPilot understand which days and styles of movement fit your routine best
          </p>
        </div>

        {/* Preferred Days */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[var(--text-primary)] block">
            Preferred Workout Days
          </label>
          <div className="flex flex-wrap gap-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
              const isSelected = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[var(--primary)] text-white shadow-xs'
                      : 'bg-[var(--surface-soft)] text-[var(--text-secondary)] border border-[var(--border)]'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferred Activity Types */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[var(--text-primary)] block">
            Favorite Activity Styles
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'functional_strength', label: 'Functional Strength' },
              { id: 'zone2_cardio', label: 'Zone 2 Cardio / Running' },
              { id: 'restorative_mobility', label: 'Mobility & Stretching' },
              { id: 'hiit_intervals', label: 'HIIT & Conditioning' },
              { id: 'bodyweight', label: 'Calisthenics & Core' }
            ].map(act => {
              const isSelected = selectedActivities.includes(act.id);
              return (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => toggleActivity(act.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[var(--primary)] text-white shadow-xs'
                      : 'bg-[var(--surface-soft)] text-[var(--text-secondary)] border border-[var(--border)]'
                  }`}
                >
                  {act.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. INTERNAL RESEARCH TOOLS TOGGLE */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-[var(--secondary)]" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Enable Internal Research Tools
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] max-w-xl leading-relaxed">
              Provides access to the Model Evaluation suite, SHAP feature importance charts, and Python ML training telemetry. Designed for researchers and developers.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={enableResearch}
              onChange={(e) => handleResearchToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[var(--surface-soft)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)] border border-[var(--border)]"></div>
          </label>
        </div>

        {enableResearch && (
          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between animate-in fade-in">
            <span className="text-xs text-[var(--primary)] font-semibold">
              Research navigation unlocked
            </span>
            <button
              onClick={() => setActiveModule('evaluation')}
              className="px-4 py-2 rounded-xl bg-[var(--surface-soft)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5 transition-all"
            >
              <span>Open Evaluation Suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
