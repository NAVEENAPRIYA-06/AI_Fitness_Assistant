import React, { useState, useEffect, useMemo } from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import { DailyContext } from '../../types/index.js';
import {
  Save,
  Moon,
  Zap,
  Battery,
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
  CheckCircle2,
  Heart
} from 'lucide-react';
import { ContextHistoryChart } from './context/ContextHistoryChart.js';

export const MyContextView: React.FC = () => {
  const {
    context,
    contextHistory,
    updateContext,
    isSavingContext,
    setActiveModule
  } = useHealthPilot();

  const [viewTab, setViewTab] = useState<'checkin' | 'trends'>('checkin');

  // Local form state
  const [date, setDate] = useState<string>(
    context?.date || new Date().toISOString().split('T')[0]
  );

  // 1. SLEEP
  const [sleepHours, setSleepHours] = useState<number>(context?.sleepHours || 7.0);
  const [sleepQuality, setSleepQuality] = useState<number>(context?.sleepQuality || 7);

  // 2. BODY & ENERGY
  const [energyLevel, setEnergyLevel] = useState<number>(context?.energyLevel || 6);
  const [fatigueLevel, setFatigueLevel] = useState<number>(context?.fatigueLevel || 4);
  const [sorenessLevel, setSorenessLevel] = useState<number>(context?.sorenessLevel || 3);

  // 3. MENTAL WELLBEING
  const [stressLevel, setStressLevel] = useState<number>(context?.stressLevel || 4);
  const [mood, setMood] = useState<string>(context?.mood || 'focused');
  const [cognitiveLoad, setCognitiveLoad] = useState<number>(context?.cognitiveLoad || 5);

  // 4. TODAY'S SCHEDULE & ENVIRONMENT
  const [availableMinutes, setAvailableMinutes] = useState<number>(context?.availableMinutes ?? 35);
  const [preferredTime, setPreferredTime] = useState<'morning' | 'afternoon' | 'evening'>(
    context?.preferredTime || 'morning'
  );
  const [environment, setEnvironment] = useState<'home' | 'gym' | 'outdoor' | 'other'>(
    (context?.environment as any) || 'home'
  );
  const [equipmentAvailable, setEquipmentAvailable] = useState<string[]>(
    context?.equipmentAvailable || ['Dumbbells', 'Mat', 'Resistance bands']
  );

  // 5. PREFERENCES
  const [activityPreference, setActivityPreference] = useState<string>(
    context?.activityPreference || 'Mobility & Conditioning'
  );
  const [currentPreferences, setCurrentPreferences] = useState<string>(
    context?.currentPreferences || ''
  );
  const [hydrationLiters, setHydrationLiters] = useState<number>(context?.hydrationLiters || 1.5);

  // UI state
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (context) {
      setDate(context.date || new Date().toISOString().split('T')[0]);
      setSleepHours(context.sleepHours ?? 7);
      setSleepQuality(context.sleepQuality ?? 7);
      setEnergyLevel(context.energyLevel ?? 6);
      setFatigueLevel(context.fatigueLevel ?? 4);
      setSorenessLevel(context.sorenessLevel ?? 3);
      setStressLevel(context.stressLevel ?? 4);
      setMood(context.mood || 'focused');
      setCognitiveLoad(context.cognitiveLoad ?? 5);
      setAvailableMinutes(context.availableMinutes ?? 35);
      setPreferredTime(context.preferredTime || 'morning');
      setEnvironment((context.environment as any) || 'home');
      setEquipmentAvailable(context.equipmentAvailable || ['Dumbbells', 'Mat', 'Resistance bands']);
      setActivityPreference(context.activityPreference || 'Mobility & Conditioning');
      setCurrentPreferences(context.currentPreferences || '');
      setHydrationLiters(context.hydrationLiters ?? 1.5);
    }
  }, [context]);

  // Live recovery estimation
  const liveRecovery = useMemo(() => {
    const sleep = Math.max(0, Math.min(14, Number(sleepHours) || 7));
    const quality = Math.max(1, Math.min(10, Number(sleepQuality) || 7));
    const energy = Math.max(1, Math.min(10, Number(energyLevel) || 6));
    const fatigue = Math.max(1, Math.min(10, Number(fatigueLevel) || 4));
    const stress = Math.max(1, Math.min(10, Number(stressLevel) || 4));
    const soreness = Math.max(1, Math.min(10, Number(sorenessLevel) || 3));

    const sleepRatio = Math.min(100, (sleep / 8.0) * 100);
    const qualityMultiplier = 0.70 + (quality / 10) * 0.45;
    const effectiveRest = sleepRatio * qualityMultiplier;

    const energyScore = energy * 10;
    const systemicPenalty = fatigue * 4.2 + stress * 3.4 + soreness * 2.4;

    const raw = Math.round(0.42 * effectiveRest + 0.38 * energyScore - 0.25 * systemicPenalty + 10);
    const score = Math.max(15, Math.min(98, isNaN(raw) ? 70 : raw));

    let status = 'Moderate';
    if (score >= 75) status = 'Optimal';
    else if (score < 50) status = 'Constrained';

    return { score, status };
  }, [sleepHours, sleepQuality, energyLevel, fatigueLevel, stressLevel, sorenessLevel]);

  const handleToggleEquipment = (item: string) => {
    setEquipmentAvailable(prev =>
      prev.includes(item) ? prev.filter(e => e !== item) : [...prev, item]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(false);

    const payload: Partial<DailyContext> = {
      date,
      sleepHours: Number(sleepHours),
      sleepDuration: Number(sleepHours),
      sleepQuality: Number(sleepQuality),
      energyLevel: Number(energyLevel),
      fatigueLevel: Number(fatigueLevel),
      sorenessLevel: Number(sorenessLevel),
      stressLevel: Number(stressLevel),
      mood,
      cognitiveLoad: Number(cognitiveLoad),
      availableMinutes: Number(availableMinutes),
      preferredTime,
      environment,
      equipmentAvailable,
      activityPreference,
      currentPreferences,
      hydrationLiters: Number(hydrationLiters),
      recoveryScore: liveRecovery.score
    };

    try {
      await updateContext(payload);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4500);
    } catch (err) {
      console.error('Error saving context:', err);
    }
  };

  const allEquipmentOptions = [
    'Dumbbells',
    'Resistance bands',
    'Mat',
    'Kettlebell',
    'Pull-up bar',
    'Barbell & Rack',
    'Cardio Machine',
    'Bodyweight only'
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>Daily Check-In</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            How are you feeling today?
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-normal">
            Update your sleep, body readiness, and schedule. HealthPilot will recalibrate your workout.
          </p>
        </div>

        {/* Tab switch between Form and Trends */}
        <div className="flex items-center p-1 bg-[var(--surface-soft)] rounded-2xl border border-[var(--border)] self-start sm:self-auto">
          <button
            onClick={() => setViewTab('checkin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewTab === 'checkin'
                ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs border border-[var(--border)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Today's Check-In
          </button>
          <button
            onClick={() => setViewTab('trends')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewTab === 'trends'
                ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs border border-[var(--border)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Past Trends
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-[var(--primary-soft)] border border-[var(--primary)]/30 text-[var(--text-primary)] flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[var(--primary)] shrink-0" />
            <div>
              <p className="text-xs font-bold">Context saved successfully!</p>
              <p className="text-xs text-[var(--text-secondary)]">Your workout recommendation and plan have been refreshed.</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModule('today')}
            className="px-4 py-1.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:bg-[var(--primary-hover)] transition-colors shadow-xs"
          >
            View Today's Plan →
          </button>
        </div>
      )}

      {viewTab === 'trends' ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 space-y-4">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Recent Check-In History</h3>
          <p className="text-xs text-[var(--text-muted)]">Recovery score, sleep duration, and energy levels over past sessions.</p>
          <ContextHistoryChart history={contextHistory} />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Estimated Recovery Live Preview Card */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary-soft)] border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)] font-bold text-lg">
                {liveRecovery.score}%
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">Estimated Readiness</span>
                <p className="text-base font-bold text-[var(--text-primary)]">
                  {liveRecovery.status} Readiness
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Recalculates dynamically as you adjust your sleep, energy, and fatigue.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingContext}
              className="px-6 py-3 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingContext ? 'Saving...' : "Save Today's Context"}</span>
            </button>
          </div>

          {/* 1. SLEEP */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border)]">
              <div className="w-8 h-8 rounded-xl bg-[var(--secondary-soft)] text-[var(--secondary)] flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Sleep</h3>
                <p className="text-xs text-[var(--text-muted)]">Your rest from last night</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Sleep Duration */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--text-primary)]">Sleep Duration</span>
                  <span className="font-bold text-sm text-[var(--primary)]">{sleepHours} hours</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={12}
                  step={0.5}
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-medium">
                  <span>3h (Short)</span>
                  <span>7-8h (Recommended)</span>
                  <span>12h</span>
                </div>
              </div>

              {/* Sleep Quality */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--text-primary)]">Sleep Quality</span>
                  <span className="font-bold text-sm text-[var(--primary)]">{sleepQuality} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-medium">
                  <span>Restless</span>
                  <span>Moderate</span>
                  <span>Deep & Restorative</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. BODY & ENERGY */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border)]">
              <div className="w-8 h-8 rounded-xl bg-[var(--warning-soft)] text-[var(--warning)] flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Body & Energy</h3>
                <p className="text-xs text-[var(--text-muted)]">Your physical stamina and fatigue</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Energy Level */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--text-primary)]">Energy Level</span>
                  <span className="font-bold text-sm text-[var(--warning)]">{energyLevel} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(Number(e.target.value))}
                  className="w-full accent-[var(--warning)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                  <span>Drained</span>
                  <span>Energetic</span>
                </div>
              </div>

              {/* Fatigue Level */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--text-primary)]">Fatigue Level</span>
                  <span className="font-bold text-sm text-[var(--danger)]">{fatigueLevel} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={fatigueLevel}
                  onChange={(e) => setFatigueLevel(Number(e.target.value))}
                  className="w-full accent-[var(--danger)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                  <span>Fresh</span>
                  <span>Exhausted</span>
                </div>
              </div>

              {/* Soreness Level */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--text-primary)]">Muscle Soreness</span>
                  <span className="font-bold text-sm text-[var(--text-primary)]">{sorenessLevel} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={sorenessLevel}
                  onChange={(e) => setSorenessLevel(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                  <span>None</span>
                  <span>Noticeable</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. MENTAL WELLBEING */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border)]">
              <div className="w-8 h-8 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Mental Wellbeing</h3>
                <p className="text-xs text-[var(--text-muted)]">Stress, mood, and mental load</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Stress Level */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--text-primary)]">Stress Level</span>
                  <span className="font-bold text-sm text-[var(--text-primary)]">{stressLevel} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={stressLevel}
                  onChange={(e) => setStressLevel(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                  <span>Calm</span>
                  <span>High Stress</span>
                </div>
              </div>

              {/* Mood */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--text-primary)] block">
                  Mood Today
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                >
                  <option value="great">Great & Enthusiastic</option>
                  <option value="focused">Focused & Grounded</option>
                  <option value="good">Good / Normal</option>
                  <option value="neutral">Neutral / Meh</option>
                  <option value="fatigued">Fatigued / Low</option>
                  <option value="stressed">Overwhelmed</option>
                </select>
              </div>

              {/* Cognitive Load */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--text-primary)]">Cognitive Load</span>
                  <span className="font-bold text-sm text-[var(--text-primary)]">{cognitiveLoad} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={cognitiveLoad}
                  onChange={(e) => setCognitiveLoad(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                  <span>Clear Mind</span>
                  <span>High Demands</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. TODAY'S SCHEDULE & ENVIRONMENT */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border)]">
              <div className="w-8 h-8 rounded-xl bg-[var(--secondary-soft)] text-[var(--secondary)] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Today's Schedule</h3>
                <p className="text-xs text-[var(--text-muted)]">Time, location, and equipment</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Available Time */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--text-primary)]">Available Time</span>
                  <span className="font-bold text-sm text-[var(--primary)]">{availableMinutes} min</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={90}
                  step={5}
                  value={availableMinutes}
                  onChange={(e) => setAvailableMinutes(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                  <span>10m</span>
                  <span>30m</span>
                  <span>60m+</span>
                </div>
              </div>

              {/* Preferred Time */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--text-primary)] block">
                  Preferred Time of Day
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['morning', 'afternoon', 'evening'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPreferredTime(t)}
                      className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                        preferredTime === t
                          ? 'bg-[var(--primary)] text-white shadow-xs'
                          : 'bg-[var(--surface-soft)] text-[var(--text-secondary)] border border-[var(--border)]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Environment */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--text-primary)] block">
                  Environment
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['home', 'gym', 'outdoor'] as const).map(env => (
                    <button
                      key={env}
                      type="button"
                      onClick={() => setEnvironment(env)}
                      className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                        environment === env
                          ? 'bg-[var(--primary)] text-white shadow-xs'
                          : 'bg-[var(--surface-soft)] text-[var(--text-secondary)] border border-[var(--border)]'
                      }`}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Equipment Checkboxes */}
            <div className="space-y-2.5 pt-2">
              <label className="text-xs font-semibold text-[var(--text-primary)] block">
                Equipment Available Today
              </label>
              <div className="flex flex-wrap gap-2">
                {allEquipmentOptions.map(eq => {
                  const isChecked = equipmentAvailable.includes(eq);
                  return (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => handleToggleEquipment(eq)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                        isChecked
                          ? 'bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/30 font-semibold'
                          : 'bg-[var(--surface-soft)] text-[var(--text-secondary)] border border-[var(--border)]'
                      }`}
                    >
                      <Check className={`w-3 h-3 ${isChecked ? 'opacity-100' : 'opacity-0'}`} />
                      <span>{eq}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. PREFERENCES */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border)]">
              <div className="w-8 h-8 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Preferences</h3>
                <p className="text-xs text-[var(--text-muted)]">Activity style and personal notes for today</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--text-primary)] block">
                  Preferred Activity Type
                </label>
                <select
                  value={activityPreference}
                  onChange={(e) => setActivityPreference(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                >
                  <option value="Mobility & Conditioning">Mobility & Gentle Conditioning</option>
                  <option value="Functional Strength">Functional Strength</option>
                  <option value="Zone 2 Aerobic">Zone 2 Aerobic / Cardio</option>
                  <option value="HIIT / Intervals">HIIT / Express Intervals</option>
                  <option value="Recovery Yoga & Breathwork">Recovery Yoga & Breathwork</option>
                  <option value="Outdoor Brisk Walk">Outdoor Brisk Walk</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--text-primary)] block">
                  Notes for HealthPilot Coach (Optional)
                </label>
                <input
                  type="text"
                  value={currentPreferences}
                  onChange={(e) => setCurrentPreferences(e.target.value)}
                  placeholder="e.g. Mild lower back tightness, prefer low impact"
                  className="w-full p-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                />
              </div>
            </div>
          </div>

          {/* Bottom Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveModule('today')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingContext}
              className="px-7 py-3 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingContext ? 'Saving...' : "Save Today's Context"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
