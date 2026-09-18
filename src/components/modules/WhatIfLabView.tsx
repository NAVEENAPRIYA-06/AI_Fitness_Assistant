import React, { useState, useEffect } from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import { WhatIfScenarioResult } from '../../types/index.js';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Zap,
  Home,
  Dumbbell,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  Moon,
  ChevronDown,
  Battery,
  Sliders
} from 'lucide-react';

export const WhatIfLabView: React.FC = () => {
  const { context, runWhatIfScenario, setActiveModule, updateContext } = useHealthPilot();

  // Scenario variables
  const [availableMinutes, setAvailableMinutes] = useState(context?.availableMinutes || 35);
  const [energyLevel, setEnergyLevel] = useState(context?.energyLevel || 6);
  const [fatigueLevel, setFatigueLevel] = useState(context?.fatigueLevel || 4);
  const [sleepHours, setSleepHours] = useState(context?.sleepHours || 7.0);
  const [environment, setEnvironment] = useState<'home' | 'gym' | 'outdoor'>('home');
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<WhatIfScenarioResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [applyFeedback, setApplyFeedback] = useState<string | null>(null);

  const runSimulation = async () => {
    setIsSimulating(true);
    const sim = await runWhatIfScenario({
      availableMinutes,
      energyLevel,
      fatigueLevel,
      stressLevel: 4,
      sorenessLevel: 3,
      sleepHours,
      sleepQuality: 7,
      environment,
      equipmentAvailable: environment === 'gym' ? ['Barbell & Rack', 'Dumbbells'] : ['Dumbbells', 'Mat'],
      candidateDurationMinutes: Math.min(availableMinutes, 30),
      candidateIntensity: fatigueLevel >= 7 ? 'low' : 'moderate',
      activityType: 'Functional Strength',
      sensitivityVariable: 'availableMinutes'
    });
    if (sim) {
      setResult(sim);
    }
    setIsSimulating(false);
  };

  useEffect(() => {
    runSimulation();
  }, [availableMinutes, energyLevel, fatigueLevel, sleepHours, environment]);

  const applyPreset = (preset: 'short_time' | 'low_energy' | 'gym_access' | 'high_energy') => {
    if (preset === 'short_time') {
      setAvailableMinutes(15);
    } else if (preset === 'low_energy') {
      setEnergyLevel(3);
      setFatigueLevel(8);
      setSleepHours(5.5);
    } else if (preset === 'gym_access') {
      setEnvironment('gym');
      setAvailableMinutes(45);
    } else if (preset === 'high_energy') {
      setEnergyLevel(9);
      setFatigueLevel(2);
      setSleepHours(8.5);
    }
  };

  const handleApplyToToday = async () => {
    setApplyFeedback(null);
    try {
      await updateContext({
        availableMinutes,
        energyLevel,
        fatigueLevel,
        sleepHours,
        environment
      });
      setApplyFeedback('Applied to your real daily context! Recalibrating Today...');
      setTimeout(() => {
        setActiveModule('today');
      }, 1000);
    } catch (err) {
      console.error(err);
      setApplyFeedback('Failed to update context.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Simulation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            What if your day changes?
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-normal max-w-2xl">
            See how adjustments to your sleep, available time, or workout setting dynamically modify HealthPilot's recommendations.
          </p>
        </div>

        <button
          onClick={runSimulation}
          disabled={isSimulating}
          className="px-4 py-2 rounded-2xl bg-[var(--surface-soft)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin text-[var(--primary)]' : ''}`} />
          <span>{isSimulating ? 'Simulating...' : 'Re-run Simulation'}</span>
        </button>
      </div>

      {/* QUICK PRESET CHIPS */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Quick Scenarios
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => applyPreset('short_time')}
            className="px-3.5 py-2 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Clock className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>What if I only have 15 minutes?</span>
          </button>

          <button
            onClick={() => applyPreset('low_energy')}
            className="px-3.5 py-2 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Moon className="w-3.5 h-3.5 text-[var(--warning)]" />
            <span>What if I slept poorly & feel tired?</span>
          </button>

          <button
            onClick={() => applyPreset('gym_access')}
            className="px-3.5 py-2 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Dumbbell className="w-3.5 h-3.5 text-[var(--secondary)]" />
            <span>What if I have access to a gym?</span>
          </button>

          <button
            onClick={() => applyPreset('high_energy')}
            className="px-3.5 py-2 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-soft)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>What if I have high energy?</span>
          </button>
        </div>
      </div>

      {/* INTERACTIVE CONTROLS */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 space-y-6 shadow-xs">
        <h3 className="text-base font-bold text-[var(--text-primary)]">
          Adjust Simulated Context
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Available Minutes */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[var(--text-primary)]">Available Time</span>
              <span className="font-bold text-sm text-[var(--primary)]">{availableMinutes} min</span>
            </div>
            <input
              type="range"
              min={10}
              max={75}
              step={5}
              value={availableMinutes}
              onChange={(e) => setAvailableMinutes(Number(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
          </div>

          {/* Sleep Hours */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[var(--text-primary)]">Sleep Duration</span>
              <span className="font-bold text-sm text-[var(--secondary)]">{sleepHours} hrs</span>
            </div>
            <input
              type="range"
              min={4}
              max={10}
              step={0.5}
              value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value))}
              className="w-full accent-[var(--secondary)]"
            />
          </div>

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
              step={1}
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-full accent-[var(--warning)]"
            />
          </div>

          {/* Environment */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-primary)] block">
              Location Setting
            </label>
            <div className="grid grid-cols-3 gap-1">
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
      </div>

      {/* SIDE-BY-SIDE PLAN COMPARISON */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Plan */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Current Baseline Plan
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--surface-soft)] text-[var(--text-secondary)]">
              Baseline
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-xl font-bold text-[var(--text-primary)]">
              {result?.currentRecommendation?.title || '30-Min Functional Conditioning'}
            </h4>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>{result?.currentRecommendation?.durationMinutes || 30} minutes</span>
              <span>•</span>
              <span className="capitalize">{result?.currentRecommendation?.intensity || 'moderate'} intensity</span>
              <span>•</span>
              <span className="capitalize">{context?.environment || 'Home'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--surface-soft)] space-y-1.5 text-xs text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)] block">Completion Likelihood:</span>
            <span className="text-lg font-bold text-[var(--primary)]">
              {result?.baselineAdherence || (result as any)?.currentAdherenceProbability || 78}%
            </span>
            <p className="text-[11px] text-[var(--text-muted)]">
              Based on your actual logged sleep ({context?.sleepHours || 7}h) and schedule ({context?.availableMinutes || 35}m).
            </p>
          </div>
        </div>

        {/* Simulated Plan */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[var(--surface)] border-2 border-[var(--primary)] space-y-4 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Simulated Outcome
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
              Simulation
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-xl font-bold text-[var(--text-primary)]">
              {result?.whatIfRecommendation?.title || (result as any)?.simulatedRecommendation?.title || '20-Min Mobility & Gentle Core'}
            </h4>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>{result?.whatIfRecommendation?.durationMinutes || (result as any)?.simulatedRecommendation?.durationMinutes || availableMinutes} minutes</span>
              <span>•</span>
              <span className="capitalize">{result?.whatIfRecommendation?.intensity || (result as any)?.simulatedRecommendation?.intensity || (fatigueLevel >= 7 ? 'low' : 'moderate')} intensity</span>
              <span>•</span>
              <span className="capitalize">{environment}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--primary-soft)]/50 space-y-1.5 text-xs text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)] block">Simulated Completion Likelihood:</span>
            <span className="text-lg font-bold text-[var(--primary)]">
              {result?.simulatedAdherence || (result as any)?.simulatedAdherenceProbability || 88}%
            </span>
            <p className="text-[11px] text-[var(--text-secondary)]">
              {result?.counterfactualExplanation || result?.verdict || (result as any)?.primaryDriverExplanation ||
                'Adjusting to your simulated time and recovery matches your physical tolerance.'}
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleApplyToToday}
              className="w-full py-3 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <span>Apply This Context to Today</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {applyFeedback && (
              <p className="text-xs font-medium text-[var(--primary)] text-center mt-2 animate-in fade-in">
                {applyFeedback}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
