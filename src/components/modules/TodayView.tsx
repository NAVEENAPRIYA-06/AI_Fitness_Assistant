import React, { useState } from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import { AdherenceMeter } from '../common/AdherenceMeter.js';
import { MetricBadge } from '../common/MetricBadge.js';
import { ExplainabilityPanel } from '../common/ExplainabilityPanel.js';
import { ShapAttributionBar } from '../common/ShapAttributionBar.js';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  Home,
  CheckCircle2,
  Droplets,
  Moon,
  Zap,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Plus,
  Cpu,
  Brain,
  Layers
} from 'lucide-react';

export const TodayView: React.FC = () => {
  const {
    recommendation,
    context,
    evolvingState,
    behaviorSummary,
    setActiveModule,
    updateContext,
    submitOutcome
  } = useHealthPilot();

  const [logModalOpen, setLogModalOpen] = useState(false);
  const [outcomeStatus, setOutcomeStatus] = useState<'completed' | 'partially_completed' | 'skipped'>('completed');
  const [actualDuration, setActualDuration] = useState(recommendation?.durationMinutes || 20);
  const [skipReason, setSkipReason] = useState<any>('too_tired');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!recommendation || !context || !evolvingState) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400 font-medium">Synthesizing multi-domain user state and daily context...</p>
        </div>
      </div>
    );
  }

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
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Decision Intelligence Summary */}
      <div className="bg-gradient-to-br from-slate-900 to-[#0F0F11] border border-slate-800 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Adaptive Decision Engine Output
              </span>
              <span className="text-[11px] text-slate-500">•</span>
              <span className="text-xs text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {recommendation.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed italic">
              Targeting <strong className="text-emerald-400 font-medium not-italic">{recommendation.targetDomain}</strong>. Tailored to buffer acute sleep debt while safeguarding long-term habit continuity.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <MetricBadge label={`${recommendation.durationMinutes} Minutes`} variant="slate" icon={<Clock className="w-3 h-3" />} />
              <MetricBadge label={recommendation.intensity.toUpperCase() + ' INTENSITY'} variant={recommendation.intensity === 'low' ? 'emerald' : 'amber'} />
              <MetricBadge label={recommendation.environment.toUpperCase()} variant="teal" icon={<Home className="w-3 h-3" />} />
              <MetricBadge label={recommendation.category.replace('_', ' ').toUpperCase()} variant="indigo" />
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3">
            <div className="bg-slate-800/40 backdrop-blur-md rounded-xl p-3.5 border border-white/5 flex flex-col gap-2.5 min-w-[220px]">
              <div className="flex items-center justify-between gap-4">
                <div className="text-left">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Predicted Adherence</span>
                  <span className="text-xl font-mono font-bold text-emerald-400">{recommendation.predictedAdherence}%</span>
                </div>
                <div className="h-8 w-px bg-slate-700" />
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Health Suitability</span>
                  <span className="text-xl font-mono font-bold text-teal-300">{recommendation.healthSuitabilityScore}%</span>
                </div>
              </div>

              {/* Machine Learning Model Provenance Tag */}
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between gap-2 text-[10px] font-mono">
                <span className="flex items-center gap-1.5 text-slate-300 truncate" title={recommendation.modelName}>
                  <Cpu className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{recommendation.modelName || 'Logistic Regression'}</span>
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold shrink-0 ${
                  recommendation.isModelPlaceholder
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {recommendation.isModelPlaceholder
                    ? 'Heuristic Fallback'
                    : recommendation.dataSourceLabel?.includes('seed')
                      ? 'ML Seed Model'
                      : 'Trained ML Model'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setLogModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#0A0A0B] bg-emerald-500 hover:bg-emerald-400 transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Log Action Outcome</span>
            </button>
          </div>
        </div>
      </div>

      {/* Goal-Condition Conflict Alert (if detected) */}
      {recommendation.goalConflict.hasConflict && (
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 flex items-start gap-3.5">
          <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-amber-300">Goal-Condition Conflict Detected</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                High Priority Conflict
              </span>
            </div>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              <strong>{recommendation.goalConflict.goalName}</strong>: {recommendation.goalConflict.conflictExplanation}
            </p>
            <p className="text-xs text-slate-300 pt-1">
              <strong className="text-white">Resolution Applied:</strong> {recommendation.goalConflict.recommendedResolution}
            </p>
          </div>
        </div>
      )}

      {/* Transparent Multi-Factor Decision Score Breakdown */}
      <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">Multi-Factor Decision Score</h3>
                <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
                  {recommendation.finalDecisionScore ? `${recommendation.finalDecisionScore} / 100` : `${recommendation.healthSuitabilityScore} / 100`}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Composite utility synthesizing physical readiness, machine learning completion probability, active goals, and behavioral fit
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModule('plan_lab')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Inspect in Plan Lab</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 Scoring Factors Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
          {/* 1. Health Suitability */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
              <span>Suitability</span>
              <span className="font-mono text-slate-500">30% wt</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-mono font-bold text-teal-300">
                {recommendation.suitabilityScore ?? recommendation.healthSuitabilityScore}%
              </span>
              {recommendation.scoreBreakdown && (
                <span className="text-[10px] font-mono text-slate-500">
                  (+{recommendation.scoreBreakdown.suitabilityContribution} pts)
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Physiological match with autonomic recovery & fatigue
            </p>
          </div>

          {/* 2. Predicted Adherence */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
              <span>Adherence</span>
              <span className="font-mono text-slate-500">25% wt</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-mono font-bold text-emerald-400">
                {recommendation.predictedAdherence}%
              </span>
              {recommendation.scoreBreakdown && (
                <span className="text-[10px] font-mono text-slate-500">
                  (+{recommendation.scoreBreakdown.predictedAdherenceContribution} pts)
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Statistical likelihood of session completion
            </p>
          </div>

          {/* 3. Goal Alignment */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
              <span>Goal Alignment</span>
              <span className="font-mono text-slate-500">20% wt</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-mono font-bold text-cyan-400">
                {recommendation.goalAlignmentScore || 85}%
              </span>
              {recommendation.scoreBreakdown && (
                <span className="text-[10px] font-mono text-slate-500">
                  (+{recommendation.scoreBreakdown.goalAlignmentContribution} pts)
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Direct alignment with 10K running and sleep targets
            </p>
          </div>

          {/* 4. Context Feasibility */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
              <span>Feasibility</span>
              <span className="font-mono text-slate-500">15% wt</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-mono font-bold text-indigo-400">
                {recommendation.contextFeasibilityScore || 95}%
              </span>
              {recommendation.scoreBreakdown && (
                <span className="text-[10px] font-mono text-slate-500">
                  (+{recommendation.scoreBreakdown.contextFeasibilityContribution} pts)
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Time buffer, home equipment, and environment fit
            </p>
          </div>

          {/* 5. Behavioral Fit */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1.5 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
              <span>Behavioral Fit</span>
              <span className="font-mono text-slate-500">10% wt</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-mono font-bold text-purple-400">
                {recommendation.behavioralFitScore || 77}%
              </span>
              {recommendation.scoreBreakdown && (
                <span className="text-[10px] font-mono text-slate-500">
                  (+{recommendation.scoreBreakdown.behavioralFitContribution} pts)
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Duration and environment consistency patterns
            </p>
          </div>
        </div>

        {/* Adherence vs. Suitability Distinction & Transparency Notice */}
        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-slate-200">Adherence vs. Suitability Distinction:</strong> Health Suitability ({recommendation.suitabilityScore ?? recommendation.healthSuitabilityScore}%) reflects physical tolerance based on acute recovery, sleep, and fatigue. Predicted Adherence ({recommendation.predictedAdherence}%) reflects statistical likelihood of completion based on behavioral history.
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 shrink-0">
            * ML probability estimate — not a clinical guarantee
          </span>
        </div>

        {/* Key Decision Factors List */}
        {recommendation.explanation?.keyFactors && (
          <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Transparent Decision Rationale Factors
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {recommendation.explanation.keyFactors.map((factor, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span className="text-[11px] leading-relaxed">{factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3-Column Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Today's Context */}
        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Today's Context</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Last updated:{' '}
                <span className="text-slate-300 font-medium">
                  {context.updatedAt
                    ? new Date(context.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Today, morning check-in'}
                </span>
              </p>
            </div>
            <button
              onClick={() => setActiveModule('context')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Edit</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            {/* Sleep */}
            <div className="p-2.5 bg-slate-800/40 rounded-lg border border-white/5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-medium">Sleep</span>
              </div>
              <span className="font-mono font-bold text-white text-sm">
                {context.sleepHours.toFixed(1)} h
              </span>
              <span className={`text-[10px] block mt-0.5 font-medium ${context.sleepHours < 6.5 ? 'text-rose-400' : context.sleepHours >= 7.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {context.sleepHours < 6.5 ? 'Sleep deficit' : context.sleepHours >= 7.5 ? 'Optimal duration' : 'Moderate sleep'}
              </span>
            </div>

            {/* Energy */}
            <div className="p-2.5 bg-slate-800/40 rounded-lg border border-white/5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-medium">Energy</span>
              </div>
              <span className="font-mono font-bold text-white text-sm">
                {context.energyLevel} / 10
              </span>
              <span className={`text-[10px] block mt-0.5 font-medium ${context.energyLevel >= 7 ? 'text-emerald-400' : context.energyLevel <= 4 ? 'text-rose-400' : 'text-amber-400'}`}>
                {context.energyLevel >= 7 ? 'High energy' : context.energyLevel <= 4 ? 'Low energy' : 'Moderate energy'}
              </span>
            </div>

            {/* Fatigue */}
            <div className="p-2.5 bg-slate-800/40 rounded-lg border border-white/5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span className="font-medium">Fatigue</span>
              </div>
              <span className="font-mono font-bold text-white text-sm">
                {context.fatigueLevel} / 10
              </span>
              <span className={`text-[10px] block mt-0.5 font-medium ${context.fatigueLevel >= 7 ? 'text-rose-400' : context.fatigueLevel <= 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {context.fatigueLevel >= 7 ? 'High fatigue' : context.fatigueLevel <= 3 ? 'Low fatigue' : 'Manageable strain'}
              </span>
            </div>

            {/* Stress */}
            <div className="p-2.5 bg-slate-800/40 rounded-lg border border-white/5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span className="font-medium">Stress</span>
              </div>
              <span className="font-mono font-bold text-white text-sm">
                {context.stressLevel} / 10
              </span>
              <span className={`text-[10px] block mt-0.5 font-medium ${context.stressLevel >= 7 ? 'text-rose-400' : context.stressLevel <= 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {context.stressLevel >= 7 ? 'Elevated stress' : context.stressLevel <= 3 ? 'Low stress' : 'Moderate stress'}
              </span>
            </div>

            {/* Available Time */}
            <div className="p-2.5 bg-slate-800/40 rounded-lg border border-white/5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                <span className="font-medium">Available Time</span>
              </div>
              <span className="font-mono font-bold text-white text-sm">
                {context.availableMinutes} min
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 capitalize font-medium">
                {context.preferredTime || 'Morning'} preferred
              </span>
            </div>

            {/* Environment */}
            <div className="p-2.5 bg-slate-800/40 rounded-lg border border-white/5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                <Home className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium">Environment</span>
              </div>
              <span className="font-bold text-white text-sm capitalize">
                {context.environment}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5 font-medium truncate">
                {(context.equipmentAvailable || []).length} equipment items
              </span>
            </div>
          </div>

          {/* Hydration Mini Widget */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span>Hydration Tracking</span>
              </div>
              <span className="font-mono font-bold text-cyan-400">{context.hydrationLiters}L / 2.5L</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (context.hydrationLiters / 2.5) * 100)}%` }}
              />
            </div>
            <button
              onClick={handleQuickHydration}
              className="w-full py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log +250ml Water</span>
            </button>
          </div>
        </div>

        {/* Card 2: Evolving State & Behavioral Precedent */}
        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight">Evolving Multi-Domain State</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-medium">
              System Estimate
            </span>
          </div>

          <div className="space-y-3">
            <AdherenceMeter
              score={evolvingState.recoveryReadiness}
              label={`Recovery Status: ${(evolvingState.recoveryLevel || 'Moderate').toUpperCase()}`}
              subtitle="Autonomic estimate synthesizing sleep, energy, fatigue, and soreness"
            />

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Energy State:</span>
                <span className="font-bold text-slate-200 capitalize">{evolvingState.energyState || 'Moderate'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Behavioral Momentum:</span>
                <span className="font-mono font-bold text-slate-200">{evolvingState.behavioralMomentum} / 100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">7-Day Completion Rate:</span>
                <span className="font-mono font-bold text-emerald-400">{evolvingState.weeklyAdherenceRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Dominant Failure Barrier:</span>
                <span className="font-medium text-rose-400">{evolvingState.dominantBarrier}</span>
              </div>
            </div>

            {/* Behavioral Pattern Callout */}
            {behaviorSummary && (
              <div className="p-3 bg-slate-800/40 rounded-lg border border-white/5 text-xs space-y-1">
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Empirical Insight</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  {behaviorSummary.keyObservation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Why It Was Recommended & Actions */}
        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white tracking-tight">Decision Rationale</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {recommendation.whyRecommended}
            </p>

            <div className="p-3 bg-slate-800/40 rounded-lg border border-white/5 space-y-1.5 text-xs">
              <div className="font-bold text-slate-200 flex items-center justify-between">
                <span>Nutrition Action</span>
                <span className="text-[10px] text-slate-400 font-normal">{recommendation.nutritionAction.timing}</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {recommendation.nutritionAction.description}
              </p>
            </div>

            <div className="p-3 bg-slate-800/40 rounded-lg border border-white/5 space-y-1 text-xs">
              <div className="font-bold text-slate-200">Recovery Action</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {recommendation.recoveryAction.description}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={() => setActiveModule('what_if')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>Test in What-If Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveModule('coach')}
              className="text-slate-400 hover:text-white font-medium"
            >
              Ask AI Coach
            </button>
          </div>
        </div>
      </div>

      {/* Real Explainable AI: Dual-Layer ML Adherence (SHAP) & Recommendation Decision (5 Factors) */}
      <ExplainabilityPanel
        shapData={recommendation.shapExplanation}
        factors={recommendation.explainabilityFactors}
        decisionFactors={recommendation.decisionFactors}
        predictedAdherence={recommendation.predictedAdherence}
        healthSuitability={recommendation.healthSuitabilityScore ?? recommendation.suitabilityScore}
        title="Transparent AI Decision & Predictive Explainability"
        subtitle="Dual-layer explainability: ML Adherence Prediction (SHAP) and Multi-Factor Decision Intelligence Engine"
      />

      {/* Machine Learning Pipeline Audit & Provenance */}
      <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">Adherence ML Pipeline Audit</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                  recommendation.isModelPlaceholder
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {recommendation.isModelPlaceholder
                    ? 'Fallback Heuristic'
                    : recommendation.dataSourceLabel?.includes('seed')
                      ? 'Demonstration Seed ML'
                      : 'Real Trained ML'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Statistically evaluated binary classification model trained with scikit-learn
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModule('behavior')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View Benchmark & Comparison</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">Active Model</span>
            <div className="text-white font-bold">{recommendation.modelName || 'Logistic Regression (balanced)'}</div>
            <div className="text-[10px] text-slate-400">Version: {recommendation.modelVersion || '1.0.0-prototype'}</div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">Training Source</span>
            <div className="text-white font-medium truncate">{recommendation.dataSourceLabel || 'Demonstration seed data'}</div>
            <div className="text-[10px] text-emerald-400/90 font-mono">Zero Target Leakage (Pre-Intervention)</div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block font-semibold">Confidence & Notice</span>
            <div className="text-slate-300 text-[11px] leading-relaxed">
              {recommendation.limitationNotice || 'Subject to continuous cross-validation against outcome records.'}
            </div>
          </div>
        </div>
      </div>

      {/* Alternative Candidate Options */}
      <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Alternative Candidate Options Considered</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              The Decision Engine ranked these alternatives lower based on predicted adherence and physiological suitability
            </p>
          </div>
          <button
            onClick={() => setActiveModule('plan_lab')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>Compare in Plan Lab</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {recommendation.alternatives.map((alt) => (
            <div
              key={alt.id}
              className="p-4 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition-colors bg-slate-800/30 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-white">{alt.title}</h4>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold shrink-0">
                  {alt.durationMinutes}m
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {alt.rationale}
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">
                  Adherence: <strong className="font-mono text-slate-200">{alt.predictedAdherence}%</strong>
                </span>
                <span className="text-slate-400">
                  Suitability: <strong className="font-mono text-slate-200">{alt.healthSuitabilityScore}%</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Record Outcome Modal */}
      {logModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#0F0F11] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 space-y-4 text-slate-200">
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

              {outcomeStatus !== 'skipped' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Actual Duration Completed: <span className="font-mono text-emerald-400">{actualDuration} mins</span>
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    step="5"
                    value={actualDuration}
                    onChange={(e) => setActualDuration(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              )}

              {outcomeStatus !== 'completed' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Primary Barrier / Reason</label>
                  <select
                    value={skipReason}
                    onChange={(e) => setSkipReason(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-slate-700 text-slate-200 bg-slate-900"
                  >
                    <option value="too_tired">Too Tired / Excessive Fatigue</option>
                    <option value="no_time">No Time / Compressed Schedule</option>
                    <option value="too_difficult">Too Difficult / Intimidating</option>
                    <option value="schedule_changed">Schedule Changed / Emergency</option>
                    <option value="discomfort">Physical Discomfort / Tightness</option>
                    <option value="equipment_unavailable">Equipment Unavailable</option>
                    <option value="not_enjoyed">Did Not Enjoy Activity</option>
                    <option value="other">Other Reason</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">User Feedback & Qualitative Notes</label>
                <textarea
                  rows={2}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="How did your body respond? E.g., Spine felt loose, or couldn't get into rhythm."
                  className="w-full p-2.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 placeholder:text-slate-500 focus:outline-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setLogModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0A0A0B] font-bold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating Model...' : 'Save & Update State'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
