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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#121215] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Initialize Your Physiological Profile</h2>
              <p className="text-xs text-slate-400">Calibrating Decision Intelligence & Baseline Thresholds</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Welcome, <span className="text-white font-medium">{currentUser?.name}</span>! HealthPilot requires your baseline metrics to calibrate multi-objective candidate scoring and physiological guardrails.
          </p>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Goal Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
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
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    goalCategory === cat.id
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goal Statement */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Long-Term Goal Statement</label>
            <input
              type="text"
              required
              value={primaryGoal}
              onChange={(e) => setPrimaryGoal(e.target.value)}
              placeholder="e.g. Sub-3:30 Marathon or 500lb Powerlifting Total"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Physiological Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Age</label>
              <input
                type="number"
                min="18"
                max="99"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Resting HR (bpm)</label>
              <input
                type="number"
                min="35"
                max="110"
                value={restingHeartRate}
                onChange={(e) => setRestingHeartRate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Target Sleep (hrs)</label>
              <input
                type="number"
                step="0.5"
                min="5"
                max="12"
                value={targetSleep}
                onChange={(e) => setTargetSleep(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Environment and Session Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Default Environment
              </label>
              <select
                value={preferredEnvironment}
                onChange={(e) => setPreferredEnvironment(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-hidden focus:border-emerald-500"
              >
                <option value="home">Home (Minimal Equipment)</option>
                <option value="gym">Commercial Gym / Facility</option>
                <option value="outdoor">Outdoor / Road / Trail</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Typical Session (min)
              </label>
              <select
                value={weeklyAvailability}
                onChange={(e) => setWeeklyAvailability(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-hidden focus:border-emerald-500"
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
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Contraindications or Physical Sensitivity (Optional)
            </label>
            <input
              type="text"
              value={limitations}
              onChange={(e) => setLimitations(e.target.value)}
              placeholder="e.g. Mild lumbar extension sensitivity, patellar tracking, none"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-500">
              The Decision Intelligence Engine automatically applies safety penalties to high-impact spinal or knee loads when acute fatigue is detected.
            </p>
          </div>

          {/* Footer Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#0A0A0B] bg-emerald-500 hover:bg-emerald-400 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
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
