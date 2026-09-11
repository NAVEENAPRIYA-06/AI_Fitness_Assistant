import React, { useState } from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import {
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  AlertCircle,
  Plus,
  Filter,
  Flame,
  Moon,
  Zap,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Cpu,
  CalendarDays,
  Sparkles,
  Info,
  Check,
  Brain,
  ChevronDown,
  ChevronUp,
  Search,
  SlidersHorizontal
} from 'lucide-react';
import { MetricBadge } from '../common/MetricBadge.js';
import { Accordion } from '../common/Accordion.js';

export const OutcomeJournalView: React.FC = () => {
  const {
    outcomes,
    submitOutcome,
    recommendation,
    context,
    evolvingState,
    behaviorSummary,
    adaptivePlanPayload,
    predictionRecords,
    setActiveModule
  } = useHealthPilot();

  const [showLogForm, setShowLogForm] = useState(false);
  const [outcomeStatus, setOutcomeStatus] = useState<'completed' | 'partially_completed' | 'skipped'>('completed');
  const [actualDuration, setActualDuration] = useState(recommendation?.durationMinutes || 25);
  const [skipReason, setSkipReason] = useState<string>('too_tired');
  const [feedback, setFeedback] = useState('');
  const [perceivedEffort, setPerceivedEffort] = useState(5);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'partially_completed' | 'skipped'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scenarioRunning, setScenarioRunning] = useState<string | null>(null);
  const [expandedXaiIds, setExpandedXaiIds] = useState<Record<string, boolean>>({});

  const toggleXai = (id: string) => {
    setExpandedXaiIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // RPE exertion label helper
  const getRpeLabel = (rpe: number) => {
    if (rpe <= 2) return 'Very Light (Active Recovery / Breathwork)';
    if (rpe <= 4) return 'Light to Moderate (Zone 2 Aerobic)';
    if (rpe <= 6) return 'Moderate to Challenging (Steady Functional)';
    if (rpe <= 8) return 'Hard / Threshold (High Effort)';
    return 'Maximum Exertion / Sprint';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitOutcome({
        recommendationId: recommendation?.id || 'rec-custom',
        recommendedActivity: recommendation?.title || 'Personalized Session',
        category: recommendation?.category || 'mobility',
        plannedDurationMinutes: recommendation?.durationMinutes || 25,
        intensity: recommendation?.intensity || 'low',
        contextSnapshot: {
          sleepHours: context?.sleepHours || 6.5,
          energyLevel: context?.energyLevel || 6,
          fatigueLevel: context?.fatigueLevel || 5,
          stressLevel: context?.stressLevel || 5,
          availableMinutes: context?.availableMinutes || 30,
          environment: context?.environment || 'home'
        },
        outcomeStatus,
        actualDurationMinutes: outcomeStatus === 'skipped' ? 0 : actualDuration,
        reasonForSkipOrPartial: outcomeStatus !== 'completed' ? skipReason : undefined,
        userFeedback: feedback || (outcomeStatus === 'completed' ? 'Executed session as planned.' : 'Session modified due to daily constraints.'),
        perceivedEffort: outcomeStatus === 'completed' ? perceivedEffort : undefined
      });
      setShowLogForm(false);
      setFeedback('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // One-click research scenario triggers
  const runTestScenario = async (scenarioKey: string) => {
    setScenarioRunning(scenarioKey);
    try {
      if (scenarioKey === 'isolated_skip') {
        // Scenario 1: Isolated skip (no_time) - verifies isolated non-completion updates metrics without over-adapting schedule
        await submitOutcome({
          recommendationId: recommendation?.id || 'rec-test-1',
          recommendedActivity: recommendation?.title || '30-Min Aerobic Zone 2 Run',
          category: 'workout',
          plannedDurationMinutes: 30,
          intensity: 'moderate',
          contextSnapshot: {
            sleepHours: 7.2,
            energyLevel: 6,
            fatigueLevel: 4,
            stressLevel: 6,
            availableMinutes: 15,
            environment: 'home'
          },
          outcomeStatus: 'skipped',
          actualDurationMinutes: 0,
          reasonForSkipOrPartial: 'no_time',
          userFeedback: 'Emergency work deadline came up. Single skip; plan should maintain long-term goal and not overreact.'
        });
      } else if (scenarioKey === 'acute_fatigue') {
        // Scenario 2: High fatigue & sleep deficit - verifies down-regulation to restorative mobility
        await submitOutcome({
          recommendationId: recommendation?.id || 'rec-test-2',
          recommendedActivity: '35-Min High-Intensity Intervals',
          category: 'workout',
          plannedDurationMinutes: 35,
          intensity: 'high',
          contextSnapshot: {
            sleepHours: 4.8,
            energyLevel: 3,
            fatigueLevel: 8,
            stressLevel: 8,
            availableMinutes: 25,
            environment: 'home'
          },
          outcomeStatus: 'partially_completed',
          actualDurationMinutes: 15,
          reasonForSkipOrPartial: 'too_tired',
          userFeedback: 'Exhausted after travel. Cut intervals short; switched to 15m foam rolling and gentle stretching.',
          perceivedEffort: 4
        });
      } else if (scenarioKey === 'repeated_time') {
        // Scenario 3: Repeated time constraint (triggers 20-25m compression rule)
        await submitOutcome({
          recommendationId: recommendation?.id || 'rec-test-3',
          recommendedActivity: '40-Min Full Body Strength',
          category: 'workout',
          plannedDurationMinutes: 40,
          intensity: 'moderate',
          contextSnapshot: {
            sleepHours: 6.8,
            energyLevel: 6,
            fatigueLevel: 5,
            stressLevel: 7,
            availableMinutes: 20,
            environment: 'home'
          },
          outcomeStatus: 'skipped',
          reasonForSkipOrPartial: 'no_time',
          userFeedback: 'Repeated schedule constraint. Only have 20-25 mins between meetings.',
          actualDurationMinutes: 0
        });
      } else if (scenarioKey === 'high_adherence') {
        // Scenario 4: Successful completion with RPE 6 - verifies momentum rebound & progressive load
        await submitOutcome({
          recommendationId: recommendation?.id || 'rec-test-4',
          recommendedActivity: '25-Min Home Dumbbell Strength',
          category: 'workout',
          plannedDurationMinutes: 25,
          intensity: 'moderate',
          contextSnapshot: {
            sleepHours: 7.8,
            energyLevel: 8,
            fatigueLevel: 3,
            stressLevel: 3,
            availableMinutes: 45,
            environment: 'home'
          },
          outcomeStatus: 'completed',
          actualDurationMinutes: 25,
          userFeedback: 'Completed full protocol with clean form. Energy high, recovery felt solid.',
          perceivedEffort: 6
        });
      }
    } catch (err) {
      console.error('Error running test scenario:', err);
    } finally {
      setScenarioRunning(null);
    }
  };

  const filteredOutcomes = outcomes.filter(out => {
    if (filterStatus !== 'all' && out.outcomeStatus !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = out.recommendedActivity?.toLowerCase().includes(q);
      const matchFeedback = out.userFeedback?.toLowerCase().includes(q);
      const matchReason = out.reasonForSkipOrPartial?.toLowerCase().includes(q);
      return matchTitle || matchFeedback || matchReason;
    }
    return true;
  });

  const completedCount = outcomes.filter(o => o.outcomeStatus === 'completed').length;
  const partialCount = outcomes.filter(o => o.outcomeStatus === 'partially_completed').length;
  const skippedCount = outcomes.filter(o => o.outcomeStatus === 'skipped').length;
  const momentumScore = evolvingState?.behavioralMomentum ?? 65;
  const momentumLabel = evolvingState?.behavioralMomentumLabel || (momentumScore >= 75 ? 'Strong' : momentumScore >= 45 ? 'Moderate' : 'Low');

  // Recent 3 logs for Section 2
  const recentLogs = outcomes.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Continuous Feedback Loop
            </span>
            <span className="text-xs text-slate-500 font-mono">Empirical Calibration</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Outcome Journal & Empirical Adaptation
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed mt-1">
            Logs physical execution, perceived exertion, and reported barriers. Every outcome updates empirical behavioral
            indicators, evolving recovery states, and dynamically rebalances future training schedules without altering long-term goals.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveModule('adaptive_plan')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            <CalendarDays className="w-4 h-4 text-indigo-400" />
            <span>View Adaptive Plan</span>
          </button>
        </div>
      </div>

      {/* 1. LOG OUTCOME ACTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              1. Log Outcome Action
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Current Prescribed Session
          </span>
        </div>

        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase">
                  Today's Prescribed Session
                </span>
                <span className="text-xs font-mono text-slate-400">{recommendation?.durationMinutes || 25} mins</span>
              </div>
              <h4 className="text-base font-bold text-white">
                {recommendation?.title || 'Personalized Functional Session'}
              </h4>
              <p className="text-xs text-slate-400">
                Category: <span className="text-slate-300 capitalize">{recommendation?.category || 'Mobility'}</span> • Intensity: <span className="text-slate-300 capitalize">{recommendation?.intensity || 'Low'}</span>
              </p>
            </div>

            <button
              onClick={() => setShowLogForm(!showLogForm)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-[#0A0A0B] bg-emerald-500 hover:bg-emerald-400 transition-colors shadow-xs shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{showLogForm ? 'Close Log Form' : 'Log Today’s Session'}</span>
            </button>
          </div>

          {/* New Outcome Form Drawer */}
          {showLogForm && (
            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Record Execution Details</h4>
                  <p className="text-xs text-slate-400">
                    Feeding outcome data into the empirical feedback engine to update behavioral momentum and multi-day plans.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Status Selector */}
                <div>
                  <label className="block font-semibold text-slate-300 mb-2">Outcome Execution Status</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(['completed', 'partially_completed', 'skipped'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setOutcomeStatus(st)}
                        className={`py-2.5 px-3 rounded-lg border font-semibold capitalize text-center transition-all ${
                          outcomeStatus === st
                            ? st === 'completed'
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-xs'
                              : st === 'partially_completed'
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-xs'
                              : 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-xs'
                            : 'border-slate-800 text-slate-400 hover:bg-slate-800/60'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration and Exertion */}
                {outcomeStatus !== 'skipped' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <div className="flex justify-between items-center">
                        <label className="font-semibold text-slate-300">Actual Duration Completed</label>
                        <span className="font-mono font-bold text-emerald-400">{actualDuration} mins</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="90"
                        step="5"
                        value={actualDuration}
                        onChange={(e) => setActualDuration(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>5m</span>
                        <span>Planned: {recommendation?.durationMinutes || 25}m</span>
                        <span>90m</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                      <div className="flex justify-between items-center">
                        <label className="font-semibold text-slate-300">Perceived Exertion (RPE)</label>
                        <span className="font-mono font-bold text-indigo-400">{perceivedEffort} / 10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={perceivedEffort}
                        onChange={(e) => setPerceivedEffort(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {getRpeLabel(perceivedEffort)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Barrier Selection */}
                {outcomeStatus !== 'completed' && (
                  <div className="space-y-1.5">
                    <label className="block font-semibold text-slate-300">Primary Barrier or Reason for Modification/Skip</label>
                    <select
                      value={skipReason}
                      onChange={(e) => setSkipReason(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-800 text-white bg-slate-950 text-xs focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="too_tired">Too Tired / Excessive Physical Fatigue</option>
                      <option value="no_time">No Time / Urgent Schedule Conflict</option>
                      <option value="too_difficult">Target Intensity Too High for Current Recovery</option>
                      <option value="schedule_changed">Work Schedule Changed / Emergency</option>
                      <option value="discomfort">Musculoskeletal Tightness / Discomfort</option>
                      <option value="equipment_unavailable">Equipment or Facility Unavailable</option>
                      <option value="not_enjoyed">Preferred Different Modality Today</option>
                      <option value="other">Other External Factor</option>
                    </select>
                  </div>
                )}

                {/* Qualitative Notes */}
                <div className="space-y-1.5">
                  <label className="block font-semibold text-slate-300">Subjective Reflection / Qualitative Notes</label>
                  <textarea
                    rows={2}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="E.g., Felt strong in first 10 minutes, then fatigue kicked in; or work call ran late so had to shorten session..."
                    className="w-full p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white placeholder:text-slate-500 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowLogForm(false)}
                    className="px-4 py-2 rounded-lg text-slate-400 hover:bg-slate-800 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0A0A0B] text-xs font-bold transition-colors disabled:opacity-50 shadow-xs"
                  >
                    {isSubmitting ? 'Closing Feedback Loop...' : 'Submit & Rebalance System'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* 2. RECENT LOGS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              2. Recent Logs
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Latest 3 Executions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recentLogs.map((out) => {
            const isCompleted = out.outcomeStatus === 'completed';
            const isPartial = out.outcomeStatus === 'partially_completed';
            return (
              <div
                key={out.id}
                className="bg-[#0F0F11] border border-slate-800 rounded-xl p-4 shadow-xs space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">{out.timestamp}</span>
                    <MetricBadge
                      label={out.outcomeStatus.replace('_', ' ').toUpperCase()}
                      variant={isCompleted ? 'emerald' : isPartial ? 'amber' : 'rose'}
                      size="sm"
                    />
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{out.recommendedActivity}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>{out.actualDurationMinutes}m / {out.plannedDurationMinutes}m</span>
                    {out.perceivedEffort && <span>• RPE {out.perceivedEffort}/10</span>}
                  </div>
                </div>

                {out.userFeedback && (
                  <p className="text-[11px] text-slate-400 italic line-clamp-2 pt-2 border-t border-slate-800/80">
                    "{out.userFeedback}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. HISTORY / SEARCH FILTER */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              3. History & Search Filter
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {filteredOutcomes.length} of {outcomes.length} Entries
          </span>
        </div>

        {/* Filter Controls & Search */}
        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs by activity, feedback, or barrier..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 overflow-x-auto">
              {(['all', 'completed', 'partially_completed', 'skipped'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                    filterStatus === st
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st === 'all' ? 'All' : st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Outcome Stream */}
          <div className="space-y-3 pt-1">
            {filteredOutcomes.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/30 rounded-lg border border-slate-800/60">
                No outcome entries matched your search criteria.
              </div>
            ) : (
              filteredOutcomes.map((out) => {
                const isCompleted = out.outcomeStatus === 'completed';
                const isPartial = out.outcomeStatus === 'partially_completed';
                const isSkipped = out.outcomeStatus === 'skipped';

                return (
                  <div
                    key={out.id}
                    className="bg-slate-900/40 border border-slate-800 rounded-xl p-4.5 space-y-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isPartial
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : isPartial ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{out.recommendedActivity}</h4>
                          <span className="text-[11px] text-slate-500 font-mono">{out.timestamp}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <MetricBadge
                          label={out.outcomeStatus.replace('_', ' ').toUpperCase()}
                          variant={isCompleted ? 'emerald' : isPartial ? 'amber' : 'rose'}
                          size="sm"
                        />
                        <span className="text-xs font-mono font-bold text-slate-300">
                          {out.actualDurationMinutes}m <span className="text-slate-500 font-normal">/ {out.plannedDurationMinutes}m</span>
                        </span>
                        {out.perceivedEffort && (
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            RPE {out.perceivedEffort}/10
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Context Snapshot When Issued */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Sleep Prior</span>
                        <span className="font-mono font-bold text-slate-200">
                          {out.contextSnapshot?.sleepHours?.toFixed(1) || 6.5}h
                        </span>
                      </div>
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Energy / Fatigue</span>
                        <span className="font-mono font-bold text-slate-200">
                          {out.contextSnapshot?.energyLevel || 5} / {out.contextSnapshot?.fatigueLevel || 5}
                        </span>
                      </div>
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Available Time</span>
                        <span className="font-mono font-bold text-slate-200">
                          {out.contextSnapshot?.availableMinutes || 30} mins
                        </span>
                      </div>
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Environment</span>
                        <span className="font-bold text-slate-200 capitalize">
                          {out.contextSnapshot?.environment || 'home'}
                        </span>
                      </div>
                    </div>

                    {/* Explainable AI: Predicted Adherence & Influencing Factors */}
                    {(() => {
                      const predRecord = predictionRecords?.find(p => p.recommendationId === out.recommendationId);
                      const predAdherence = predRecord?.predictedAdherence ?? (
                        predRecord?.predictionProbability
                          ? Math.round(predRecord.predictionProbability * 100)
                          : Math.max(35, Math.min(92, Math.round(
                              68 + ((out.contextSnapshot?.availableMinutes || 30) >= (out.plannedDurationMinutes || 25) ? 14 : -16)
                              + ((out.contextSnapshot?.sleepHours || 6.5) >= 7.0 ? 8 : -8)
                              - ((out.contextSnapshot?.fatigueLevel || 5) >= 7 ? 14 : 0)
                            )))
                      );
                      const isExpanded = !!expandedXaiIds[out.id];
                      const timeDiff = (out.contextSnapshot?.availableMinutes || 30) - (out.plannedDurationMinutes || 25);
                      const sleepHours = out.contextSnapshot?.sleepHours || 6.5;
                      const fatigue = out.contextSnapshot?.fatigueLevel || 5;

                      return (
                        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2">
                              <div className="p-1 rounded bg-indigo-500/20 text-indigo-400">
                                <Brain className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-semibold text-slate-200">ML Adherence Prediction:</span>
                              <span className="font-mono font-bold text-indigo-400">{predAdherence}%</span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                ({predAdherence >= 55 ? 'Likely to Complete' : 'At-Risk / Low Adherence'})
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleXai(out.id)}
                              className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 self-start sm:self-auto font-medium"
                            >
                              <span>{isExpanded ? 'Hide Influencing Factors' : 'View Influencing Factors (SHAP)'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>

                          {isExpanded && (
                            <div className="pt-2 border-t border-slate-800 space-y-2">
                              <div className="text-[11px] text-slate-400 font-medium">
                                Factors that contributed to the {predAdherence}% predicted adherence:
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                                <div className={`p-2 rounded border ${
                                  timeDiff >= 0 ? 'bg-emerald-950/20 border-emerald-800/30' : 'bg-rose-950/20 border-rose-800/30'
                                }`}>
                                  <div className="flex items-center justify-between font-semibold">
                                    <span className="text-slate-300">Schedule Window</span>
                                    <span className={`font-mono ${timeDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      {timeDiff >= 0 ? `+${timeDiff}m buffer` : `${timeDiff}m deficit`}
                                    </span>
                                  </div>
                                  <p className="text-slate-400 mt-0.5 text-[10px] leading-relaxed">
                                    {timeDiff >= 0
                                      ? 'Available time exceeded duration, increasing predicted completion likelihood.'
                                      : 'Available time was shorter than planned duration, reducing predicted adherence.'}
                                  </p>
                                </div>

                                <div className={`p-2 rounded border ${
                                  sleepHours >= 7.0 ? 'bg-emerald-950/20 border-emerald-800/30' : 'bg-rose-950/20 border-rose-800/30'
                                }`}>
                                  <div className="flex items-center justify-between font-semibold">
                                    <span className="text-slate-300">Sleep Restoration</span>
                                    <span className={`font-mono ${sleepHours >= 7.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      {sleepHours.toFixed(1)}h logged
                                    </span>
                                  </div>
                                  <p className="text-slate-400 mt-0.5 text-[10px] leading-relaxed">
                                    {sleepHours >= 7.0
                                      ? 'Adequate sleep supported physiological readiness and increased predicted adherence.'
                                      : 'Restricted sleep baseline reduced predicted likelihood of completing strenuous tasks.'}
                                  </p>
                                </div>

                                <div className={`p-2 rounded border ${
                                  fatigue <= 5 ? 'bg-emerald-950/20 border-emerald-800/30' : 'bg-rose-950/20 border-rose-800/30'
                                }`}>
                                  <div className="flex items-center justify-between font-semibold">
                                    <span className="text-slate-300">Fatigue Burden</span>
                                    <span className={`font-mono ${fatigue <= 5 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      {fatigue}/10 level
                                    </span>
                                  </div>
                                  <p className="text-slate-400 mt-0.5 text-[10px] leading-relaxed">
                                    {fatigue <= 5
                                      ? 'Manageable fatigue supported consistency and increased predicted completion likelihood.'
                                      : 'Elevated fatigue created physical friction and reduced predicted likelihood of completion.'}
                                  </p>
                                </div>
                              </div>

                              <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-1">
                                <span>Model: {predRecord?.modelName || 'Logistic Regression (Interventional SHAP)'}</span>
                                <span>Outcome: <strong className="text-slate-300 capitalize">{out.outcomeStatus.replace('_', ' ')}</strong></span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Barrier / Feedback */}
                    {out.reasonForSkipOrPartial && (
                      <div className="p-2.5 bg-rose-500/10 rounded-lg border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span><strong>Reported Barrier:</strong> {out.reasonForSkipOrPartial.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </div>
                    )}

                    {out.userFeedback && (
                      <div className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                        <span className="italic">"{out.userFeedback}"</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. CALIBRATION & RESEARCH TESTING (COLLAPSIBLE / SECONDARY) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            4. Empirical Calibration & Research Scenarios
          </h3>
        </div>

        <Accordion
          allowMultiple
          items={[
            {
              id: 'feedback-loop-pipeline',
              title: 'Live System Feedback Loop Pipeline & Behavioral Momentum',
              subtitle: '8-stage continuous calibration model and real-time state metrics',
              badge: `${momentumScore}/100 Momentum`,
              content: (
                <div className="space-y-4">
                  {/* 8-Stage Flow Visualization */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center">
                    {[
                      { step: '1. Rec', label: 'Recommendation', status: 'Active', sub: 'Today Issued' },
                      { step: '2. Action', label: 'User Action', status: 'Pending', sub: 'User Execution' },
                      { step: '3. Log', label: 'Outcome', status: `${outcomes.length} Logged`, sub: 'Adherence Recorded' },
                      { step: '4. Insight', label: 'Feedback', status: 'Calibrated', sub: 'RPE & Barriers' },
                      { step: '5. Behavioral', label: 'Behavior Sync', status: `${behaviorSummary?.completionRateOverall || 78}% Overall`, sub: 'Pattern Matrix' },
                      { step: '6. State', label: 'Evolving State', status: `Momentum: ${momentumLabel}`, sub: `${momentumScore}/100 Score` },
                      { step: '7. Adaptive', label: 'Plan Rebalanced', status: `${adaptivePlanPayload?.activeAdaptationsCount || 2} Days Adapted`, sub: 'Preserves Goals' },
                      { step: '8. Next', label: 'Future Rec', status: 'Refined', sub: 'Next Day Bias' }
                    ].map((item) => (
                      <div
                        key={item.step}
                        className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-left space-y-1"
                      >
                        <div className="text-[10px] font-mono font-bold text-emerald-400">{item.step}</div>
                        <div className="text-xs font-semibold text-slate-200 truncate">{item.label}</div>
                        <div className="text-[10px] font-mono text-slate-400 truncate">{item.status}</div>
                      </div>
                    ))}
                  </div>

                  {/* Behavioral Momentum Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-4 space-y-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Behavioral Momentum
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold font-mono text-white">{momentumScore}</span>
                        <span className="text-xs font-mono text-slate-500">/ 100</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Momentum is {momentumLabel.toLowerCase()} based on recent session follow-through ({completedCount} of {outcomes.length} completed).
                      </p>
                    </div>

                    <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-4 space-y-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Adherence Distribution
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 text-center pt-1">
                        <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
                          <span className="text-xs font-bold font-mono text-emerald-400 block">{completedCount}</span>
                          <span className="text-[9px] text-slate-400 uppercase">Done</span>
                        </div>
                        <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded">
                          <span className="text-xs font-bold font-mono text-amber-400 block">{partialCount}</span>
                          <span className="text-[9px] text-slate-400 uppercase">Part</span>
                        </div>
                        <div className="p-1.5 bg-rose-500/10 border border-rose-500/20 rounded">
                          <span className="text-xs font-bold font-mono text-rose-400 block">{skippedCount}</span>
                          <span className="text-[9px] text-slate-400 uppercase">Skip</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-4 space-y-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Adaptation Guardrails
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Isolated skips do not alter full week plans. Repeated constraints trigger conservative load throttling while preserving long-term targets.
                      </p>
                    </div>
                  </div>
                </div>
              )
            },
            {
              id: 'research-scenarios',
              title: 'Research Test Scenarios: Verify Feedback Loop Behaviors',
              subtitle: 'One-click simulated outcomes to test feedback loop responses',
              badge: '4 Interactive Scenarios',
              content: (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Trigger specific outcome events to observe real-time recalculations in behavioral momentum, evolving state, and adaptive schedule days.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                    <button
                      onClick={() => runTestScenario('isolated_skip')}
                      disabled={scenarioRunning !== null}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/80 text-left transition-all space-y-1.5 group disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                          Scenario 1: Isolated Skip
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">Noise Filter</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        Logs 1 skip for 'no_time'. Verifies adherence updates without over-adapting full schedule.
                      </p>
                    </button>

                    <button
                      onClick={() => runTestScenario('acute_fatigue')}
                      disabled={scenarioRunning !== null}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/80 text-left transition-all space-y-1.5 group disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                          Scenario 2: Acute Fatigue
                        </span>
                        <span className="text-[10px] font-mono text-amber-500">Recovery Pivot</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        Sleep 4.8h & fatigue 8/10. Down-regulates to restorative mobility and defers threshold work.
                      </p>
                    </button>

                    <button
                      onClick={() => runTestScenario('repeated_time')}
                      disabled={scenarioRunning !== null}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/80 text-left transition-all space-y-1.5 group disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                          Scenario 3: Repeated Barrier
                        </span>
                        <span className="text-[10px] font-mono text-indigo-400">20m Scaling</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        2nd consecutive time barrier. Triggers time compression rule, adapting future workouts to 25m.
                      </p>
                    </button>

                    <button
                      onClick={() => runTestScenario('high_adherence')}
                      disabled={scenarioRunning !== null}
                      className="p-3 rounded-lg bg-slate-900 border border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/80 text-left transition-all space-y-1.5 group disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                          Scenario 4: High Adherence
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">Progression</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        Clean 25m completion (RPE 6). Momentum increases to Strong, locking in planned progressive challenge.
                      </p>
                    </button>
                  </div>

                  {scenarioRunning && (
                    <div className="text-xs text-emerald-400 font-mono flex items-center gap-2 pt-1">
                      <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                      <span>Processing continuous feedback loop for {scenarioRunning}...</span>
                    </div>
                  )}
                </div>
              )
            }
          ]}
        />
      </div>
    </div>
  );
};
