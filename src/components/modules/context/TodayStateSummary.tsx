import React from 'react';
import { DailyContext, EvolvingUserState, GoalStrategyItem } from '../../../types/index.js';
import {
  ShieldAlert,
  Zap,
  BatteryCharging,
  Flame,
  Clock,
  Home,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface TodayStateSummaryProps {
  context: DailyContext;
  evolvingState: EvolvingUserState;
  goals?: GoalStrategyItem[];
  onNavigateToModule?: (module: string) => void;
}

export const TodayStateSummary: React.FC<TodayStateSummaryProps> = ({
  context,
  evolvingState,
  goals = [],
  onNavigateToModule
}) => {
  // Derive qualitative levels with fallbacks
  const recoveryScore = context.recoveryScore ?? evolvingState.recoveryReadiness ?? 50;
  const recoveryStatus = context.recoveryStatus ?? (recoveryScore >= 70 ? 'good' : recoveryScore < 48 ? 'low' : 'moderate');

  const energyLevel = context.energyLevel ?? context.energy ?? 5;
  const energyStatus: 'high' | 'moderate' | 'low' = energyLevel >= 7 ? 'high' : energyLevel <= 4 ? 'low' : 'moderate';

  const fatigueLevel = context.fatigueLevel ?? context.fatigue ?? 5;
  const fatigueStatus: 'high' | 'moderate' | 'low' = fatigueLevel >= 7 ? 'high' : fatigueLevel <= 3 ? 'low' : 'moderate';

  const stressLevel = context.stressLevel ?? context.stress ?? 5;
  const stressStatus: 'high' | 'moderate' | 'low' = stressLevel >= 7 ? 'high' : stressLevel <= 3 ? 'low' : 'moderate';

  // Check goal-condition conflict
  const primaryGoal = goals.find(g => g.priority === 'primary') || goals[0];
  const hasConflict = (recoveryScore < 50 || fatigueLevel >= 7) && primaryGoal?.category === 'endurance';

  const recoveryColor =
    recoveryStatus === 'good'
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      : recoveryStatus === 'low'
      ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
      : 'text-amber-400 bg-amber-500/10 border-amber-500/30';

  const energyColor =
    energyStatus === 'high'
      ? 'text-emerald-400'
      : energyStatus === 'low'
      ? 'text-rose-400'
      : 'text-amber-400';

  const fatigueColor =
    fatigueStatus === 'high'
      ? 'text-rose-400'
      : fatigueStatus === 'low'
      ? 'text-emerald-400'
      : 'text-amber-400';

  const stressColor =
    stressStatus === 'high'
      ? 'text-rose-400'
      : stressStatus === 'low'
      ? 'text-emerald-400'
      : 'text-amber-400';

  // Explanation string
  const explanation =
    evolvingState.stateExplanation ||
    `Sleep duration of ${context.sleepHours.toFixed(1)}h with ${energyStatus} energy (${energyLevel}/10) and ${fatigueStatus} fatigue (${fatigueLevel}/10) yields an autonomic recovery readiness estimate of ${recoveryScore}%. ${
      recoveryStatus === 'low'
        ? 'Restorative pacing and down-regulation are indicated to prevent systemic overreaching.'
        : recoveryStatus === 'good'
        ? 'Physiological conditions are primed for progressive stimulus.'
        : 'Moderate capacity permits steady-state habit execution.'
    }`;

  return (
    <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
      {/* Title Bar with System Estimate Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Today's State Synthesis</h3>
            <p className="text-[11px] text-slate-400">Application-level multi-domain user state derived from current context</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/60 text-[10px] text-slate-400 font-mono">
          <Info className="w-3 h-3 text-slate-400" />
          <span>System estimate — not a medical diagnosis</span>
        </div>
      </div>

      {/* 6 Core Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Recovery */}
        <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Recovery</span>
          <div className="my-1">
            <span className="text-lg font-mono font-bold text-white">{recoveryScore}%</span>
          </div>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block text-center uppercase ${recoveryColor}`}>
            {recoveryStatus}
          </span>
        </div>

        {/* Energy */}
        <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Energy</span>
          </span>
          <div className="my-1">
            <span className={`text-lg font-mono font-bold ${energyColor}`}>{energyLevel}/10</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 capitalize">
            {energyStatus} Energy
          </span>
        </div>

        {/* Fatigue */}
        <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <BatteryCharging className="w-3 h-3 text-rose-400" />
            <span>Fatigue</span>
          </span>
          <div className="my-1">
            <span className={`text-lg font-mono font-bold ${fatigueColor}`}>{fatigueLevel}/10</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 capitalize">
            {fatigueStatus} Fatigue
          </span>
        </div>

        {/* Stress */}
        <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-400" />
            <span>Stress</span>
          </span>
          <div className="my-1">
            <span className={`text-lg font-mono font-bold ${stressColor}`}>{stressLevel}/10</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 capitalize">
            {stressStatus} Stress
          </span>
        </div>

        {/* Available Time */}
        <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-teal-400" />
            <span>Available</span>
          </span>
          <div className="my-1">
            <span className="text-lg font-mono font-bold text-white">{context.availableMinutes} min</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 capitalize">
            {context.preferredTime || 'Morning'}
          </span>
        </div>

        {/* Environment */}
        <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Home className="w-3 h-3 text-emerald-400" />
            <span>Setting</span>
          </span>
          <div className="my-1">
            <span className="text-sm font-bold text-white capitalize truncate">{context.environment}</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 truncate">
            {(context.equipmentAvailable || []).length} items
          </span>
        </div>
      </div>

      {/* State Explanation Text */}
      <div className="p-3.5 bg-slate-900/60 rounded-lg border border-slate-800/80 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Derived Assessment: </span>
          <span>{explanation}</span>
        </div>
      </div>

      {/* Goal-Condition Awareness Connection */}
      {hasConflict && primaryGoal && (
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg p-3.5 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-300">Goal-Condition Conflict Alert</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-semibold">
                  Detected
                </span>
              </div>
              <p className="text-amber-200/90 text-[11px] leading-relaxed">
                Active Goal: <strong>{primaryGoal.title}</strong> ({primaryGoal.category.toUpperCase()}).
                Current state indicates low recovery ({recoveryScore}%) and elevated fatigue ({fatigueLevel}/10).
                Executing scheduled high-intensity cardiovascular work today poses elevated non-adherence and injury risk.
              </p>
            </div>
          </div>
          {onNavigateToModule && (
            <button
              onClick={() => onNavigateToModule('conflicts')}
              className="shrink-0 px-2.5 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
            >
              <span>View Conflict</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
