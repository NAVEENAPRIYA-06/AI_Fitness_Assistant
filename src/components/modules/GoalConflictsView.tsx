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
  Info,
  Scale,
  History,
  BookOpen
} from 'lucide-react';
import { Accordion } from '../common/Accordion.js';

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

  const historicalConflictEvents = [
    {
      id: 'hc-1',
      date: 'Day 10 (3 days ago)',
      conflictType: 'Compressed Time Window',
      goal: 'Weekly Aerobic Threshold',
      triggerCondition: 'Available time: 20 min (Target: 45 min)',
      resolutionExecuted: 'Down-regulated to 20m high-density kettlebell circuit; shifted aerobic volume to Saturday.',
      outcomeStatus: 'Completed successfully (100% adherence, RPE 6)',
      preservationImpact: 'Preserved daily streak and protected cardiovascular stimulus without overreaching.'
    },
    {
      id: 'hc-2',
      date: 'Day 4 (9 days ago)',
      conflictType: 'Acute Sleep Deficit',
      goal: 'Progressive Strength Overload',
      triggerCondition: 'Sleep: 5.2h, Fatigue: 8/10',
      resolutionExecuted: 'Substituted heavy squat session with 25m restorative mobility and diaphragmatic decompression.',
      outcomeStatus: 'Completed (RPE 3, recovery bounce-back +18%)',
      preservationImpact: 'Prevented acute soft-tissue injury risk; strength session deferred to Day 6 with zero progress loss.'
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

      {/* 1. ACTIVE CONFLICTS (HIGHLIGHTED CLEARLY) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              1. Active Conflicts
            </h3>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
            conflict?.hasConflict
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {conflict?.hasConflict ? `Active Conflict: Severity ${conflict.severity}` : 'Zero Acute Conflicts'}
          </span>
        </div>

        {conflict?.hasConflict ? (
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 shrink-0 mt-0.5">
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-amber-200">
                      Active Conflict: {conflict.goalName}
                    </h4>
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
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold transition-colors shrink-0"
              >
                <span>View Today's Adapted Decision</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="bg-[#0F0F11] rounded-xl p-4 border border-amber-500/20 space-y-1">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Acute Trigger Condition
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {conflict.conditionDescription || 'Fatigue or time constraints exceed standard capacity threshold.'}
                </p>
              </div>
              <div className="bg-[#0F0F11] rounded-xl p-4 border border-amber-500/20 space-y-1">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Scheduled Long-Term Ambition
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Scheduled high-strain session conflicts with recovery readiness.
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
              <h4 className="text-sm font-bold text-emerald-300">No Acute Conflicts Active</h4>
              <p className="text-xs text-emerald-200/80 mt-0.5 leading-relaxed">
                Your physiological status aligns smoothly with your programmed goals. No emergency adaptations are required.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. SUGGESTED RESOLUTIONS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              2. Suggested Resolutions
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Automated Adaptation Engine
          </span>
        </div>

        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          {conflict?.hasConflict ? (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    Primary Recommended Resolution
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    Preserves Momentum
                  </span>
                </div>
                <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                  {conflict.recommendedResolution}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Action Step 1</span>
                  <p className="text-xs text-slate-200">Throttle session intensity to restorative or Zone 2 threshold</p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Action Step 2</span>
                  <p className="text-xs text-slate-200">Compress duration to fit available time window ({context?.availableMinutes || 30}m)</p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Action Step 3</span>
                  <p className="text-xs text-slate-200">Shift peak anaerobic or progressive volume 48 hours forward</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <p className="font-medium text-slate-300">Default Resolution Policy Active:</p>
              <p className="leading-relaxed">
                When conflicts arise, HealthPilot automatically applies conservative down-regulation: throttling intensity,
                preserving total weekly load through schedule rebalancing, and avoiding workout abandonment.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. TRADE-OFF ANALYSIS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              3. Trade-off Analysis
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Acute Relief vs. Chronic Trajectory
          </span>
        </div>

        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                Short-Term Physiological Relief
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Adapting today's session down reduces acute sympathetic stress, prevents injury under sleep deficit,
                and mitigates non-functional overreaching.
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Adherence Probability:</span>
                <span className="text-emerald-400 font-bold">+28% gain vs forced heavy workout</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Long-Term Goal Preservation
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Primary adaptation rule: Long-term targets are never discarded or deleted. Key training stimuli are shifted
                within a 72-hour weekly buffer to maintain chronic adaptation velocity.
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Target Retention:</span>
                <span className="text-indigo-400 font-bold">100% Chronic Target Preserved</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900/40 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300 font-semibold">Scientific Rationale: </strong>
            Pushing high intensity through acute exhaustion impairs neuromuscular recruitment and elevates cortisol.
            Intelligent substitution keeps behavioral adherence continuous while honoring biological recovery limits.
          </div>
        </div>
      </div>

      {/* 4. CONFLICT HISTORY & SYSTEM RULES (COLLAPSIBLE / SECONDARY) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <History className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            4. Conflict History & Rules Matrix
          </h3>
        </div>

        <Accordion
          allowMultiple
          items={[
            {
              id: 'conflict-history',
              title: 'Conflict History & Past Resolutions',
              subtitle: 'Log of recent acute trade-offs and applied adaptations',
              badge: `${historicalConflictEvents.length} Recorded`,
              content: (
                <div className="space-y-3">
                  {historicalConflictEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3.5 rounded-lg bg-slate-900/50 border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{evt.conflictType}</span>
                          <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                            {evt.date}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-400">
                          {evt.goal}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400">
                        <div>
                          <strong className="text-slate-300">Trigger:</strong> {evt.triggerCondition}
                        </div>
                        <div>
                          <strong className="text-slate-300">Resolution:</strong> {evt.resolutionExecuted}
                        </div>
                      </div>
                      <div className="pt-1.5 border-t border-slate-800 text-[11px] text-slate-400">
                        <span className="text-emerald-300 font-medium">Impact:</span> {evt.preservationImpact}
                      </div>
                    </div>
                  ))}
                </div>
              )
            },
            {
              id: 'system-rules',
              title: 'System Decision Adaptation Rules Matrix',
              subtitle: 'Deterministic constraints balancing long-term ambitions with daily recovery',
              badge: '3 Core Rules',
              content: (
                <div className="space-y-3">
                  {conflictRules.map((rule, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/60 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{rule.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                          Rule #{idx + 1}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase">Trigger Condition</span>
                          <p className="text-slate-300 font-medium">{rule.condition}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase">Original Ambition</span>
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
              )
            }
          ]}
        />
      </div>
    </div>
  );
};
