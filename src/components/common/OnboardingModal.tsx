import React, { useState } from 'react';
import { Sparkles, Target, Activity, Heart, Clock, MapPin, Check, AlertTriangle } from 'lucide-react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingModalOpen, setIsOnboardingModalOpen, completeOnboarding, currentUser } = useHealthPilot();

  const [age, setAge] = useState('30');
  const [primaryGoal, setPrimaryGoal] = useState('Cardiovascular Health & Routine Consistency');
  const [goalCategory, setGoalCategory] = useState<'endurance' | 'strength' | 'recovery' | 'hybrid'>('endurance');
  const [targetSleep, setTargetSleep] = useState('8.0');
  const [restingHeartRate, setRestingHeartRate] = useState('60');
  const [preferredEnvironment, setPreferredEnvironment] = useState<'home' | 'gym' | 'outdoor'>('home');
  const [weeklyAvailability, setWeeklyAvailability] = useState('35');
  const [limitations, setLimitations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOnboardingModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await completeOnboarding({
        name: currentUser?.name || 'Athlete',
        age: Number(age) || 30,
        primaryGoal,
        fitnessGoals: [primaryGoal],
        preferredEnvironment,
        targetWeeklyWorkouts: Math.max(2, Math.min(7, Math.round((Number(weeklyAvailability) || 35) / 7) || 4)),
        targetSleepDurationHours: Number(targetSleep) || 7.5,
        baselineRestingHeartRate: Number(restingHeartRate) || 55,
        equipmentAccess: preferredEnvironment === 'gym' 
          ? ['Barbell', 'Dumbbells', 'Cable Machine', 'Squat Rack', 'Treadmill']
          : preferredEnvironment === 'home'
            ? ['Kettlebells (16kg, 24kg)', 'Pull-Up Bar', 'Resistance Bands', 'Foam Roller']
            : ['Outdoor Running Shoes', 'GPS Watch'],
        knownContraindications: limitations ? [limitations] : []
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)] bg-[var(--surface-soft)]">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">Initialize Your Physiological Profile</h2>
              <p className="text-xs text-[var(--text-secondary)]">Calibrating Decision Intelligence & Baseline Thresholds</p>
            </div>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            Welcome, <span className="text-[var(--text-primary)] font-semibold">{currentUser?.name}</span>! HealthPilot requires your baseline metrics to calibrate multi-objective candidate scoring and physiological guardrails.
          </p>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Goal Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[var(--primary)]" />
              Primary Focus Area
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'endurance', label: 'Cardio & Aerobic Capacity' },
                { id: 'strength', label: 'Hypertrophy & Strength' },
                { id: 'recovery', label: 'Restoration & Durability' },
                { id: 'hybrid', label: 'Metabolic Conditioning' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setGoalCategory(cat.id as any)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    goalCategory === cat.id
                      ? 'bg-[var(--primary-soft)] border-[var(--primary)]/40 text-[var(--primary)] font-semibold'
                      : 'bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goal Statement */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Long-Term Goal Statement</label>
            <input
              type="text"
              required
              value={primaryGoal}
              onChange={(e) => setPrimaryGoal(e.target.value)}
              placeholder="e.g. Sub-3:30 Marathon or 500lb Powerlifting Total"
              className="w-full px-3 py-2 bg-[var(--surface-soft)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--primary)]"
            />
          </div>

          {/* Physiological Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Age</label>
              <input
                type="number"
                min="18"
                max="99"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-soft)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--primary)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Resting HR (bpm)</label>
              <input
                type="number"
                min="35"
                max="110"
                value={restingHeartRate}
                onChange={(e) => setRestingHeartRate(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-soft)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--primary)]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Target Sleep (hrs)</label>
              <input
                type="number"
                step="0.5"
                min="5"
                max="12"
                value={targetSleep}
                onChange={(e) => setTargetSleep(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-soft)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--primary)]"
              />
            </div>
          </div>

          {/* Environment and Session Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                Default Environment
              </label>
              <select
                value={preferredEnvironment}
                onChange={(e) => setPreferredEnvironment(e.target.value as any)}
                className="w-full px-3 py-2 bg-[var(--surface-soft)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--primary)]"
              >
                <option value="home">Home (Minimal Equipment)</option>
                <option value="gym">Commercial Gym / Facility</option>
                <option value="outdoor">Outdoor / Road / Trail</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                Typical Session (min)
              </label>
              <select
                value={weeklyAvailability}
                onChange={(e) => setWeeklyAvailability(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--surface-soft)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--primary)]"
              >
                <option value="20">20 Minutes (Micro-Session)</option>
                <option value="35">35 Minutes (Balanced)</option>
                <option value="50">50 Minutes (Comprehensive)</option>
                <option value="60">60+ Minutes (High Volume)</option>
              </select>
            </div>
          </div>

          {/* Physical Limitations */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Contraindications or Physical Sensitivity (Optional)
            </label>
            <input
              type="text"
              value={limitations}
              onChange={(e) => setLimitations(e.target.value)}
              placeholder="e.g. Mild lumbar extension sensitivity, patellar tracking, none"
              className="w-full px-3 py-2 bg-[var(--surface-soft)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:border-[var(--primary)]"
            />
            <p className="text-[11px] text-[var(--text-muted)]">
              The Decision Intelligence Engine automatically applies safety penalties to high-impact spinal or knee loads when acute fatigue is detected.
            </p>
          </div>

          {/* Footer Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-all shadow-md shadow-[var(--primary)]/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Initializing Database Profile...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Profile & Enter HealthPilot AI</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
