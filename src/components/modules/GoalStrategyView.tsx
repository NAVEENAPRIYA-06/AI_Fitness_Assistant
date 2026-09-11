import React from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import {
  Target,
  Flag,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';
import { MetricBadge } from '../common/MetricBadge.js';
import { Accordion } from '../common/Accordion.js';

export const GoalStrategyView: React.FC = () => {
  const { goals, setActiveModule } = useHealthPilot();

  const safeGoals = Array.isArray(goals) ? goals : [];
  const activeConflictsCount = safeGoals.filter(g => g.activeConflictFlag).length;
  const highPriorityGoals = safeGoals.filter(g => g.priority === 'high');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              Long-Term Ambitions
            </span>
            <span className="text-xs text-slate-500 font-mono">Dynamic Strategy Alignment</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Active Goal Strategies & Milestones
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed mt-1">
            HealthPilot AI treats goals as dynamic strategic directions that adjust intelligently when acute physiological recovery drops, preserving your long-term progress without causing burnout.
          </p>
        </div>

        {activeConflictsCount > 0 && (
          <button
            onClick={() => setActiveModule('conflicts')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors shrink-0"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{activeConflictsCount} Conflict Needs Review →</span>
          </button>
        )}
      </div>

      {/* 1. ACTIVE GOALS & PROGRESS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              1. Active Strategic Goals
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {safeGoals.length} Strategic Goals
          </span>
        </div>

        {safeGoals.length === 0 ? (
          <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-8 text-center space-y-3">
            <Target className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400 font-medium">No active goal strategies found.</p>
            <button
              onClick={() => setActiveModule('today')}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors"
            >
              Return to Today's Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {safeGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">{goal.title}</h4>
                      <MetricBadge
                        label={(goal.priority || 'medium').toUpperCase() + ' PRIORITY'}
                        variant={goal.priority === 'high' ? 'rose' : goal.priority === 'medium' ? 'amber' : 'slate'}
                        size="sm"
                      />
                      {goal.activeConflictFlag && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          Acute Conflict Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      {(goal.category || 'General').toUpperCase()} • Target: <strong className="text-slate-200">{goal.targetValue}</strong> ({goal.timeframe})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Current Progress</span>
                    <div className="flex items-center gap-2 mt-0.5 justify-end">
                      <span className="font-mono font-bold text-emerald-400 text-lg">{goal.currentValue}</span>
                      <span className="text-xs text-slate-500 font-mono">/ {goal.targetValue}</span>
                    </div>
                  </div>
                </div>

                {/* Strategic Adjustment Note */}
                <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5 text-emerald-400" />
                    Adaptive Strategy Note:
                  </span>
                  <p className="text-slate-400 leading-relaxed">
                    {goal.strategyAdjustmentNote || 'Plan aligned with current physiological baseline.'}
                  </p>
                </div>

                {/* Milestones List */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 block">Phase Checkpoints & Milestones:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {(goal.milestones || []).map((m) => (
                      <div
                        key={m.id}
                        className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                          m.completed
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${
                            m.completed ? 'text-emerald-400' : 'text-slate-600'
                          }`}
                        />
                        <span className="text-[11px] font-medium leading-snug">{m.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {goal.activeConflictFlag && (
                  <div className="pt-2 flex items-center justify-end border-t border-slate-800/80">
                    <button
                      onClick={() => setActiveModule('conflicts')}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <span>Review Conflict Details & Resolution</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. GOAL BUFFERING METHODOLOGY */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              2. Goal Buffering Principles & Guardrails
            </h3>
          </div>
        </div>

        <Accordion
          items={[
            {
              id: 'principles',
              title: 'Strategic North Star vs. Daily Readiness Framework',
              subtitle: 'How HealthPilot AI prevents burnout while maintaining progressive overload',
              content: (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 leading-relaxed pt-1">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                    <h4 className="font-bold text-white">Dynamic Buffering</h4>
                    <p className="text-slate-400">
                      When sleep or autonomic recovery drops, high-strain workouts are temporarily swapped for active recovery, postponing intense volume without abandoning the long-term milestone.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                    <h4 className="font-bold text-white">Microcycle Re-allocation</h4>
                    <p className="text-slate-400">
                      Target volume is shifted to scheduled buffer blocks within the same 7-day microcycle, maintaining total training load.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                    <h4 className="font-bold text-white">Milestone Preservation</h4>
                    <p className="text-slate-400">
                      Progress milestones are calculated using actual validated sessions, ensuring realistic readiness benchmarks rather than blind calendar countdowns.
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
