import React, { useState, useEffect, useMemo } from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import { DailyContext } from '../../types/index.js';
import { TodayStateSummary } from './context/TodayStateSummary.js';
import { ContextHistoryChart } from './context/ContextHistoryChart.js';
import {
  Save,
  Moon,
  Zap,
  BatteryCharging,
  Flame,
  Activity,
  Clock,
  Home,
  Dumbbell,
  Droplets,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Heart,
  Smile,
  Brain,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const MyContextView: React.FC = () => {
  const {
    context,
    contextHistory,
    evolvingState,
    goals,
    updateContext,
    isSavingContext,
    setActiveModule
  } = useHealthPilot();

  // Local form state
  const [date, setDate] = useState<string>(
    context?.date || new Date().toISOString().split('T')[0]
  );

  // PHYSICAL / RECOVERY
  const [sleepHours, setSleepHours] = useState<number>(context?.sleepHours || 5.8);
  const [sleepQuality, setSleepQuality] = useState<number>(context?.sleepQuality || 5);
  const [energyLevel, setEnergyLevel] = useState<number>(context?.energyLevel || 5);
  const [fatigueLevel, setFatigueLevel] = useState<number>(context?.fatigueLevel || 7);
  const [sorenessLevel, setSorenessLevel] = useState<number>(context?.sorenessLevel || 6);

  // MENTAL / LIFESTYLE
  const [stressLevel, setStressLevel] = useState<number>(context?.stressLevel || 6);
  const [mood, setMood] = useState<string>(context?.mood || 'fatigued');
  const [cognitiveLoad, setCognitiveLoad] = useState<number>(context?.cognitiveLoad || 7);

  // AVAILABILITY
  const [availableMinutes, setAvailableMinutes] = useState<number>(context?.availableMinutes ?? 30);
  const [preferredTime, setPreferredTime] = useState<'morning' | 'afternoon' | 'evening'>(
    context?.preferredTime || 'morning'
  );

  // ENVIRONMENT
  const [environment, setEnvironment] = useState<'home' | 'gym' | 'outdoor' | 'other'>(
    (context?.environment as any) || 'home'
  );

  // EQUIPMENT
  const [equipmentAvailable, setEquipmentAvailable] = useState<string[]>(
    context?.equipmentAvailable || ['Dumbbells', 'Resistance bands', 'Mat']
  );

  // PREFERENCES
  const [activityPreference, setActivityPreference] = useState<string>(
    context?.activityPreference || 'Mobility & Stretching'
  );
  const [currentPreferences, setCurrentPreferences] = useState<string>(
    context?.currentPreferences || 'Prefer gentle mobility and light tempo, feel tight from yesterday desk work'
  );
  const [hydrationLiters, setHydrationLiters] = useState<number>(context?.hydrationLiters || 1.2);

  // Feedback & Validation states
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Synchronize when context loads or updates
  useEffect(() => {
    if (context) {
      setDate(context.date || new Date().toISOString().split('T')[0]);
      setSleepHours(context.sleepHours);
      setSleepQuality(context.sleepQuality || 5);
      setEnergyLevel(context.energyLevel);
      setFatigueLevel(context.fatigueLevel);
      setSorenessLevel(context.sorenessLevel || 5);
      setStressLevel(context.stressLevel);
      setMood(context.mood || 'good');
      setCognitiveLoad(context.cognitiveLoad || 5);
      setAvailableMinutes(context.availableMinutes);
      setPreferredTime(context.preferredTime || 'morning');
      setEnvironment((context.environment as any) || 'home');
      setEquipmentAvailable(context.equipmentAvailable || ['Mat', 'Dumbbells']);
      setActivityPreference(context.activityPreference || 'Functional Strength');
      setCurrentPreferences(context.currentPreferences || '');
      setHydrationLiters(context.hydrationLiters || 1.5);
    }
  }, [context]);

  // Real-time live estimate of recovery based on transparent formula
  const liveRecoveryEstimate = useMemo(() => {
    const sleep = Math.max(0, Math.min(24, sleepHours));
    const quality = Math.max(1, Math.min(10, sleepQuality));
    const energy = Math.max(1, Math.min(10, energyLevel));
    const fatigue = Math.max(1, Math.min(10, fatigueLevel));
    const stress = Math.max(1, Math.min(10, stressLevel));
    const soreness = Math.max(1, Math.min(10, sorenessLevel));

    const sleepRatio = Math.min(100, (sleep / 8.0) * 100);
    const qualityMultiplier = 0.70 + (quality / 10) * 0.45;
    const effectiveRest = sleepRatio * qualityMultiplier;

    const energyScore = energy * 10;
    const systemicPenalty = fatigue * 4.2 + stress * 3.4 + soreness * 2.4;

    const raw = Math.round(0.42 * effectiveRest + 0.38 * energyScore - 0.25 * systemicPenalty + 10);
    const score = Math.max(12, Math.min(98, raw));

    let status: 'good' | 'moderate' | 'low' = 'moderate';
    if (score >= 70) status = 'good';
    else if (score < 48) status = 'low';

    return { score, status };
  }, [sleepHours, sleepQuality, energyLevel, fatigueLevel, stressLevel, sorenessLevel]);

  // Client-side validation function
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (isNaN(sleepHours) || sleepHours <= 0 || sleepHours > 24) {
      errors.sleepHours = 'Sleep duration must be between 0.5 and 24 hours.';
    }

    if (isNaN(availableMinutes) || availableMinutes < 0) {
      errors.availableMinutes = 'Available time cannot be negative.';
    } else if (availableMinutes > 480) {
      errors.availableMinutes = 'Available time cannot exceed 480 minutes.';
    }

    if (energyLevel < 1 || energyLevel > 10) {
      errors.energyLevel = 'Energy level must be between 1 and 10.';
    }
    if (fatigueLevel < 1 || fatigueLevel > 10) {
      errors.fatigueLevel = 'Fatigue level must be between 1 and 10.';
    }
    if (stressLevel < 1 || stressLevel > 10) {
      errors.stressLevel = 'Stress level must be between 1 and 10.';
    }
    if (sorenessLevel < 1 || sorenessLevel > 10) {
      errors.sorenessLevel = 'Soreness level must be between 1 and 10.';
    }
    if (cognitiveLoad < 1 || cognitiveLoad > 10) {
      errors.cognitiveLoad = 'Cognitive load must be between 1 and 10.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleToggleEquipment = (item: string) => {
    if (item === 'No equipment') {
      setEquipmentAvailable(prev =>
        prev.includes('No equipment') ? [] : ['No equipment']
      );
      return;
    }

    setEquipmentAvailable(prev => {
      const filtered = prev.filter(e => e !== 'No equipment');
      return filtered.includes(item)
        ? filtered.filter(e => e !== item)
        : [...filtered, item];
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    const payload: Partial<DailyContext> = {
      date,
      sleepHours: Number(sleepHours),
      sleepDuration: Number(sleepHours),
      sleepQuality: Number(sleepQuality),
      energyLevel: Number(energyLevel),
      energy: Number(energyLevel),
      fatigueLevel: Number(fatigueLevel),
      fatigue: Number(fatigueLevel),
      stressLevel: Number(stressLevel),
      stress: Number(stressLevel),
      sorenessLevel: Number(sorenessLevel),
      soreness: Number(sorenessLevel),
      recoveryScore: liveRecoveryEstimate.score,
      recoveryStatus: liveRecoveryEstimate.status,
      mood,
      cognitiveLoad: Number(cognitiveLoad),
      availableMinutes: Number(availableMinutes),
      preferredTime,
      environment,
      equipmentAvailable,
      equipment: equipmentAvailable,
      activityPreference,
      currentPreferences,
      hydrationLiters: Number(hydrationLiters)
    };

    const result = await updateContext(payload);
    if (result.success) {
      setSavedSuccess(true);
      setValidationErrors({});
      setTimeout(() => setSavedSuccess(false), 3500);
    } else {
      setServerError(result.error || 'Failed to save daily context.');
      if (result.validationErrors) {
        setValidationErrors(result.validationErrors);
      }
    }
  };

  // Quick preset scenarios for realistic simulation
  const applyPreset = (preset: 'poor_sleep' | 'peak_energy' | 'gym_strength' | 'busy_travel') => {
    if (preset === 'poor_sleep') {
      setSleepHours(5.2);
      setSleepQuality(4);
      setEnergyLevel(4);
      setFatigueLevel(8);
      setSorenessLevel(7);
      setStressLevel(7);
      setMood('fatigued');
      setCognitiveLoad(8);
      setAvailableMinutes(25);
      setPreferredTime('evening');
      setEnvironment('home');
      setActivityPreference('Mobility & Stretching');
      setCurrentPreferences('Exhausted from late work shift, tight hamstrings & low back.');
      setEquipmentAvailable(['Mat', 'Foam roller']);
    } else if (preset === 'peak_energy') {
      setSleepHours(8.0);
      setSleepQuality(9);
      setEnergyLevel(9);
      setFatigueLevel(2);
      setSorenessLevel(2);
      setStressLevel(2);
      setMood('great');
      setCognitiveLoad(3);
      setAvailableMinutes(60);
      setPreferredTime('morning');
      setEnvironment('outdoor');
      setActivityPreference('Aerobic Cardio');
      setCurrentPreferences('Feeling energized, ready for aerobic threshold or tempo run.');
      setEquipmentAvailable(['Running shoes', 'Mat']);
    } else if (preset === 'gym_strength') {
      setSleepHours(7.4);
      setSleepQuality(8);
      setEnergyLevel(8);
      setFatigueLevel(3);
      setSorenessLevel(3);
      setStressLevel(3);
      setMood('good');
      setCognitiveLoad(4);
      setAvailableMinutes(50);
      setPreferredTime('morning');
      setEnvironment('gym');
      setActivityPreference('Functional Strength');
      setCurrentPreferences('Full gym access, scheduled progressive compound lifts.');
      setEquipmentAvailable(['Dumbbells', 'Barbell & Rack', 'Treadmill', 'Mat']);
    } else if (preset === 'busy_travel') {
      setSleepHours(6.0);
      setSleepQuality(5);
      setEnergyLevel(5);
      setFatigueLevel(6);
      setSorenessLevel(4);
      setStressLevel(6);
      setMood('anxious');
      setCognitiveLoad(7);
      setAvailableMinutes(20);
      setPreferredTime('afternoon');
      setEnvironment('other');
      setActivityPreference('Walking / Active Recovery');
      setCurrentPreferences('Hotel room, no equipment, need quick restorative mental break.');
      setEquipmentAvailable(['No equipment']);
    }
  };

  const handleSelectHistoricalRecord = (record: DailyContext) => {
    setDate(record.date);
    setSleepHours(record.sleepHours);
    setSleepQuality(record.sleepQuality || 6);
    setEnergyLevel(record.energyLevel);
    setFatigueLevel(record.fatigueLevel);
    setSorenessLevel(record.sorenessLevel || 5);
    setStressLevel(record.stressLevel);
    setMood(record.mood || 'good');
    setCognitiveLoad(record.cognitiveLoad || 5);
    setAvailableMinutes(record.availableMinutes);
    setPreferredTime(record.preferredTime || 'morning');
    setEnvironment((record.environment as any) || 'home');
    setEquipmentAvailable(record.equipmentAvailable || ['Mat']);
    setActivityPreference(record.activityPreference || 'Functional Strength');
    setCurrentPreferences(record.currentPreferences || '');
    setHydrationLiters(record.hydrationLiters || 1.5);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  // Equipment options
  const equipmentOptions = [
    'No equipment',
    'Mat',
    'Dumbbells',
    'Resistance bands',
    'Treadmill',
    'Kettlebell',
    'Foam roller',
    'Pull-up bar',
    'Barbell & Rack',
    'Other'
  ];

  // Activity type options
  const activityTypes = [
    'Functional Strength',
    'Aerobic Cardio',
    'Mobility & Stretching',
    'HIIT',
    'Walking / Active Recovery',
    'Yoga'
  ];

  const moodOptions = [
    { value: 'great', label: 'Great', color: 'text-emerald-400' },
    { value: 'good', label: 'Good', color: 'text-teal-400' },
    { value: 'neutral', label: 'Neutral', color: 'text-slate-300' },
    { value: 'low', label: 'Low', color: 'text-amber-400' },
    { value: 'anxious', label: 'Anxious', color: 'text-rose-400' },
    { value: 'fatigued', label: 'Fatigued', color: 'text-purple-400' }
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* 1. Top Header Banner with Preset Buttons */}
      <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Dynamic Context Engine
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Record Daily Conditions & Context</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Record physical recovery, mental load, schedule availability, and equipment to drive personalized recommendation synthesis and goal conflict detection.
          </p>
        </div>

        {/* Quick Test Presets */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Quick Presets:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => applyPreset('poor_sleep')}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
            >
              Sleep Deficit
            </button>
            <button
              type="button"
              onClick={() => applyPreset('peak_energy')}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            >
              Peak Energy
            </button>
            <button
              type="button"
              onClick={() => applyPreset('gym_strength')}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
            >
              Gym Day
            </button>
            <button
              type="button"
              onClick={() => applyPreset('busy_travel')}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              Travel / Busy
            </button>
          </div>
        </div>
      </div>

      {/* 2. Today's State Summary Card (Synthesized from context & evolving state) */}
      {context && evolvingState && (
        <TodayStateSummary
          context={context}
          evolvingState={evolvingState}
          goals={goals}
          onNavigateToModule={setActiveModule}
        />
      )}

      {/* 3. Comprehensive Form Input */}
      <form onSubmit={handleSave} className="space-y-6">
        {serverError && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CATEGORY 1: PHYSICAL / RECOVERY */}
          <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Physical & Recovery Domain</span>
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">Live Recovery Estimate:</span>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                    liveRecoveryEstimate.status === 'good'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : liveRecoveryEstimate.status === 'low'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {liveRecoveryEstimate.score}% ({liveRecoveryEstimate.status})
                </span>
              </div>
            </div>

            {/* Date Picker */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Record Date</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full sm:w-48 p-2 rounded-lg border border-slate-800 bg-slate-900 text-xs text-white focus:outline-emerald-500"
              />
            </div>

            {/* Sleep Duration */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-300">Sleep Duration (Hours)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0.5"
                    max="24"
                    step="0.1"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(Number(e.target.value))}
                    className="w-20 p-1 rounded bg-slate-900 border border-slate-700 text-right font-mono font-bold text-indigo-400 text-xs focus:outline-indigo-500"
                  />
                  <span className="text-slate-400 text-xs">hrs</span>
                </div>
              </div>
              <input
                type="range"
                min="3.0"
                max="12.0"
                step="0.1"
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>3.0h (Severe deficit)</span>
                <span>7.5h (Optimal baseline)</span>
                <span>12.0h</span>
              </div>
              {validationErrors.sleepHours && (
                <p className="text-rose-400 text-[11px]">{validationErrors.sleepHours}</p>
              )}
            </div>

            {/* Sleep Quality */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-300">Sleep Quality (1-10)</label>
                <span className="font-mono font-bold text-slate-200">{sleepQuality} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={sleepQuality}
                onChange={(e) => setSleepQuality(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1 (Fragmented / restless)</span>
                <span>5 (Average)</span>
                <span>10 (Deeply restorative)</span>
              </div>
            </div>

            {/* Energy Level */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Energy Level (1-10)</span>
                </label>
                <span className="font-mono font-bold text-amber-400">{energyLevel} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1 (Exhausted / lethargic)</span>
                <span>5 (Normal)</span>
                <span>10 (Peak vitality)</span>
              </div>
            </div>

            {/* Fatigue Level */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-300 flex items-center gap-1">
                  <BatteryCharging className="w-3.5 h-3.5 text-rose-400" />
                  <span>Fatigue Level (1-10)</span>
                </label>
                <span className="font-mono font-bold text-rose-400">{fatigueLevel} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={fatigueLevel}
                onChange={(e) => setFatigueLevel(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1 (Fully refreshed)</span>
                <span>5 (Mild weariness)</span>
                <span>10 (Overwhelming exhaustion)</span>
              </div>
            </div>

            {/* Muscle Soreness */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-300 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-purple-400" />
                  <span>Muscle Soreness / DOMS (1-10)</span>
                </label>
                <span className="font-mono font-bold text-purple-400">{sorenessLevel} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={sorenessLevel}
                onChange={(e) => setSorenessLevel(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1 (Supple / no soreness)</span>
                <span>5 (Moderate tenderness)</span>
                <span>10 (Severe muscle stiffness)</span>
              </div>
            </div>

            {/* Hydration Input */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-300 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Hydration Tracking</span>
                </label>
                <span className="font-mono font-bold text-cyan-400">{hydrationLiters.toFixed(2)} Liters</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={hydrationLiters}
                onChange={(e) => setHydrationLiters(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>

          {/* CATEGORY 2: MENTAL, AVAILABILITY & ENVIRONMENT */}
          <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Brain className="w-4 h-4 text-emerald-400" />
              <span>Mental, Availability & Environment</span>
            </h3>

            {/* Stress Level */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>Stress Level (1-10)</span>
                </label>
                <span className="font-mono font-bold text-orange-400">{stressLevel} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={stressLevel}
                onChange={(e) => setStressLevel(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1 (Calm & relaxed)</span>
                <span>5 (Manageable demands)</span>
                <span>10 (High acute stress)</span>
              </div>
            </div>

            {/* Mood Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-teal-400" />
                <span>Subjective Mood</span>
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {moodOptions.map(m => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMood(m.value)}
                    className={`py-1.5 px-2 rounded-lg border font-medium text-center transition-all ${
                      mood === m.value
                        ? 'bg-slate-800 border-emerald-500/80 text-white shadow-2xs font-semibold'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-850'
                    }`}
                  >
                    <span className={mood === m.value ? m.color : ''}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cognitive Load */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-300 flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Cognitive Load (1-10)</span>
                </label>
                <span className="font-mono font-bold text-indigo-400">{cognitiveLoad} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={cognitiveLoad}
                onChange={(e) => setCognitiveLoad(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1 (Light focus needed)</span>
                <span>5 (Standard work)</span>
                <span>10 (Deep mental exhaustion)</span>
              </div>
            </div>

            {/* Available Time for Activity */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                  <span>Available Time for Activity</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={availableMinutes}
                    onChange={(e) => setAvailableMinutes(Number(e.target.value))}
                    className="w-16 p-1 rounded bg-slate-900 border border-slate-700 text-right font-mono font-bold text-teal-400 text-xs focus:outline-teal-500"
                  />
                  <span className="text-slate-400 text-xs">min</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="5"
                value={availableMinutes}
                onChange={(e) => setAvailableMinutes(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0m (Rest day)</span>
                <span>30m (Optimal session)</span>
                <span>120m+</span>
              </div>
              {validationErrors.availableMinutes && (
                <p className="text-rose-400 text-[11px]">{validationErrors.availableMinutes}</p>
              )}
            </div>

            {/* Preferred Time of Day */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Preferred Time of Day</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['morning', 'afternoon', 'evening'] as const).map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setPreferredTime(time)}
                    className={`py-1.5 px-2 rounded-lg border font-semibold capitalize text-center transition-all ${
                      preferredTime === time
                        ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Environment */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-emerald-400" />
                <span>Environment Setting</span>
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {(['home', 'gym', 'outdoor', 'other'] as const).map(env => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setEnvironment(env)}
                    className={`py-2 px-1 rounded-lg border font-semibold capitalize text-center transition-all ${
                      environment === env
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-2xs'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CATEGORY 3: EQUIPMENT & PREFERENCES */}
        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            <span>Equipment & Activity Preferences</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Equipment Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Available Equipment on Hand ({equipmentAvailable.length} selected)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {equipmentOptions.map(eq => {
                  const isChecked = equipmentAvailable.includes(eq);
                  return (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => handleToggleEquipment(eq)}
                      className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1 ${
                        isChecked
                          ? 'bg-slate-800 border-slate-600 text-white font-medium'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 text-emerald-400" />}
                      <span>{eq}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Workout Type & Current Preference */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Preferred Activity / Workout Type
                </label>
                <select
                  value={activityPreference}
                  onChange={(e) => setActivityPreference(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-800 bg-slate-900 text-xs text-white focus:outline-emerald-500"
                >
                  {activityTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Current Preference if Different (or Daily Notes)
                </label>
                <textarea
                  rows={2}
                  value={currentPreferences}
                  onChange={(e) => setCurrentPreferences(e.target.value)}
                  placeholder="E.g., Feeling tight from yesterday, prefer low-impact mobility over running today."
                  className="w-full p-2 rounded-lg border border-slate-800 bg-slate-900 text-xs text-white placeholder:text-slate-500 focus:outline-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Action Bottom Bar with Validation Feedback */}
        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            {savedSuccess ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-md border border-emerald-500/30 animate-pulse">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Daily context record saved & evolving state recalculated!</span>
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                Updates are stored as dated historical records and re-evaluated by the decision model.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveModule('today')}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingContext}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-[#0A0A0B] bg-emerald-500 hover:bg-emerald-400 transition-colors shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingContext ? 'Synthesizing Decision State...' : 'Save Context & Recalculate'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* 5. Context History & Trends Section */}
      <ContextHistoryChart
        history={contextHistory}
        onSelectRecord={handleSelectHistoricalRecord}
      />
    </div>
  );
};
