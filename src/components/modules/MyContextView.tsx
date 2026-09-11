import React, { useState, useEffect, useMemo } from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import { DailyContext } from '../../types/index.js';
import { TodayStateSummary } from './context/TodayStateSummary.js';
import { ContextHistoryChart } from './context/ContextHistoryChart.js';
import { Tabs, TabItem } from '../common/Tabs.js';
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
  Sparkles,
  Smile,
  Brain,
  Calendar,
  Layers,
  ChevronRight,
  Sliders,
  Target
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

  const [activeTab, setActiveTab] = useState('daily_state');

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
      setSleepHours(context.sleepHours ?? 7);
      setSleepQuality(context.sleepQuality ?? 5);
      setEnergyLevel(context.energyLevel ?? 5);
      setFatigueLevel(context.fatigueLevel ?? 5);
      setSorenessLevel(context.sorenessLevel ?? 4);
      setStressLevel(context.stressLevel ?? 5);
      setMood(context.mood || 'good');
      setCognitiveLoad(context.cognitiveLoad ?? 5);
      setAvailableMinutes(context.availableMinutes ?? 30);
      setPreferredTime(context.preferredTime || 'morning');
      setEnvironment((context.environment as any) || 'home');
      setEquipmentAvailable(context.equipmentAvailable || ['Mat', 'Dumbbells']);
      setActivityPreference(context.activityPreference || 'Functional Strength');
      setCurrentPreferences(context.currentPreferences || '');
      setHydrationLiters(context.hydrationLiters ?? 1.5);
    }
  }, [context]);

  // Real-time live estimate of recovery based on transparent formula
  const liveRecoveryEstimate = useMemo(() => {
    const sleep = Math.max(0, Math.min(24, Number(sleepHours) || 7));
    const quality = Math.max(1, Math.min(10, Number(sleepQuality) || 5));
    const energy = Math.max(1, Math.min(10, Number(energyLevel) || 5));
    const fatigue = Math.max(1, Math.min(10, Number(fatigueLevel) || 5));
    const stress = Math.max(1, Math.min(10, Number(stressLevel) || 5));
    const soreness = Math.max(1, Math.min(10, Number(sorenessLevel) || 4));

    const sleepRatio = Math.min(100, (sleep / 8.0) * 100);
    const qualityMultiplier = 0.70 + (quality / 10) * 0.45;
    const effectiveRest = sleepRatio * qualityMultiplier;

    const energyScore = energy * 10;
    const systemicPenalty = fatigue * 4.2 + stress * 3.4 + soreness * 2.4;

    const raw = Math.round(0.42 * effectiveRest + 0.38 * energyScore - 0.25 * systemicPenalty + 10);
    const score = Math.max(12, Math.min(98, isNaN(raw) ? 50 : raw));

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

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
    setActiveTab('daily_state');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

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

  const tabs: TabItem[] = [
    { id: 'daily_state', label: 'Daily State', icon: Activity },
    { id: 'availability', label: 'Availability & Environment', icon: Clock },
    { id: 'preferences', label: 'Goals & Preferences', icon: Target },
    { id: 'derived_state', label: 'Derived State & Trends', icon: Layers }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header & Presets */}
      <header className="border-b border-slate-800/80 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                Adaptive Health Context
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              My Health Context
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Log your recovery markers, available time, and environment to dynamically steer today's plan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Quick Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('poor_sleep')}
              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
            >
              Sleep Deficit
            </button>
            <button
              type="button"
              onClick={() => applyPreset('peak_energy')}
              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            >
              Peak Energy
            </button>
            <button
              type="button"
              onClick={() => applyPreset('gym_strength')}
              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
            >
              Gym Day
            </button>
            <button
              type="button"
              onClick={() => applyPreset('busy_travel')}
              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              Busy / Travel
            </button>
          </div>
        </div>
      </header>

      {/* D. CONTEXT SUMMARY BAR */}
      <section className="p-4 bg-[#121215] border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-medium">Date</span>
            <span className="font-mono font-semibold text-slate-200">{date}</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-medium">Live Recovery</span>
            <span className={`font-mono font-bold ${
              liveRecoveryEstimate.status === 'good' ? 'text-emerald-400' : liveRecoveryEstimate.status === 'low' ? 'text-rose-400' : 'text-amber-400'
            }`}>
              {liveRecoveryEstimate.score}% ({liveRecoveryEstimate.status})
            </span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-medium">Sleep</span>
            <span className="font-mono font-semibold text-slate-200">{Number(sleepHours || 0).toFixed(1)} hrs</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-medium">Available</span>
            <span className="font-mono font-semibold text-slate-200">{availableMinutes} min ({environment})</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-medium">Water</span>
            <span className="font-mono font-semibold text-cyan-400">{Number(hydrationLiters || 0).toFixed(2)} L</span>
          </div>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={isSavingContext}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0A0A0B] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSavingContext ? 'Saving...' : 'Save & Update'}</span>
        </button>
      </section>

      {/* TABS NAVIGATION */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
      />

      {serverError && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* TAB CONTENT */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: DAILY STATE (Physical, Recovery, Mental) */}
        {activeTab === 'daily_state' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Sleep & Physical */}
              <div className="p-5 bg-[#121215] border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>Sleep & Physical Recovery</span>
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="p-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-white focus:outline-emerald-500"
                    />
                  </div>
                </div>

                {/* Sleep Duration */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-semibold text-slate-300">Sleep Duration</label>
                    <span className="font-mono font-bold text-indigo-400">{Number(sleepHours || 0).toFixed(1)} hrs</span>
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
                    <span>3.0h (Deficit)</span>
                    <span>7.5h (Optimal)</span>
                    <span>12.0h</span>
                  </div>
                </div>

                {/* Sleep Quality */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="font-semibold text-slate-300">Sleep Quality</label>
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
                </div>

                {/* Energy Level */}
                <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                  <div className="flex justify-between text-xs">
                    <label className="font-semibold text-slate-300 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Energy Level</span>
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
                </div>

                {/* Fatigue Level */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="font-semibold text-slate-300 flex items-center gap-1">
                      <BatteryCharging className="w-3.5 h-3.5 text-rose-400" />
                      <span>Fatigue Level</span>
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
                </div>

                {/* Muscle Soreness */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="font-semibold text-slate-300 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-purple-400" />
                      <span>Muscle Soreness (DOMS)</span>
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
                </div>
              </div>

              {/* Card 2: Mental State & Hydration */}
              <div className="p-5 bg-[#121215] border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Brain className="w-4 h-4 text-emerald-400" />
                    <span>Mental Workload & Hydration</span>
                  </h3>
                </div>

                {/* Stress Level */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <label className="font-semibold text-slate-300 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      <span>Stress Level</span>
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
                      <span>Cognitive Workload</span>
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
                </div>

                {/* Hydration Input */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between text-xs">
                    <label className="font-semibold text-slate-300 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Hydration Level</span>
                    </label>
                    <span className="font-mono font-bold text-cyan-400">{Number(hydrationLiters || 0).toFixed(2)} L</span>
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
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0.5L (Low)</span>
                    <span>2.5L (Daily Target)</span>
                    <span>5.0L</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AVAILABILITY & ENVIRONMENT */}
        {activeTab === 'availability' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Schedule & Environment */}
              <div className="p-5 bg-[#121215] border border-slate-800 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Clock className="w-4 h-4 text-teal-400" />
                  <span>Time & Environment</span>
                </h3>

                {/* Available Time */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-semibold text-slate-300">Available Time</label>
                    <span className="font-mono font-bold text-teal-400">{availableMinutes} min</span>
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
                    <span>0m (Rest Day)</span>
                    <span>30m (Standard)</span>
                    <span>120m</span>
                  </div>
                </div>

                {/* Preferred Time */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Preferred Time of Day</label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {(['morning', 'afternoon', 'evening'] as const).map(time => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setPreferredTime(time)}
                        className={`py-2 px-2 rounded-lg border font-semibold capitalize text-center transition-all ${
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
                <div className="space-y-1.5 pt-1">
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
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'border-slate-800 text-slate-400 hover:bg-slate-800/60'
                        }`}
                      >
                        {env}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Equipment Available */}
              <div className="p-5 bg-[#121215] border border-slate-800 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Dumbbell className="w-4 h-4 text-emerald-400" />
                  <span>Equipment on Hand ({equipmentAvailable.length} selected)</span>
                </h3>

                <p className="text-xs text-slate-400">
                  HealthPilot filters recommended session exercises to only include equipment you currently have available.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {equipmentOptions.map(eq => {
                    const isChecked = equipmentAvailable.includes(eq);
                    return (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => handleToggleEquipment(eq)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
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
            </div>
          </div>
        )}

        {/* TAB 3: GOALS & PREFERENCES */}
        {activeTab === 'preferences' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-5 bg-[#121215] border border-slate-800 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Activity & Workout Preferences</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Preferred Workout Discipline
                  </label>
                  <select
                    value={activityPreference}
                    onChange={(e) => setActivityPreference(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900 text-xs text-white focus:outline-emerald-500"
                  >
                    {activityTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    HealthPilot will prefer this discipline unless acute fatigue or time constraints require an adaptive shift.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Daily Context Notes / Freeform Request
                  </label>
                  <textarea
                    rows={3}
                    value={currentPreferences}
                    onChange={(e) => setCurrentPreferences(e.target.value)}
                    placeholder="E.g., Feeling tight from yesterday desk work, prefer low-impact mobility over running today."
                    className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-900 text-xs text-white placeholder:text-slate-500 focus:outline-emerald-500"
                  />
                </div>
              </div>

              {/* Active Goals Summary */}
              {goals && goals.length > 0 && (
                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Active Goals Being Aligned
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {goals.filter(g => g.status === 'active').slice(0, 3).map(g => (
                      <div key={g.id} className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-xs space-y-1">
                        <div className="font-semibold text-white truncate">{g.title}</div>
                        <div className="text-[11px] text-slate-400 capitalize">{g.category} • Priority: {g.priority}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: DERIVED STATE & TRENDS */}
        {activeTab === 'derived_state' && (
          <div className="space-y-6 animate-fade-in">
            {/* Today State Summary */}
            {context && evolvingState && (
              <TodayStateSummary
                context={context}
                evolvingState={evolvingState}
                goals={goals}
                onNavigateToModule={setActiveModule}
              />
            )}

            {/* Context History & Trends */}
            <ContextHistoryChart
              history={contextHistory}
              onSelectRecord={handleSelectHistoricalRecord}
            />
          </div>
        )}

        {/* Action Bottom Bar */}
        <div className="p-4 bg-[#121215] border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {savedSuccess ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-md border border-emerald-500/30">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Daily context record saved & evolving state recalculated!</span>
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                Changes are immediately re-evaluated by the Decision Engine.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveModule('today')}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Back to Today
            </button>
            <button
              type="submit"
              disabled={isSavingContext}
              className="px-5 py-2.5 rounded-lg text-xs font-bold text-[#0A0A0B] bg-emerald-500 hover:bg-emerald-400 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingContext ? 'Saving...' : 'Save Context'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
