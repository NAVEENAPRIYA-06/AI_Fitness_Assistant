import React from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import {
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  BatteryCharging,
  Moon,
  Info
} from 'lucide-react';

export const GoalConflictsView: React.FC = () => {
  const { recommendation, context, evolvingState, goals, setActiveModule } = useHealthPilot();

  const conflict = recommendation?.goalConflict;

  const conflictRules = [
    {
      title: 'Sleep Deficit Rule',
      condition: 'Sleep duration < 6.0 hours OR Sleep Quality < 5',
      scheduledGoal: 'High-intensity interval training (HIIT) or Max Strength',
      systemResolution: 'Down-regulate to low-impact restorative mobility or Zone 1 active recovery. Shift threshold stimulus 48h forward.',
      rationale: 'Elevated cortisol and impaired glycogen replenishment elevate soft-tissue injury risk and triple workout abandonment rate.'
    },
    {
      title: 'Compressed Time Window Rule',
      condition: 'Available time < 25 minutes',
      scheduledGoal: 'Standard 45–60 min full body session',
      systemResolution: 'Execute a 15–20 minute high-density micro-session or mobility sequence.',
      rationale: 'Prevents task avoidance and preserves daily identity momentum.'
    },
    {
      title: 'High Fatigue & Muscular Soreness Rule',
      condition: 'Fatigue score >= 7 AND Soreness >= 6',
      scheduledGoal: 'Heavy progressive overload or long threshold run',
      systemResolution: 'Substitute with targeted myofascial foam rolling and parasympathetic breathing.',
      rationale: 'Avoids non-functional overreaching.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 font-mono text-xs font-bold border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 inline mr-1 text-amber-400" />
            Decision Intelligence Rule Engine
          </span>
          <span className="text-xs text-slate-500 font-mono">Acute vs. Chronic Equilibrium</span>
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">
          Goal-Condition Conflict Resolution
        </h2>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Standard fitness apps blindly push high-intensity routines even when sleep, stress, or recovery are critically low.
          HealthPilot AI detects acute dissonance between long-term athletic goals and real-world physiological capacity.
        </p>
      </div>

      {/* Active Conflict Status Banner */}
      {conflict?.hasConflict ? (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-amber-200">Active Conflict: {conflict.goalName}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                    Severity: {conflict.severity}
                  </span>
                </div>
                <p className="text-xs text-amber-100/90 leading-relaxed font-medium">
                  {conflict.conditionDescription}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveModule('today')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold transition-colors shrink-0"
            >
              <span>View Today's Adapted Decision</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-[#0F0F11] rounded-xl p-4 border border-amber-500/20 space-y-1.5">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                The Conflict Mechanism
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {conflict.conflictExplanation}
              </p>
            </div>

            <div className="bg-[#0F0F11] rounded-xl p-4 border border-emerald-500/20 space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                Decision Engine Resolution
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {conflict.recommendedResolution}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-center gap-4">
          <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-300">No Acute Conflicts Active</h3>
            <p className="text-xs text-emerald-200/80 mt-0.5 leading-relaxed">
              Your physiological status aligns smoothly with your programmed goals. No emergency adaptations are required.
            </p>
          </div>
        </div>
      )}

      {/* Goal Conflict Resolution Rules Matrix */}
      <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-white tracking-tight">
          System Decision Adaptation Rules
        </h3>
        <p className="text-xs text-slate-400">
          The deterministic and probabilistic constraints balancing long-term ambitions with daily recovery
        </p>

        <div className="space-y-3 pt-1">
          {conflictRules.map((rule, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{rule.title}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                  Rule #{idx + 1}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Trigger Condition</span>
                  <p className="text-slate-300 font-medium">{rule.condition}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Original Scheduled Ambition</span>
                  <p className="text-slate-500 line-through">{rule.scheduledGoal}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold text-emerald-400 uppercase">Automated Resolution</span>
                  <p className="text-emerald-300 font-semibold">{rule.systemResolution}</p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 pt-1.5 border-t border-slate-800 leading-relaxed">
                <strong className="text-slate-300 font-medium">Physiological Rationale:</strong> {rule.rationale}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
