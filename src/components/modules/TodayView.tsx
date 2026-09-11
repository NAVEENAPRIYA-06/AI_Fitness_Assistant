import React, { useState } from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import { AdherenceMeter } from '../common/AdherenceMeter.js';
import { MetricBadge } from '../common/MetricBadge.js';
import { ExplainabilityPanel } from '../common/ExplainabilityPanel.js';
import { Accordion } from '../common/Accordion.js';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  Home,
  CheckCircle2,
  Droplets,
  Moon,
  Zap,
  ShieldCheck,
  ChevronRight,
  Plus,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
  Info,
  Calendar,
  Compass
} from 'lucide-react';

export const TodayView: React.FC = () => {
  const {
    recommendation,
    context,
    evolvingState,
    behaviorSummary,
    currentUser,
    profile,
    setActiveModule,
    updateContext,
    submitOutcome
  } = useHealthPilot();

  const [logModalOpen, setLogModalOpen] = useState(false);
  const [alternativesOpen, setAlternativesOpen] = useState(false);
  const [showStateDetails, setShowStateDetails] = useState(false);
  const [showDetailedExplanation, setShowDetailedExplanation] = useState(false);

  const [outcomeStatus, setOutcomeStatus] = useState<'completed' | 'partially_completed' | 'skipped'>('completed');
  const [actualDuration, setActualDuration] = useState(recommendation?.durationMinutes || 20);
  const [skipReason, setSkipReason] = useState<any>('too_tired');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!recommendation || !context || !evolvingState) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[420px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Synthesizing personal health context and recommendations...</p>
        </div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = currentUser?.name || profile?.name || 'there';

  const handleQuickHydration = async () => {
    const current = context.hydrationLiters || 1.2;
    await updateContext({ hydrationLiters: Number((current + 0.25).toFixed(2)) });
  };

  const handleRecordOutcomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitOutcome({
        recommendationId: recommendation.id,
        recommendedActivity: recommendation.title,
        category: recommendation.category,
        plannedDurationMinutes: recommendation.durationMinutes,
        intensity: recommendation.intensity,
        contextSnapshot: {
          sleepHours: context.sleepHours,
          energyLevel: context.energyLevel,
          fatigueLevel: context.fatigueLevel,
          stressLevel: context.stressLevel,
          availableMinutes: context.availableMinutes,
          environment: context.environment
        },
        outcomeStatus,
        actualDurationMinutes: actualDuration,
        reasonForSkipOrPartial: outcomeStatus !== 'completed' ? skipReason : undefined,
        userFeedback: feedback || (outcomeStatus === 'completed' ? 'Executed session as planned.' : 'Session modified.'),
        perceivedEffort: outcomeStatus === 'completed' ? 5 : undefined
      });
      setLogModalOpen(false);
      setFeedback('');
    } catch (err) {
      console.error('Error submitting outcome:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const recoveryScore = context.recoveryScore ?? evolvingState.recoveryReadiness ?? 70;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* SECTION 1 — TODAY HEADER */}
      <header className="border-b border-slate-800/80 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-emerald-400 tracking-wide uppercase flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Personal Health Intelligence
              </span>
              <span className="text-slate-600 text-xs">•</span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Based on your current context, here is today's personalized recommendation.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => setActiveModule('context')}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              Update Context
            </button>
            <button
              onClick={() => setLogModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0A0A0B] text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Log Activity</span>
            </button>
          </div>
        </div>
      </header>

      {/* SECTION 2 — CURRENT STATE (Compact Group) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Current State
          </h2>
          <button
            onClick={() => setShowStateDetails(!showStateDetails)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
          >
            <span>{showStateDetails ? 'Hide details' : 'View all metrics'}</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showStateDetails ? 'rotate-90' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* 1. Recovery */}
          <div className="p-3.5 bg-[#121215] rounded-xl border border-slate-800/90 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Recovery</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-mono font-bold text-white">
              {recoveryScore}%
            </div>
            <div className="text-[11px] font-medium text-emerald-400">
              {recoveryScore >= 75 ? 'Optimal' : recoveryScore >= 60 ? 'Moderate' : 'Constrained'}
            </div>
          </div>

          {/* 2. Energy */}
          <div className="p-3.5 bg-[#121215] rounded-xl border border-slate-800/90 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Energy</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-mono font-bold text-white">
              {context.energyLevel} <span className="text-xs font-normal text-slate-500">/ 10</span>
            </div>
            <div className={`text-[11px] font-medium ${context.energyLevel >= 7 ? 'text-emerald-400' : context.energyLevel <= 4 ? 'text-rose-400' : 'text-amber-400'}`}>
              {context.energyLevel >= 7 ? 'High' : context.energyLevel <= 4 ? 'Low' : 'Moderate'}
            </div>
          </div>

          {/* 3. Fatigue */}
          <div className="p-3.5 bg-[#121215] rounded-xl border border-slate-800/90 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Fatigue</span>
              <span className="w-2 h-2 rounded-full bg-rose-400/80" />
            </div>
            <div className="text-xl font-mono font-bold text-white">
              {context.fatigueLevel} <span className="text-xs font-normal text-slate-500">/ 10</span>
            </div>
            <div className={`text-[11px] font-medium ${context.fatigueLevel >= 7 ? 'text-rose-400' : context.fatigueLevel <= 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {context.fatigueLevel >= 7 ? 'Elevated' : context.fatigueLevel <= 3 ? 'Low' : 'Manageable'}
            </div>
          </div>

          {/* 4. Sleep */}
          <div className="p-3.5 bg-[#121215] rounded-xl border border-slate-800/90 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Sleep</span>
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-xl font-mono font-bold text-white">
              {context.sleepHours.toFixed(1)} <span className="text-xs font-normal text-slate-500">h</span>
            </div>
            <div className={`text-[11px] font-medium ${context.sleepHours < 6.5 ? 'text-rose-400' : context.sleepHours >= 7.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {context.sleepHours < 6.5 ? 'Deficit' : context.sleepHours >= 7.5 ? 'Restorative' : 'Normal'}
            </div>
          </div>

          {/* 5. Available Time */}
          <div className="p-3.5 bg-[#121215] rounded-xl border border-slate-800/90 space-y-1 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Available</span>
              <Clock className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div className="text-xl font-mono font-bold text-white">
              {context.availableMinutes} <span className="text-xs font-normal text-slate-500">m</span>
            </div>
            <div className="text-[11px] font-medium text-slate-400 capitalize truncate">
              {context.environment || 'Home'}
            </div>
          </div>
        </div>

        {/* Expandable Extended State */}
        {showStateDetails && (
          <div className="p-4 bg-[#121215] rounded-xl border border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-fade-in">
            <div>
              <span className="text-slate-500 block mb-0.5">Stress Level</span>
              <span className="font-mono font-semibold text-slate-200">{context.stressLevel} / 10</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Soreness</span>
              <span className="font-mono font-semibold text-slate-200">{context.sorenessLevel} / 10</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Weekly Adherence</span>
              <span className="font-mono font-semibold text-emerald-400">{evolvingState.weeklyAdherenceRate}%</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Primary Goal</span>
              <span className="font-medium text-slate-300 truncate block">
                {profile?.primaryGoal || 'Cardiovascular Conditioning'}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 3 — TODAY'S RECOMMENDATION (Visual Dominance) */}
      <section className="bg-gradient-to-br from-[#121216] to-[#0D0D10] border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-md relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Recommended Today
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">
                Targeting <strong className="text-slate-200 font-medium">{recommendation.targetDomain}</strong>
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {recommendation.title}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              {recommendation.whyRecommended}
            </p>

            {/* Core Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <MetricBadge label={`${recommendation.durationMinutes} Minutes`} variant="slate" icon={<Clock className="w-3.5 h-3.5" />} />
              <MetricBadge label={recommendation.intensity.toUpperCase() + ' INTENSITY'} variant={recommendation.intensity === 'low' ? 'emerald' : 'amber'} />
              <MetricBadge label={recommendation.environment.toUpperCase()} variant="teal" icon={<Home className="w-3.5 h-3.5" />} />
              <MetricBadge label={`Goal Alignment: ${recommendation.goalAlignmentScore || 85}%`} variant="indigo" />
            </div>
          </div>

          {/* Adherence & Suitability Pill */}
          <div className="shrink-0 bg-slate-900/80 border border-slate-800 rounded-xl p-4 min-w-[200px] flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Predicted Adherence</span>
                <span className="text-2xl font-mono font-bold text-emerald-400">{recommendation.predictedAdherence}%</span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">Suitability</span>
                <span className="text-2xl font-mono font-bold text-teal-300">{recommendation.healthSuitabilityScore}%</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 text-center border-t border-slate-800/80 pt-2 font-mono">
              Calibrated to acute recovery
            </div>
          </div>
        </div>

        {/* Goal-Condition Conflict Alert (if detected) */}
        {recommendation.goalConflict.hasConflict && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="font-bold text-amber-300 flex items-center gap-2">
                <span>Goal-Condition Conflict Managed</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30 font-mono">
                  Adaptive Resolution
                </span>
              </div>
              <p className="text-amber-200/90 leading-relaxed">
                <strong>{recommendation.goalConflict.goalName}</strong>: {recommendation.goalConflict.conflictExplanation}
              </p>
              <p className="text-slate-300 pt-0.5">
                <strong className="text-white">HealthPilot Adjustment:</strong> {recommendation.goalConflict.recommendedResolution}
              </p>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setLogModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0A0A0B] text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Start / Log Activity</span>
            </button>
            <button
              onClick={() => setAlternativesOpen(!alternativesOpen)}
              className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              {alternativesOpen ? 'Hide Alternatives' : 'View Alternatives'}
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveModule('what_if')}
              className="text-slate-400 hover:text-emerald-400 font-medium flex items-center gap-1 transition-colors"
            >
              <span>Test What-If</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Collapsible Alternatives List */}
        {alternativesOpen && (
          <div className="pt-4 border-t border-slate-800/80 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Alternative Options Considered
              </h4>
              <button
                onClick={() => setActiveModule('plan_lab')}
                className="text-xs text-emerald-400 hover:underline font-medium"
              >
                Compare in Plan Lab →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {recommendation.alternatives.map(alt => (
                <div key={alt.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-bold text-white">{alt.title}</h5>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                      {alt.durationMinutes}m
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {alt.rationale}
                  </p>
                  <div className="pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Adherence: {alt.predictedAdherence}%</span>
                    <span>Suitability: {alt.healthSuitabilityScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* SECTION 4 — WHY THIS RECOMMENDATION? */}
      <section className="bg-[#121215] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Why This Recommendation?
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-factor rationale balancing immediate readiness and long-term targets
            </p>
          </div>
          <button
            onClick={() => setShowDetailedExplanation(!showDetailedExplanation)}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            <span>{showDetailedExplanation ? 'Hide detailed explanation' : 'View detailed explanation'}</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showDetailedExplanation ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {/* 5-Factor Concise Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-medium text-slate-400 block uppercase">Suitability</span>
            <div className="text-base font-mono font-bold text-teal-300">
              {recommendation.suitabilityScore ?? recommendation.healthSuitabilityScore}%
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">Physical tolerance</p>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-medium text-slate-400 block uppercase">Adherence</span>
            <div className="text-base font-mono font-bold text-emerald-400">
              {recommendation.predictedAdherence}%
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">ML completion prob</p>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-medium text-slate-400 block uppercase">Goal Alignment</span>
            <div className="text-base font-mono font-bold text-cyan-400">
              {recommendation.goalAlignmentScore || 85}%
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">Target support</p>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-medium text-slate-400 block uppercase">Feasibility</span>
            <div className="text-base font-mono font-bold text-indigo-400">
              {recommendation.contextFeasibilityScore || 95}%
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">Time & gear match</p>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-medium text-slate-400 block uppercase">Behavioral Fit</span>
            <div className="text-base font-mono font-bold text-purple-400">
              {recommendation.behavioralFitScore || 77}%
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">Habit pattern fit</p>
          </div>
        </div>

        {/* Expandable Detailed Explanation (Existing SHAP & Factors) */}
        {showDetailedExplanation && (
          <div className="pt-4 border-t border-slate-800 space-y-4 animate-fade-in">
            <ExplainabilityPanel
              shapData={recommendation.shapExplanation}
              factors={recommendation.explainabilityFactors}
              decisionFactors={recommendation.decisionFactors}
              predictedAdherence={recommendation.predictedAdherence}
              healthSuitability={recommendation.healthSuitabilityScore ?? recommendation.suitabilityScore}
              title="Transparent Model Attribution"
              subtitle="Dual-layer explainability: ML Adherence Prediction (SHAP) and Multi-Factor Decision Intelligence Engine"
            />
          </div>
        )}
      </section>

      {/* SECTION 5 — BEHAVIOR INSIGHT */}
      <section className="bg-[#121215] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Personal Behavioral Insight
            </h2>
          </div>
          <button
            onClick={() => setActiveModule('insights')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            <span>View all behavior insights</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/70 text-xs text-slate-300 leading-relaxed space-y-1.5">
          <p className="font-medium text-slate-200">
            {behaviorSummary?.keyObservation || 'Your session completion rate is consistently higher for workouts under 30 minutes in duration.'}
          </p>
          <p className="text-slate-400 text-[11px]">
            Synthesized from your personal outcome logs and context trends. HealthPilot factors this pattern into daily duration scheduling.
          </p>
        </div>
      </section>

      {/* SECTION 6 — DAILY TRACKING */}
      <section className="bg-[#121215] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Daily Habits & Tracking
          </h2>
          <span className="text-xs text-slate-400">
            Today's Logged State
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hydration Tracking */}
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span>Hydration</span>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {context.hydrationLiters}L / 2.5L
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (context.hydrationLiters / 2.5) * 100)}%` }}
              />
            </div>
            <button
              onClick={handleQuickHydration}
              className="w-full py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log +250ml Water</span>
            </button>
          </div>

          {/* Action Notes & Nutrition */}
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/80 space-y-2.5 text-xs">
            <div className="flex items-center justify-between font-semibold text-slate-200">
              <span>Nutrition & Recovery Plan</span>
              <span className="text-[10px] text-slate-400 font-mono">{recommendation.nutritionAction.timing}</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {recommendation.nutritionAction.description}
            </p>
            <div className="pt-2 border-t border-slate-800 text-slate-400 text-[11px]">
              <strong className="text-slate-300">Recovery:</strong> {recommendation.recoveryAction.description}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — ADVANCED DETAILS (Collapsible Progressive Disclosure) */}
      <section className="pt-2">
        <Accordion
          title="Advanced Decision Details"
          subtitle="Model metadata, decision weight breakdown, and machine learning pipeline audit"
          icon={<Cpu className="w-4 h-4 text-cyan-400" />}
          badge={<span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Audit</span>}
          variant="card"
        >
          <div className="space-y-5 pt-2">
            {/* Machine Learning Pipeline Audit & Provenance */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
                  Machine Learning Pipeline Audit
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                  recommendation.isModelPlaceholder
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {recommendation.isModelPlaceholder ? 'Heuristic Fallback' : 'Active Model'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Model Architecture</span>
                  <div className="text-white font-bold">{recommendation.modelName || 'Logistic Regression (balanced)'}</div>
                  <div className="text-[10px] text-slate-400 font-mono">v{recommendation.modelVersion || '1.0.0-production'}</div>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Training Source</span>
                  <div className="text-white font-medium truncate">{recommendation.dataSourceLabel || 'Personal historical log'}</div>
                  <div className="text-[10px] text-emerald-400 font-mono">Zero Target Leakage Enforced</div>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Limitation Notice</span>
                  <div className="text-slate-300 text-[11px] leading-relaxed">
                    {recommendation.limitationNotice || 'Continuous cross-validation against daily logged outcomes.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Score Breakdown Table */}
            {recommendation.scoreBreakdown && (
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <span className="font-semibold text-slate-200 text-xs block">
                  Weighted Score Composition (Final Utility: {recommendation.finalDecisionScore}/100)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800 text-slate-300">
                    <span className="text-slate-500 block text-[10px]">Suitability (30%)</span>
                    +{recommendation.scoreBreakdown.suitabilityContribution} pts
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800 text-slate-300">
                    <span className="text-slate-500 block text-[10px]">Adherence (25%)</span>
                    +{recommendation.scoreBreakdown.predictedAdherenceContribution} pts
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800 text-slate-300">
                    <span className="text-slate-500 block text-[10px]">Alignment (20%)</span>
                    +{recommendation.scoreBreakdown.goalAlignmentContribution} pts
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800 text-slate-300">
                    <span className="text-slate-500 block text-[10px]">Feasibility (15%)</span>
                    +{recommendation.scoreBreakdown.contextFeasibilityContribution} pts
                  </div>
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800 text-slate-300">
                    <span className="text-slate-500 block text-[10px]">Behavioral Fit (10%)</span>
                    +{recommendation.scoreBreakdown.behavioralFitContribution} pts
                  </div>
                </div>
              </div>
            )}
          </div>
        </Accordion>
      </section>

      {/* Record Outcome Modal */}
      {logModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#121215] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 space-y-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Record Recommendation Outcome</h3>
                <p className="text-xs text-slate-400">Feeds into the continuous behavioral learning loop</p>
              </div>
              <button
                onClick={() => setLogModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordOutcomeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">Did you execute today's recommendation?</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOutcomeStatus('completed')}
                    className={`py-2 px-3 rounded-lg border font-semibold text-center transition-all ${
                      outcomeStatus === 'completed'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-2xs'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    Completed
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutcomeStatus('partially_completed')}
                    className={`py-2 px-3 rounded-lg border font-semibold text-center transition-all ${
                      outcomeStatus === 'partially_completed'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-2xs'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    Partial
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutcomeStatus('skipped')}
                    className={`py-2 px-3 rounded-lg border font-semibold text-center transition-all ${
                      outcomeStatus === 'skipped'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-2xs'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    Skipped
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Actual Duration (Minutes)</label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={actualDuration}
                  onChange={e => setActualDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {outcomeStatus !== 'completed' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Primary Barrier or Reason</label>
                  <select
                    value={skipReason}
                    onChange={e => setSkipReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="too_tired">Excessive Fatigue / Low Energy</option>
                    <option value="time_constraint">Unscheduled Time Constraint</option>
                    <option value="soreness_pain">Muscle Soreness or Joint Discomfort</option>
                    <option value="work_conflict">Work / Family Conflict</option>
                    <option value="low_motivation">Low Motivation / Stress</option>
                    <option value="other">Other / Traveling</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Session Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="How did your session feel? Any pain or adjustments?"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setLogModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0A0A0B] font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Confirm Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
