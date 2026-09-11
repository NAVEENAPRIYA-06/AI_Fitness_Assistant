import React from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  RotateCcw,
  Sliders,
  History,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { MetricBadge } from '../common/MetricBadge.js';
import { Accordion } from '../common/Accordion.js';

export const AdaptivePlanView: React.FC = () => {
  const {
    adaptivePlan,
    adaptivePlanPayload,
    isRebalancingPlan,
    rebalanceAdaptivePlan,
    resetAdaptivePlan,
    evolvingState,
    setActiveModule
  } = useHealthPilot();

  // Days list: prioritize adaptivePlanPayload.days if present, otherwise adaptivePlan
  const rawDays = adaptivePlanPayload?.days || adaptivePlan;
  const days = Array.isArray(rawDays) ? rawDays : [];
  const adaptationEvents = Array.isArray(adaptivePlanPayload?.adaptationEvents) ? adaptivePlanPayload.adaptationEvents : [];
  const activeAdaptationsCount = adaptivePlanPayload?.activeAdaptationsCount ?? days.filter(d => d.status === 'adapted').length;
  const momentumScore = evolvingState?.behavioralMomentum ?? 65;
  const momentumLabel = evolvingState?.behavioralMomentumLabel || (momentumScore >= 75 ? 'Strong' : momentumScore >= 45 ? 'Moderate' : 'Low');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20 flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
              Dynamic Multi-Day Scheduling
            </span>
            <span className="text-xs text-slate-500 font-mono">Feedback Loop Engine</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Adaptive Microcycle & Training Schedule
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed mt-1">
            Unlike static rigid calendars that accumulate guilt when unexpected constraints arise, HealthPilot AI dynamically
            rebalances upcoming training sessions based on logged recovery and barriers, while strictly preserving your primary goals.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveModule('journal')}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            Log New Outcome
          </button>

          <button
            onClick={resetAdaptivePlan}
            disabled={isRebalancingPlan}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors disabled:opacity-50"
            title="Reset adaptive changes back to original baseline schedule"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Baseline</span>
          </button>

          <button
            onClick={rebalanceAdaptivePlan}
            disabled={isRebalancingPlan}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-[#0A0A0B] bg-emerald-500 hover:bg-emerald-400 transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRebalancingPlan ? 'animate-spin' : ''}`} />
            <span>{isRebalancingPlan ? 'Rebalancing...' : 'Rebalance Schedule'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Adaptations</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-400">{activeAdaptationsCount}</span>
            <span className="text-xs text-slate-500">of 7 days adapted</span>
          </div>
          <p className="text-[11px] text-slate-400">Triggered by empirical fatigue & time constraints.</p>
        </div>

        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Behavioral Momentum</span>
            <MetricBadge
              label={momentumLabel.toUpperCase()}
              variant={momentumLabel === 'Strong' ? 'emerald' : momentumLabel === 'Moderate' ? 'amber' : 'rose'}
              size="sm"
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{momentumScore}</span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <p className="text-[11px] text-slate-400">{evolvingState?.recentCompletionRatio || '8/10 sessions completed'}</p>
        </div>

        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Long-Term Goal</span>
            <span className="text-[10px] font-mono text-emerald-400">Protected</span>
          </div>
          <div className="text-sm font-bold text-slate-200 truncate">10K Aerobic & Functional</div>
          <p className="text-[11px] text-slate-400">Preserved stimulus shifted to buffer blocks.</p>
        </div>

        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Evidence Model</span>
            <span className="text-[10px] font-mono text-teal-400">Transparent</span>
          </div>
          <div className="text-sm font-bold text-slate-200">Rule & Metric Driven</div>
          <p className="text-[11px] text-slate-400">Zero uninspected black-box drift.</p>
        </div>
      </div>

      {/* 1. CURRENT ADAPTIVE SCHEDULE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              1. Current Adaptive Schedule
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            7-Day Microcycle Overview
          </span>
        </div>

        <div className="space-y-3">
          {days.map((day) => {
            const isToday = day.dayName === 'Wednesday';
            const isAdapted = day.status === 'adapted';
            const isCompleted = day.status === 'completed';

            return (
              <div
                key={day.id}
                className={`bg-[#0F0F11] border rounded-xl p-4.5 transition-all shadow-xs space-y-3 ${
                  isToday
                    ? 'border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/20'
                    : isAdapted
                    ? 'border-amber-500/30 bg-amber-500/[0.02]'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3.5">
                    {/* Date Block */}
                    <div
                      className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                        isToday
                          ? 'bg-emerald-500 text-[#0A0A0B] font-bold shadow-xs'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isAdapted
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider">{(day.dayName || 'Day').slice(0, 3)}</span>
                      <span className="text-xs font-mono font-extrabold">{(day.date || '').split('-')[2] || '10'}</span>
                    </div>

                    {/* Session Name & Badges */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{day.plannedSession}</h4>
                        {isToday && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500 text-[#0A0A0B] font-bold">
                            Today
                          </span>
                        )}
                        <MetricBadge
                          label={day.status.toUpperCase()}
                          variant={
                            day.status === 'completed'
                              ? 'emerald'
                              : day.status === 'adapted'
                              ? 'amber'
                              : day.status === 'scheduled'
                              ? 'teal'
                              : 'slate'
                          }
                          size="sm"
                        />
                        {isAdapted && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Adapted from Baseline
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {day.durationMinutes} mins
                        </span>
                        <span>•</span>
                        <span className="capitalize text-slate-300">{day.intensity} Intensity</span>
                        <span>•</span>
                        <span className="capitalize text-slate-400">{day.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="sm:text-right">
                    {day.status === 'completed' ? (
                      <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold sm:justify-end">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completed as planned</span>
                      </div>
                    ) : isToday ? (
                      <button
                        onClick={() => setActiveModule('today')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-colors"
                      >
                        Execute Today →
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-slate-500">Upcoming Microcycle</span>
                    )}
                  </div>
                </div>

                {/* Adaptation Details Box */}
                {isAdapted && (
                  <div className="p-3.5 bg-amber-500/10 rounded-lg border border-amber-500/20 text-xs space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-amber-500/20 pb-1.5">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        {day.adaptationReason || 'Adapted based on fatigue recovery and time availability.'}
                      </span>
                      {day.originalSession && (
                        <span className="text-[11px] font-mono text-amber-200/80">
                          Was: <span className="line-through">{day.originalSession.plannedSession} ({day.originalSession.durationMinutes}m)</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-amber-200/90">
                      <div>
                        <strong className="text-amber-300">Triggering Evidence:</strong>{' '}
                        {day.triggeringEvidence || 'Acute sleep deficit and elevated fatigue reported in latest outcome.'}
                      </div>
                      <div>
                        <strong className="text-amber-300">Goal Preservation:</strong>{' '}
                        {day.goalPreserved || 'Aerobic stimulus redistributed to weekend microcycle; no volume deleted.'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. BASELINE VS. ADAPTED COMPARISON (DIFF VIEW) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              2. Baseline vs. Adapted Schedule Comparison
            </h3>
          </div>
          <span className="text-xs font-mono text-amber-400">
            {activeAdaptationsCount} Modifications
          </span>
        </div>

        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] uppercase font-mono text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Day</th>
                  <th className="py-2.5 px-3">Baseline Plan</th>
                  <th className="py-2.5 px-3">Active Adapted Plan</th>
                  <th className="py-2.5 px-3">Duration Delta</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {days.map((day) => {
                  const orig = day.originalSession;
                  const durationDiff = orig ? day.durationMinutes - orig.durationMinutes : 0;

                  return (
                    <tr key={day.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-3 font-bold text-white">
                        {day.dayName} <span className="text-slate-500 font-normal">({day.date})</span>
                      </td>

                      <td className="py-3 px-3 text-slate-300">
                        {orig ? (
                          <div>
                            <span className="font-semibold">{orig.plannedSession}</span>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {orig.durationMinutes}m • {orig.intensity}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="font-semibold">{day.plannedSession}</span>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {day.durationMinutes}m • {day.intensity}
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{day.plannedSession}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {day.durationMinutes}m • {day.intensity}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono">
                        {durationDiff !== 0 ? (
                          <span className={durationDiff < 0 ? 'text-amber-400' : 'text-emerald-400'}>
                            {durationDiff > 0 ? `+${durationDiff}m` : `${durationDiff}m`}
                          </span>
                        ) : (
                          <span className="text-slate-500">0m</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <MetricBadge
                          label={day.status.toUpperCase()}
                          variant={
                            day.status === 'completed'
                              ? 'emerald'
                              : day.status === 'adapted'
                              ? 'amber'
                              : 'slate'
                          }
                          size="sm"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. AUDIT TRAIL & REBALANCING PRINCIPLES (COLLAPSIBLE) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              3. Adaptation History & Rebalancing Principles
            </h3>
          </div>
        </div>

        <Accordion
          allowMultiple
          items={[
            {
              id: 'adaptation-events',
              title: `Adaptation Event History & Triggering Evidence (${adaptationEvents.length})`,
              subtitle: 'Full chronological audit trail of microcycle adjustments and safety guarantees',
              badge: `${adaptationEvents.length} Events`,
              content: (
                <div className="space-y-3">
                  {adaptationEvents.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      No adaptation events recorded yet. Plan is running on baseline schedule.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {adaptationEvents.map((evt) => (
                        <div
                          key={evt.id}
                          className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2.5"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold">
                                {evt.ruleApplied.replace('_', ' ').toUpperCase()}
                              </span>
                              <span className="text-xs font-bold text-white">{evt.dayName}</span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-500">{evt.timestamp}</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-slate-400 block text-[11px]">Previous Scheduled Session:</span>
                              <span className="text-slate-300 font-medium line-through">
                                {evt.previousSession.plannedSession} ({evt.previousSession.durationMinutes}m)
                              </span>
                            </div>

                            <div>
                              <span className="text-emerald-400 block text-[11px]">Adapted Intervention:</span>
                              <span className="text-white font-bold">
                                {evt.adaptedSession.plannedSession} ({evt.adaptedSession.durationMinutes}m)
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 bg-slate-800/60 rounded border border-slate-700/60 text-xs space-y-1">
                            <div>
                              <strong className="text-amber-400 text-[11px]">Triggering Evidence:</strong>{' '}
                              <span className="text-slate-300">{evt.triggeringEvidence}</span>
                            </div>
                            <div>
                              <strong className="text-emerald-400 text-[11px]">Goal Preserved:</strong>{' '}
                              <span className="text-slate-300">{evt.goalPreserved}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            },
            {
              id: 'principles',
              title: 'Microcycle Rebalancing Principles & Guardrails',
              subtitle: 'Mathematical rules preventing plan degradation while maintaining training stimulus',
              badge: '3 Core Guardrails',
              content: (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 leading-relaxed pt-1">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      1. Evidence-Based Pivot
                    </h4>
                    <p className="text-slate-400">
                      When fatigue &gt; 6 or sleep &lt; 6h is reported, strenuous intervals are deferred and replaced with restorative mobility.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      2. Barrier Compression
                    </h4>
                    <p className="text-slate-400">
                      Repeated time constraints trigger session compression down to 20–25 minutes rather than letting workouts be skipped entirely.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      3. Microcycle Redistribution
                    </h4>
                    <p className="text-slate-400">
                      Volume is redistributed to weekend buffer blocks. Progress toward primary endurance and strength goals is preserved.
                    </p>
                  </div>
                </div>
              )
            }
          ]}
        />
      </div>
    </div>
  );
};
