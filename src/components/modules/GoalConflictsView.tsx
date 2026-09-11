import React from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import {
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Moon,
  Info,
  Scale,
  Heart,
  Target
} from 'lucide-react';

export const GoalConflictsView: React.FC = () => {
  const { recommendation, context, evolvingState, goals, setActiveModule } = useHealthPilot();

  const conflict = recommendation?.goalConflict;

  const protectionRules = [
    {
      title: 'Sleep Deficit Protection',
      condition: 'Sleep duration < 6.0 hours or low sleep quality',
      scheduledGoal: 'High-intensity workout or heavy strength progression',
      resolution: 'Adjust to low-impact restorative mobility or Zone 2 aerobic walk.',
      why: 'High training stress on low sleep increases soft-tissue strain and spikes workout abandonment.'
    },
    {
      title: 'Time Constraint Protection',
      condition: 'Available time < 25 minutes',
      scheduledGoal: 'Standard 45-60 minute gym session',
      resolution: 'Condense into a focused 15-20 minute home micro-session.',
      why: 'Keeps your habit streak intact and prevents feeling overwhelmed.'
    },
    {
      title: 'Elevated Fatigue & Soreness Protection',
      condition: 'Fatigue score ≥ 7 or Muscle Soreness ≥ 6',
      scheduledGoal: 'Max effort intervals or heavy leg day',
      resolution: 'Substitute with mobility flow, foam rolling, and active recovery.',
      why: 'Allows muscle fibers to rebuild, preventing chronic fatigue and overtraining.'
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--warning-soft)] text-[var(--warning)] text-xs font-semibold mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>Smart Adaptation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Your Goal vs Today's Condition
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-normal max-w-2xl">
            Standard fitness plans push you blindly even when your sleep or energy is depleted. HealthPilot adapts your workout so you progress without burning out.
          </p>
        </div>

        <button
          onClick={() => setActiveModule('today')}
          className="px-4 py-2 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>View Today's Workout</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* TODAY'S ACTIVE BALANCE STATUS */}
      {conflict?.hasConflict ? (
        <div className="bg-[var(--warning-soft)] border border-[var(--warning)]/30 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[var(--warning)]/20 text-[var(--warning)] flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--warning)]/20 text-[var(--warning)] text-[10px] font-extrabold uppercase tracking-wider">
                  Today's Safe Adjustment
                </span>
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                Condition Mismatch Resolved: {conflict.goalName}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {conflict.conflictExplanation}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <Sparkles className="w-4 h-4 text-[var(--primary)]" />
              <span>How HealthPilot Adjusted Today:</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {conflict.recommendedResolution}
            </p>
            <div className="pt-2 flex items-center justify-between text-xs text-[var(--text-muted)] border-t border-[var(--border)]">
              <span>Primary Goal is Protected</span>
              <span className="text-[var(--primary)] font-semibold">Stimulus shifted safely</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 shadow-xs flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Full Goal & Body Alignment
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Your recovery readiness ({evolvingState?.recoveryReadiness || 72}%) and available time match your planned training stimulus. No down-regulation needed today!
            </p>
          </div>
        </div>
      )}

      {/* HOW HEALTHPILOT PROTECTS YOU */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            How HealthPilot Protects Your Health & Goals
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Transparent rules that keep your long-term fitness on track without injury or burnout
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {protectionRules.map((rule, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--warning)] block">
                  {rule.title}
                </span>
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  When: {rule.condition}
                </p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  <strong>Adjustment:</strong> {rule.resolution}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--border)] text-[11px] text-[var(--text-muted)] leading-relaxed">
                {rule.why}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
