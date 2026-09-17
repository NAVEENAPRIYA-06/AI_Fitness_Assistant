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
  Calendar,
  Sparkles,
  Award
} from 'lucide-react';

export const GoalStrategyView: React.FC = () => {
  const { goals, setActiveModule, setIsOnboardingModalOpen } = useHealthPilot();

  const safeGoals = Array.isArray(goals) ? goals : [];
  const activeConflictsCount = safeGoals.filter(g => g.activeConflictFlag).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold mb-2">
            <Target className="w-3.5 h-3.5" />
            <span>Long-Term Targets</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Your Fitness Goals
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-normal max-w-2xl">
            HealthPilot treats goals as a guiding compass. When life or fatigue interrupts, your plan dynamically buffers so you keep moving forward without burning out.
          </p>
        </div>

        {activeConflictsCount > 0 && (
          <button
            onClick={() => setActiveModule('conflicts')}
            className="px-4 py-2 rounded-2xl bg-[var(--warning-soft)] hover:bg-[var(--warning-soft)]/80 border border-[var(--warning)]/30 text-xs font-bold text-[var(--warning)] transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{activeConflictsCount} Adjusted Today →</span>
          </button>
        )}
      </div>

      {/* ACTIVE GOALS LIST */}
      <div className="space-y-5">
        {safeGoals.length === 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-10 sm:p-14 text-center space-y-4 max-w-xl mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center mx-auto">
              <Target className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Your goals start here</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Set your goals and HealthPilot will create a personalized strategy for you.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsOnboardingModalOpen(true)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[var(--primary)] hover:opacity-90 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Set My Goals</span>
              </button>
              <button
                onClick={() => setActiveModule('today')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-[var(--surface-soft)] hover:bg-[var(--surface-soft)]/80 text-[var(--text-secondary)] border border-[var(--border)] text-xs font-medium transition-all cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          safeGoals.map((goal) => {
            const isPrimary = goal.priority === 'primary' || (goal.priority as any) === 'high';
            // Calculate simulated progress %
            const currentNum = parseFloat(String(goal.currentValue).replace(/[^0-9.]/g, '')) || 65;
            const targetNum = parseFloat(String(goal.targetValue).replace(/[^0-9.]/g, '')) || 100;
            const progressPct = Math.min(100, Math.round((currentNum / (targetNum || 100)) * 100)) || 65;

            return (
              <div
                key={goal.id}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 shadow-xs space-y-5 transition-all hover:border-[var(--primary)]/30"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                        {goal.title}
                      </h3>
                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          isPrimary
                            ? 'bg-[var(--primary-soft)] text-[var(--primary)]'
                            : 'bg-[var(--surface-soft)] text-[var(--text-secondary)] border border-[var(--border)]'
                        }`}
                      >
                        {isPrimary ? 'Primary Focus' : 'Supporting Goal'}
                      </span>

                      {goal.activeConflictFlag && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning)]/30 text-[10px] font-bold inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Buffered for Today</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      Target: <strong className="text-[var(--text-primary)]">{goal.targetValue}</strong> • Target Date: {goal.timeframe || '12-Week Cycle'}
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-xs text-[var(--text-muted)] block">Progress</span>
                    <span className="text-2xl font-extrabold text-[var(--primary)]">{progressPct}%</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-2.5 bg-[var(--surface-soft)] rounded-full overflow-hidden border border-[var(--border)]">
                    <div
                      className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[var(--text-muted)] font-medium">
                    <span>Current: {goal.currentValue || 'Building base'}</span>
                    <span>Target: {goal.targetValue}</span>
                  </div>
                </div>

                {/* Strategy Note */}
                <div className="p-4 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs space-y-1">
                  <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
                    Adaptive Strategy:
                  </span>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {goal.strategyAdjustmentNote || 'Plan adapts based on daily recovery to preserve stimulus without acute overtraining.'}
                  </p>
                </div>

                {/* Milestones Checkpoints */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                    Phase Milestones
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {(goal.milestones || []).map((m) => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs transition-all ${
                          m.completed
                            ? 'bg-[var(--primary-soft)] border-[var(--primary)]/30 text-[var(--primary)] font-semibold'
                            : 'bg-[var(--surface-soft)] border-[var(--border)] text-[var(--text-secondary)]'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${
                            m.completed ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'
                          }`}
                        />
                        <span className="text-xs leading-snug">{m.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
