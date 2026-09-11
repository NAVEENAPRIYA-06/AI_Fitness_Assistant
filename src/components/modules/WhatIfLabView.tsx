import React, { useState, useEffect } from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import { WhatIfScenarioResult, WhatIfCandidateItem, SensitivityDataPoint } from '../../types/index.js';
import {
  FlaskConical,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
  Clock,
  Zap,
  BatteryCharging,
  Home,
  Dumbbell,
  RefreshCw,
  RotateCcw,
  Shield,
  Target,
  CheckCircle2,
  Sliders,
  Activity,
  Moon,
  Scale,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react';

export const WhatIfLabView: React.FC = () => {
  const { context, runWhatIfScenario, setActiveModule, sendCoachMessage } = useHealthPilot();

  // Mode: 'full_scenario' or 'single_variable'
  const [labMode, setLabMode] = useState<'full_scenario' | 'single_variable'>('full_scenario');

  // Scenario variables
  const [availableMinutes, setAvailableMinutes] = useState(context?.availableMinutes || 30);
  const [energyLevel, setEnergyLevel] = useState(context?.energyLevel || 5);
  const [fatigueLevel, setFatigueLevel] = useState(context?.fatigueLevel || 7);
  const [stressLevel, setStressLevel] = useState(context?.stressLevel || 6);
  const [sorenessLevel, setSorenessLevel] = useState(context?.sorenessLevel || 4);
  const [sleepHours, setSleepHours] = useState(context?.sleepHours || 7.0);
  const [sleepQuality, setSleepQuality] = useState(context?.sleepQuality || 6);
  const [environment, setEnvironment] = useState<'home' | 'gym' | 'outdoor' | 'travel'>(
    context?.environment || 'home'
  );
  const [equipmentType, setEquipmentType] = useState<'full_gym' | 'dumbbells' | 'bodyweight' | 'minimal'>('dumbbells');
  const [candidateDuration, setCandidateDuration] = useState(20);
  const [candidateIntensity, setCandidateIntensity] = useState<'low' | 'moderate' | 'high'>('low');
  const [activityType, setActivityType] = useState('Functional Strength');

  // Single-variable sensitivity selection
  const [sensitivityVar, setSensitivityVar] = useState<'availableMinutes' | 'fatigueLevel' | 'sleepHours'>('availableMinutes');

  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<WhatIfScenarioResult | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Run simulation
  const runSimulation = async (customSensitivityVar?: string) => {
    setIsSimulating(true);
    const sim = await runWhatIfScenario({
      availableMinutes,
      energyLevel,
      fatigueLevel,
      stressLevel,
      sorenessLevel,
      sleepHours,
      sleepQuality,
      environment,
      equipmentAvailable: equipmentType === 'full_gym' ? ['Barbell & Rack', 'Dumbbells', 'Cable machine'] : equipmentType === 'dumbbells' ? ['Dumbbells', 'Yoga mat'] : ['Yoga mat'],
      candidateDurationMinutes: candidateDuration,
      candidateIntensity,
      activityType,
      sensitivityVariable: customSensitivityVar || sensitivityVar
    });
    if (sim) {
      setResult(sim);
    }
    setIsSimulating(false);
  };

  useEffect(() => {
    runSimulation();
  }, [
    availableMinutes,
    energyLevel,
    fatigueLevel,
    stressLevel,
    sorenessLevel,
    sleepHours,
    sleepQuality,
    environment,
    equipmentType,
    candidateDuration,
    candidateIntensity,
    activityType,
    sensitivityVar
  ]);

  // Reset to active current context
  const handleResetToCurrent = () => {
    setAvailableMinutes(context?.availableMinutes || 30);
    setEnergyLevel(context?.energyLevel || 5);
    setFatigueLevel(context?.fatigueLevel || 7);
    setStressLevel(context?.stressLevel || 6);
    setSorenessLevel(context?.sorenessLevel || 4);
    setSleepHours(context?.sleepHours || 7.0);
    setSleepQuality(context?.sleepQuality || 6);
    setEnvironment(context?.environment || 'home');
    setEquipmentType('dumbbells');
    setCandidateDuration(20);
    setCandidateIntensity('low');
    setActivityType('Functional Strength');
  };

  // 10 Presets
  const applyPreset = (presetKey: string) => {
    switch (presetKey) {
      case 'more_time':
        setAvailableMinutes(60);
        setCandidateDuration(45);
        break;
      case 'less_time':
        setAvailableMinutes(15);
        setCandidateDuration(15);
        setCandidateIntensity('moderate');
        break;
      case 'better_sleep':
        setSleepHours(8.5);
        setSleepQuality(9);
        setFatigueLevel(2);
        setEnergyLevel(8);
        break;
      case 'poor_sleep':
        setSleepHours(4.5);
        setSleepQuality(3);
        setFatigueLevel(8);
        setEnergyLevel(3);
        break;
      case 'lower_energy':
        setEnergyLevel(2);
        setFatigueLevel(8);
        setCandidateIntensity('low');
        break;
      case 'higher_fatigue':
        setFatigueLevel(9);
        setSorenessLevel(8);
        setCandidateIntensity('low');
        break;
      case 'gym_available':
        setEnvironment('gym');
        setEquipmentType('full_gym');
        setAvailableMinutes(50);
        setCandidateDuration(45);
        setCandidateIntensity('moderate');
        break;
      case 'no_gym':
        setEnvironment('home');
        setEquipmentType('bodyweight');
        setCandidateDuration(20);
        break;
      case 'recovery_day':
        setCandidateDuration(20);
        setCandidateIntensity('low');
        setActivityType('Active Recovery');
        break;
      case 'short_workout':
        setAvailableMinutes(20);
        setCandidateDuration(15);
        setCandidateIntensity('moderate');
        break;
      default:
        break;
    }
  };

  // Ask AI Coach about simulation
  const handleAskCoachAboutScenario = async () => {
    if (!result) return;
    const query = `Can you explain the What-If simulation outcome? I simulated a ${candidateDuration}-minute ${candidateIntensity}-intensity ${activityType} in ${environment} with ${availableMinutes}m available time, ${sleepHours}h sleep, and ${fatigueLevel}/10 fatigue. The model shifted adherence from ${result.baselineAdherence}% to ${result.simulatedAdherence}%.`;
    setActiveModule('coach');
    await sendCoachMessage(query);
  };

  return (
    <div className="space-y-6">
      {/* Research Lab Header */}
      <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-emerald-400" />
                Counterfactual Decision Lab
              </span>
              <span className="text-xs text-slate-400 font-mono">XAI Scenario Analysis</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Advanced What-If / Counterfactual Analysis
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Explore how changes in current physiological, temporal, and environmental conditions alter
              HealthPilot's adherence predictions, genuine SHAP feature attributions, and five-factor Decision Intelligence rankings.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-lg border border-slate-800 self-start lg:self-auto">
            <button
              onClick={() => setLabMode('full_scenario')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                labMode === 'full_scenario'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 inline mr-1.5" />
              Full Scenario Lab
            </button>
            <button
              onClick={() => setLabMode('single_variable')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                labMode === 'single_variable'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5 inline mr-1.5" />
              Change One Variable
            </button>
          </div>
        </div>

        {/* 10 Scenario Presets Bar */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Scenario Presets (10 Realistic Conditions):
            </span>
            <button
              onClick={handleResetToCurrent}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to Current Conditions
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'more_time', label: '1. More Available Time' },
              { id: 'less_time', label: '2. Less Available Time' },
              { id: 'better_sleep', label: '3. Better Sleep' },
              { id: 'poor_sleep', label: '4. Poor Sleep' },
              { id: 'lower_energy', label: '5. Lower Energy' },
              { id: 'higher_fatigue', label: '6. Higher Fatigue' },
              { id: 'gym_available', label: '7. Gym Available' },
              { id: 'no_gym', label: '8. No Gym Access' },
              { id: 'recovery_day', label: '9. Recovery Day' },
              { id: 'short_workout', label: '10. Short Workout' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reassurance and Research Notice Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-300">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Zero State Mutation:</strong> What-If simulations run entirely in-memory. They do not alter your real evolving state, change your Adaptive Plan, or log outcome records.
            </span>
          </div>
          <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20 flex items-center gap-2 text-xs text-amber-300">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Model-based scenario estimate:</strong> Outputs reflect mathematical decision and ML regression attributions; they are not clinical forecasts or causal guarantees.
            </span>
          </div>
        </div>
      </div>

      {/* SINGLE-VARIABLE SENSITIVITY MODE */}
      {labMode === 'single_variable' && (
        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Scenario Sensitivity Analysis (Change One Variable)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Parametric Sweep
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Isolates a single independent variable across five realistic test increments while holding all other parameters fixed.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Select Variable:</span>
              <select
                value={sensitivityVar}
                onChange={(e) => setSensitivityVar(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 font-medium focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="availableMinutes">Available Time (15 → 60m)</option>
                <option value="fatigueLevel">Fatigue Level (2 → 10)</option>
                <option value="sleepHours">Sleep Duration (4 → 8.5h)</option>
              </select>
            </div>
          </div>

          {result?.sensitivityAnalysis && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {result.sensitivityAnalysis.points.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-white text-sm">{pt.label}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Step {idx + 1}</span>
                      </div>
                      <div className="mt-2 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Adherence:</span>
                          <span className="font-mono font-bold text-emerald-400">{pt.predictedAdherence}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Decision Score:</span>
                          <span className="font-mono font-bold text-indigo-400">
                            {Math.round(pt.decisionScore * 100)} / 100
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block uppercase">Selected Intervention:</span>
                      <span className="text-[11px] font-semibold text-slate-200 line-clamp-2 mt-0.5">
                        {pt.recommendedTitle}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Scenario sensitivity analysis:</strong> Demonstrates how the recommendation shifts along an isolated parameter curve. Does not imply a direct causal relationship.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FULL SCENARIO LAB INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Human-Friendly Scenario Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>What-If Scenario Controls</span>
              </h3>
              {isSimulating && <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />}
            </div>

            {/* 1. Available Time */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Available Time Window</span>
                </label>
                <span className="font-mono font-bold text-emerald-400">{availableMinutes} min</span>
              </div>
              <div className="flex items-center gap-1">
                {[15, 20, 30, 45, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setAvailableMinutes(m)}
                    className={`flex-1 py-1 rounded text-[11px] font-mono font-semibold border transition-all ${
                      availableMinutes === m
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={availableMinutes}
                onChange={(e) => setAvailableMinutes(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* 2. Sleep Duration & Sleep Quality */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-300 flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Sleep Duration</span>
                  </label>
                  <span className="font-mono font-bold text-indigo-400">{sleepHours.toFixed(1)}h</span>
                </div>
                <input
                  type="range"
                  min="3.5"
                  max="10.0"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-300">Sleep Quality</label>
                  <span className="font-mono font-bold text-indigo-400">
                    {sleepQuality <= 4 ? 'Poor' : sleepQuality <= 7 ? 'Fair' : 'Good'} ({sleepQuality}/10)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* 3. Energy & Fatigue */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Energy Level</span>
                  </label>
                  <span className="font-mono font-bold text-amber-400">
                    {energyLevel <= 3 ? 'Low' : energyLevel <= 7 ? 'Moderate' : 'High'} ({energyLevel}/10)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-300 flex items-center gap-1">
                    <BatteryCharging className="w-3.5 h-3.5 text-rose-400" />
                    <span>Fatigue Level</span>
                  </label>
                  <span className="font-mono font-bold text-rose-400">
                    {fatigueLevel <= 3 ? 'Low' : fatigueLevel <= 7 ? 'Moderate' : 'High'} ({fatigueLevel}/10)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={fatigueLevel}
                  onChange={(e) => setFatigueLevel(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>
            </div>

            {/* 4. Psychological Stress & Soreness */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-300">Stress Level</label>
                  <span className="font-mono font-bold text-slate-300">{stressLevel}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(Number(e.target.value))}
                  className="w-full accent-slate-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-300">Soreness</label>
                  <span className="font-mono font-bold text-slate-300">{sorenessLevel}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={sorenessLevel}
                  onChange={(e) => setSorenessLevel(Number(e.target.value))}
                  className="w-full accent-slate-500 cursor-pointer"
                />
              </div>
            </div>

            {/* 5. Environment */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Workout Environment</label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {['home', 'gym', 'outdoor', 'travel'].map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setEnvironment(env as any)}
                    className={`py-1.5 rounded-lg border font-semibold capitalize text-center transition-all ${
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

            {/* 6. Equipment Availability */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Equipment Availability</label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { id: 'full_gym', label: 'Full Gym Setup' },
                  { id: 'dumbbells', label: 'Dumbbells & Bands' },
                  { id: 'bodyweight', label: 'Bodyweight Only' },
                  { id: 'minimal', label: 'Minimal / Mat' }
                ].map((eq) => (
                  <button
                    key={eq.id}
                    type="button"
                    onClick={() => setEquipmentType(eq.id as any)}
                    className={`py-1.5 px-2 rounded-lg border font-semibold text-center transition-all ${
                      equipmentType === eq.id
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    {eq.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 7. Workout Duration & Intensity */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-300">Duration</label>
                  <span className="font-mono font-bold text-indigo-400">{candidateDuration}m</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={candidateDuration}
                  onChange={(e) => setCandidateDuration(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">Intensity</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['low', 'moderate', 'high'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setCandidateIntensity(lvl)}
                      className={`py-1 rounded border text-[10px] font-semibold capitalize transition-all ${
                        candidateIntensity === lvl
                          ? 'bg-slate-800 border-slate-700 text-white font-bold'
                          : 'border-slate-800 text-slate-400 hover:bg-slate-800/60'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 8. Activity Type */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Preferred Activity Category</label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 font-medium outline-none"
              >
                <option value="Functional Strength">Functional Strength</option>
                <option value="Aerobic Cardio">Aerobic Cardio</option>
                <option value="Mobility & Stretching">Mobility & Stretching</option>
                <option value="Active Recovery">Active Recovery</option>
                <option value="Walking">Parasympathetic Walking</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Comparison, Changes, SHAP, 5-Factor, and Rankings */}
        <div className="lg:col-span-7 space-y-5">
          {result && (
            <>
              {/* SIDE-BY-SIDE: CURRENT vs. WHAT-IF */}
              <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      <Scale className="w-4 h-4 text-emerald-400" />
                      <span>Current vs. What-If Comparison</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Direct side-by-side evaluation of the active baseline against the counterfactual scenario
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Model-based scenario estimate
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CURRENT CARD */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        CURRENT (Active Baseline)
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        Live Recommendation
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">
                        {result.currentRecommendation?.title || 'Today Recommended Session'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {result.currentRecommendation?.durationMinutes || 20}m · {result.currentRecommendation?.intensity || 'moderate'} intensity · {result.currentRecommendation?.environment || 'home'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                      <div className="p-2 rounded bg-slate-800/50">
                        <span className="text-[10px] text-slate-400 block">Predicted Adherence</span>
                        <span className="text-lg font-mono font-extrabold text-white">
                          {result.currentRecommendation?.predictedAdherence || result.baselineAdherence}%
                        </span>
                      </div>
                      <div className="p-2 rounded bg-slate-800/50">
                        <span className="text-[10px] text-slate-400 block">Decision Score</span>
                        <span className="text-lg font-mono font-extrabold text-indigo-400">
                          {Math.round((result.currentRecommendation?.decisionScore || 0.78) * 100)} / 100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* WHAT-IF CARD */}
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/30 space-y-3 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                        WHAT-IF (Counterfactual)
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Hypothetical
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">
                        {result.whatIfRecommendation?.title || `${candidateDuration}-Min Scenario Session`}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {result.whatIfRecommendation?.durationMinutes || candidateDuration}m · {result.whatIfRecommendation?.intensity || candidateIntensity} intensity · {environment}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-500/20">
                      <div className="p-2 rounded bg-slate-900/60 border border-emerald-500/20">
                        <span className="text-[10px] text-emerald-300/80 block">Predicted Adherence</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-mono font-extrabold text-emerald-400">
                            {result.whatIfRecommendation?.predictedAdherence || result.simulatedAdherence}%
                          </span>
                          <span className={`text-[11px] font-mono font-bold ${result.deltaAdherence >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {result.deltaAdherence >= 0 ? `+${result.deltaAdherence}%` : `${result.deltaAdherence}%`}
                          </span>
                        </div>
                      </div>
                      <div className="p-2 rounded bg-slate-900/60 border border-emerald-500/20">
                        <span className="text-[10px] text-indigo-300/80 block">Decision Score</span>
                        <span className="text-lg font-mono font-extrabold text-indigo-300">
                          {Math.round((result.whatIfRecommendation?.decisionScore || 0.82) * 100)} / 100
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RECOMMENDED UNDER WHAT-IF BADGE & VERDICT */}
                <div className="p-3.5 bg-slate-900/70 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Recommended Under What-If Scenario:</span>
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">
                      {result.whatIfRecommendation?.title || 'Selected Best Fit'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.counterfactualExplanation || result.verdict}
                  </p>
                </div>
              </div>

              {/* CHANGE DETECTION CARD */}
              {result.detectedChanges && result.detectedChanges.length > 0 && (
                <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 border-b border-slate-800 pb-2.5">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span>Detected Scenario Adjustments & Impact Attribution</span>
                  </h3>
                  <div className="space-y-2">
                    {result.detectedChanges.map((change, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{change.variable}:</span>
                          <span className="font-mono text-slate-400">{change.fromValue}</span>
                          <ArrowRight className="w-3 h-3 text-slate-600" />
                          <span className="font-mono font-bold text-emerald-400">{change.toValue}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 italic">
                          {change.impactExplanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FIVE-FACTOR DECISION INTELLIGENCE COMPARISON */}
              {result.fiveFactorComparison && (
                <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                        <Scale className="w-4 h-4 text-indigo-400" />
                        <span>Five-Factor Decision Comparison</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Evaluates changes across HealthPilot's multi-objective decision scoring architecture
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      Standard Fixed Weights
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {result.fiveFactorComparison.map((factor, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/90 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">{factor.factor}</span>
                            <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                              {factor.weightPercent} Wt
                            </span>
                          </div>
                          <div className="flex items-center gap-3 font-mono">
                            <span className="text-slate-400">Current: {factor.currentScore}%</span>
                            <span className="text-white font-bold">What-If: {factor.whatIfScore}%</span>
                            <span className={`font-bold ${factor.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {factor.delta >= 0 ? `+${factor.delta}%` : `${factor.delta}%`}
                            </span>
                          </div>
                        </div>

                        {/* Dual score bar comparison */}
                        <div className="space-y-1">
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-500 rounded-full"
                              style={{ width: `${factor.currentScore}%` }}
                              title={`Current: ${factor.currentScore}%`}
                            />
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${factor.whatIfScore}%` }}
                              title={`What-If: ${factor.whatIfScore}%`}
                            />
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed pt-0.5">
                          {factor.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SHAP COMPARISON */}
              {result.shapComparison && (
                <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                        <span>SHAP-Based Model Explanation</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                            result.shapComparison.isGenuineShap
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {result.shapComparison.isGenuineShap ? 'Genuine SHAP (Active)' : 'System Fallback'}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Current top adherence contributors vs. What-If counterfactual drivers
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      Base Log-Odds: {result.shapComparison.baseValue}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CURRENT SHAP */}
                    <div className="p-3.5 rounded-lg bg-slate-900/50 border border-slate-800 space-y-2 text-xs">
                      <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Current Top Adherence Drivers
                      </span>
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-emerald-400 block">Positive Factors:</span>
                        {result.shapComparison.currentTopPositive.map((f, i) => (
                          <div key={i} className="flex justify-between text-[11px] text-slate-300">
                            <span>+ {f.displayName}</span>
                            <span className="font-mono text-emerald-400">+{f.shapValue.toFixed(3)}</span>
                          </div>
                        ))}
                        {result.shapComparison.currentTopNegative.length > 0 && (
                          <>
                            <span className="text-[11px] font-semibold text-rose-400 block pt-1">Negative Factors:</span>
                            {result.shapComparison.currentTopNegative.map((f, i) => (
                              <div key={i} className="flex justify-between text-[11px] text-slate-300">
                                <span>- {f.displayName}</span>
                                <span className="font-mono text-rose-400">{f.shapValue.toFixed(3)}</span>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>

                    {/* WHAT-IF SHAP */}
                    <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-2 text-xs">
                      <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                        What-If Top Adherence Drivers
                      </span>
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-emerald-400 block">Positive Factors:</span>
                        {result.shapComparison.whatIfTopPositive.map((f, i) => (
                          <div key={i} className="flex justify-between text-[11px] text-slate-300">
                            <span>+ {f.displayName}</span>
                            <span className="font-mono text-emerald-400">+{f.shapValue.toFixed(3)}</span>
                          </div>
                        ))}
                        {result.shapComparison.whatIfTopNegative.length > 0 && (
                          <>
                            <span className="text-[11px] font-semibold text-rose-400 block pt-1">Negative Factors:</span>
                            {result.shapComparison.whatIfTopNegative.map((f, i) => (
                              <div key={i} className="flex justify-between text-[11px] text-slate-300">
                                <span>- {f.displayName}</span>
                                <span className="font-mono text-rose-400">{f.shapValue.toFixed(3)}</span>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {result.shapComparison.disclaimer}
                  </p>
                </div>
              )}

              {/* RECOMMENDATION RANKING UNDER WHAT-IF */}
              {result.candidateRankings && result.candidateRankings.length > 0 && (
                <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Candidate Recommendation Ranking Under Scenario</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        How all potential candidates rank under the simulated constraints via the Decision Intelligence Engine
                      </p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Ranked by Composite Decision Score
                    </span>
                  </div>

                  <div className="space-y-2">
                    {result.candidateRankings.map((cand, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border transition-all text-xs ${
                          cand.isRecommended
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-200'
                            : 'bg-slate-900/40 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                                cand.isRecommended
                                  ? 'bg-emerald-500 text-slate-950'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {cand.rank}
                            </span>
                            <span className="font-bold text-white text-xs">{cand.title}</span>
                          </div>
                          <div className="flex items-center gap-3 font-mono">
                            <span className="text-slate-400">Adherence: {cand.predictedAdherence}%</span>
                            <span className="font-bold text-indigo-400">
                              Score: {Math.round(cand.finalDecisionScore * 100)} / 100
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">
                          {cand.rankingRationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GOAL CONFLICT & LONG-TERM PRESERVATION */}
              {result.goalConflictAnalysis && (
                <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-400" />
                      <span>Long-Term Goal Trade-off & Preservation</span>
                    </h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      result.goalConflictAnalysis.hasConflict
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {result.goalConflictAnalysis.hasConflict ? 'Active Trade-off' : 'Aligned Trajectory'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.goalConflictAnalysis.longTermTradeoffNotice}
                  </p>

                  {result.goalConflictAnalysis.hasConflict && (
                    <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-xs text-amber-300 space-y-1">
                      <span className="font-bold block">Trade-off Notice for "{result.goalConflictAnalysis.goalTitle}":</span>
                      <p className="leading-relaxed">{result.goalConflictAnalysis.explanation}</p>
                      <p className="font-semibold text-emerald-300 mt-1">
                        Resolution: {result.goalConflictAnalysis.resolution}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* EXPANDABLE TECHNICAL DETAILS / AUDIT SECTION */}
              <div className="bg-[#0F0F11] border border-slate-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-900/40 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Info className="w-4 h-4 text-slate-400" />
                    <span>Technical Details & Feature Snapshot (Audit Mode)</span>
                  </span>
                  {showTechnicalDetails ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {showTechnicalDetails && result.technicalDetails && (
                  <div className="p-4 border-t border-slate-800 bg-slate-900/30 text-xs font-mono space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Model:</span>
                        <span className="text-slate-200">{result.technicalDetails.modelName}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Version:</span>
                        <span className="text-slate-200">{result.technicalDetails.modelVersion}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Method:</span>
                        <span className="text-slate-200">{result.technicalDetails.explanationMethod}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Timestamp:</span>
                        <span className="text-slate-200">{result.technicalDetails.timestamp.split('T')[1].split('.')[0]}Z</span>
                      </div>
                    </div>

                    <div className="p-3 rounded bg-slate-950 border border-slate-800/80 text-[10px] text-slate-400 space-y-1 overflow-x-auto">
                      <span className="font-bold text-slate-300 block mb-1">Simulated Feature Vector:</span>
                      <pre>{JSON.stringify(result.technicalDetails.simulatedVector, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Bar: Ask AI Coach */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleAskCoachAboutScenario}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 font-semibold text-xs border border-emerald-500/30 transition-all shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Ask AI Coach to Synthesize This Scenario</span>
                </button>
                <span className="text-[11px] text-slate-500 font-mono">
                  Dual-Layer Decision Intelligence & SHAP
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
