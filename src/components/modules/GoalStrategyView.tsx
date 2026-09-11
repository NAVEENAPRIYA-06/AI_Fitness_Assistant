import React from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import { Target, Flag, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { MetricBadge } from '../common/MetricBadge.js';

export const GoalStrategyView: React.FC = () => {
  const { goals, updateGoal, setActiveModule } = useHealthPilot();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
            <Target className="w-4 h-4 inline mr-1 text-emerald-400" />
            Long-Term Ambitions
          </span>
          <span className="text-xs text-slate-500 font-mono">Dynamic Strategy Alignment</span>
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">
          Active Goal Strategies & Milestones
        </h2>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          HealthPilot AI treats goals not as inflexible rigid mandates, but as strategic north stars that are dynamically
          buffered when acute physiological conditions conflict.
        </p>
      </div>

      <div className="space-y-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{goal.title}</h3>
                  <MetricBadge
                    label={goal.priority.toUpperCase() + ' PRIORITY'}
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
                <p className="text-xs text-slate-400">{goal.category.toUpperCase()} • Target: {goal.targetValue} ({goal.timeframe})</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500">Current Progress</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-bold text-white text-base">{goal.currentValue}</span>
                  <span className="text-xs text-slate-500">/ {goal.targetValue}</span>
                </div>
              </div>
            </div>

            {/* Strategic Adjustment Note */}
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-emerald-400" />
                Adaptive System Strategy Note:
              </span>
              <p className="text-slate-400 leading-relaxed">
                {goal.strategyAdjustmentNote}
              </p>
            </div>

            {/* Milestones List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Milestones & Phase Checkpoints:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {goal.milestones.map((m) => (
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
              <div className="pt-2 flex items-center justify-end">
                <button
                  onClick={() => setActiveModule('conflicts')}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <span>Review Conflict Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
