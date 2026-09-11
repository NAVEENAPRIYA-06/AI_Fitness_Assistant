import React, { useState } from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import {
  History,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Filter,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { MetricBadge } from '../common/MetricBadge.js';
import { Accordion } from '../common/Accordion.js';

export const RecommendationHistoryView: React.FC = () => {
  const { recommendationHistory, recommendation, setActiveModule } = useHealthPilot();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Format backend history items or provide illustrative seeds if first launch
  const items = recommendationHistory.length > 0
    ? recommendationHistory.map(hist => {
        const rec = hist.recommendationSnapshot;
        const ctx = hist.contextSnapshot;
        const outcome = hist.outcomeLogged;

        let statusText = 'Decision Issued (Awaiting Outcome)';
        let statusBadgeVariant: 'emerald' | 'amber' | 'rose' | 'slate' = 'slate';

        if (outcome) {
          if (outcome.status === 'completed') {
            statusText = `Completed (${outcome.actualDurationMinutes || rec.durationMinutes}m)`;
            statusBadgeVariant = 'emerald';
          } else if (outcome.status === 'partially_completed') {
            statusText = `Partially Completed (${outcome.actualDurationMinutes || 15}m - ${outcome.reasonForSkipOrPartial?.replace('_', ' ') || 'altered'})`;
            statusBadgeVariant = 'amber';
          } else {
            statusText = `Skipped (${outcome.reasonForSkipOrPartial?.replace('_', ' ') || 'rest taken'})`;
            statusBadgeVariant = 'rose';
          }
        }

        const dateStr = new Date(hist.timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        return {
          id: hist.id,
          date: dateStr,
          title: rec.title,
          category: rec.category,
          durationMinutes: rec.durationMinutes,
          intensity: rec.intensity,
          environment: rec.environment,
          finalScore: rec.finalDecisionScore || 88,
          predictedAdherence: rec.predictedAdherence,
          suitability: rec.suitabilityScore ?? rec.healthSuitabilityScore,
          goalAlignment: rec.goalAlignmentScore || 85,
          feasibility: rec.contextFeasibilityScore || 90,
          behavioralFit: rec.behavioralFitScore || 75,
          status: statusText,
          statusVariant: statusBadgeVariant,
          context: `Sleep ${ctx.sleepHours.toFixed(1)}h • Fatigue ${ctx.fatigueLevel}/10 • Energy ${ctx.energyLevel}/10 • ${ctx.availableMinutes}m Available`,
          rationale: rec.whyRecommended,
          keyFactors: rec.explanation?.keyFactors || []
        };
      })
    : [
        {
          id: 'seed-rec-1',
          date: 'Today, 7:15 AM',
          title: recommendation?.title || 'Restorative Thoracic Mobility & Deep Decompression',
          category: recommendation?.category || 'mobility',
          durationMinutes: recommendation?.durationMinutes || 20,
          intensity: recommendation?.intensity || 'low',
          environment: recommendation?.environment || 'home',
          finalScore: recommendation?.finalDecisionScore || 89.2,
          predictedAdherence: recommendation?.predictedAdherence || 88,
          suitability: recommendation?.healthSuitabilityScore || 94,
          goalAlignment: 85,
          feasibility: 95,
          behavioralFit: 78,
          status: 'Decision Issued (Awaiting Outcome)',
          statusVariant: 'slate' as const,
          context: 'Sleep 5.8h • Fatigue 7/10 • Energy 4/10 • 30m Available',
          rationale: recommendation?.whyRecommended || 'Severe sleep deficit + high fatigue triggered down-regulation from planned HIIT.',
          keyFactors: [
            'Sleep duration is 5.8h (sleep deficit), down-regulating high cardiac stress',
            'Current fatigue is 7/10 with high autonomic recovery demand',
            'Predicted adherence for 20m restorative session is 88%'
          ]
        },
        {
          id: 'seed-rec-2',
          date: 'Yesterday, 6:45 AM',
          title: 'Full Body Functional Strength Tempo',
          category: 'strength',
          durationMinutes: 30,
          intensity: 'moderate',
          environment: 'home',
          finalScore: 84.5,
          predictedAdherence: 82,
          suitability: 85,
          goalAlignment: 88,
          feasibility: 90,
          behavioralFit: 80,
          status: 'Completed (30m)',
          statusVariant: 'emerald' as const,
          context: 'Sleep 7.1h • Fatigue 4/10 • Energy 7/10 • 40m Available',
          rationale: 'Good recovery score enabled progressive dumbbell resistance tempo.',
          keyFactors: [
            'Recovery readiness is 72/100, allowing moderate mechanical resistance',
            'Home dumbbell setting fits available 40m window'
          ]
        },
        {
          id: 'seed-rec-3',
          date: '2 Days Ago, 7:00 AM',
          title: 'Aerobic Zone 2 Baseline Jog',
          category: 'cardio',
          durationMinutes: 35,
          intensity: 'moderate',
          environment: 'outdoor',
          finalScore: 80.8,
          predictedAdherence: 78,
          suitability: 80,
          goalAlignment: 92,
          feasibility: 85,
          behavioralFit: 75,
          status: 'Completed (35m)',
          statusVariant: 'emerald' as const,
          context: 'Sleep 7.5h • Fatigue 3/10 • Energy 8/10 • 50m Available',
          rationale: 'Cardiovascular aerobic base development for 10K running endurance.',
          keyFactors: [
            'Aligns directly with 10K endurance goal',
            'Sleep and energy were optimal for aerobic volume'
          ]
        },
        {
          id: 'seed-rec-4',
          date: '3 Days Ago, 6:30 AM',
          title: 'Max Effort Upper Body Hypertrophy',
          category: 'strength',
          durationMinutes: 45,
          intensity: 'high',
          environment: 'gym',
          finalScore: 68.2,
          predictedAdherence: 52,
          suitability: 60,
          goalAlignment: 75,
          feasibility: 65,
          behavioralFit: 55,
          status: 'Partially Completed (20m - No Time)',
          statusVariant: 'amber' as const,
          context: 'Sleep 6.2h • Fatigue 6/10 • Energy 5/10 • 25m Available',
          rationale: 'High time compression led to early truncation; system adjusted subsequent rest.',
          keyFactors: [
            'Available window (25m) was lower than session duration (45m)',
            'Triggered post-session recovery buffer for next cycle'
          ]
        }
      ];

  const filteredItems = items.filter(item => {
    if (filterStatus === 'completed') return item.status.includes('Completed') && !item.status.includes('Partially');
    if (filterStatus === 'partial_or_skipped') return item.status.includes('Partially') || item.status.includes('Skipped');
    if (filterStatus === 'pending') return item.status.includes('Awaiting');
    return true;
  });

  const completedCount = items.filter(i => i.status.includes('Completed') && !i.status.includes('Partially')).length;
  const partialOrSkippedCount = items.filter(i => i.status.includes('Partially') || i.status.includes('Skipped')).length;
  const pendingCount = items.filter(i => i.status.includes('Awaiting')).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-emerald-400" />
              Auditable Timeline
            </span>
            <span className="text-xs text-slate-500 font-mono">Decision Intelligence Ledger</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Recommendation Audit History
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed mt-1">
            Full audit trail of all generated decisions, the exact physiological context when issued,
            multi-factor score calculations, and user execution outcomes.
          </p>
        </div>

        {/* Filter Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-1.5 text-white focus:outline-hidden"
          >
            <option value="all">All Decisions ({items.length})</option>
            <option value="completed">Completed Sessions ({completedCount})</option>
            <option value="partial_or_skipped">Partial / Skipped ({partialOrSkippedCount})</option>
            <option value="pending">Awaiting Execution ({pendingCount})</option>
          </select>
        </div>
      </div>

      {/* 1. OVERVIEW STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Decisions</span>
          <span className="text-2xl font-bold font-mono text-white">{items.length}</span>
          <p className="text-[11px] text-slate-500">Issued by Engine</p>
        </div>
        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Completed</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">{completedCount}</span>
          <p className="text-[11px] text-slate-500">{Math.round((completedCount / (items.length || 1)) * 100)}% Execution</p>
        </div>
        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Partial / Skipped</span>
          <span className="text-2xl font-bold font-mono text-amber-400">{partialOrSkippedCount}</span>
          <p className="text-[11px] text-slate-500">Adapted in Microcycle</p>
        </div>
        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-4 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Awaiting</span>
          <span className="text-2xl font-bold font-mono text-slate-300">{pendingCount}</span>
          <p className="text-[11px] text-slate-500">Pending Feedback</p>
        </div>
      </div>

      {/* 2. DECISION AUDIT TIMELINE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              2. Historical Decisions Ledger
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {filteredItems.length} Entries
          </span>
        </div>

        <div className="space-y-3.5">
          {filteredItems.map(item => {
            const isExpanded = !!expandedIds[item.id];

            return (
              <div
                key={item.id}
                className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 shadow-xs space-y-3.5 hover:border-slate-700 transition-colors"
              >
                {/* Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-white">{item.title}</h4>
                      <MetricBadge
                        label={`${item.durationMinutes}M`}
                        variant="slate"
                        size="sm"
                        icon={<Clock className="w-3 h-3" />}
                      />
                      <MetricBadge
                        label={item.intensity.toUpperCase()}
                        variant={item.intensity === 'low' ? 'emerald' : item.intensity === 'moderate' ? 'amber' : 'rose'}
                        size="sm"
                      />
                      <MetricBadge label={item.environment.toUpperCase()} variant="teal" size="sm" />
                    </div>
                    <span className="text-xs text-slate-500 font-mono mt-1 block">{item.date}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:text-right">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                      Score: {item.finalScore} / 100
                    </span>
                    <MetricBadge label={item.status} variant={item.statusVariant} size="sm" />
                  </div>
                </div>

                {/* 5 Scoring Factors Mini Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Suitability</span>
                    <span className="text-sm font-mono font-bold text-teal-300">{item.suitability}%</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Adherence</span>
                    <span className="text-sm font-mono font-bold text-emerald-400">{item.predictedAdherence}%</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Goal Fit</span>
                    <span className="text-sm font-mono font-bold text-cyan-400">{item.goalAlignment}%</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Feasibility</span>
                    <span className="text-sm font-mono font-bold text-indigo-400">{item.feasibility}%</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Behavioral Fit</span>
                    <span className="text-sm font-mono font-bold text-purple-400">{item.behavioralFit}%</span>
                  </div>
                </div>

                {/* Context & Rationale */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Context Snapshot</span>
                    <p className="text-slate-300 font-medium">{item.context}</p>
                  </div>

                  <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Decision Logic & Synthesis</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{item.rationale}</p>
                  </div>
                </div>

                {/* Contributing Factors (Expandable) */}
                {item.keyFactors.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-semibold"
                    >
                      <span>{isExpanded ? 'Hide Contributing Factors' : `View ${item.keyFactors.length} Contributing Decision Factors`}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                {isExpanded && item.keyFactors.length > 0 && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Contributing Decision Factors:
                    </span>
                    <div className="space-y-1">
                      {item.keyFactors.map((kf, ki) => (
                        <div key={ki} className="text-slate-300 text-[11px] flex items-start gap-1.5">
                          <span className="text-emerald-400">•</span>
                          <span>{kf}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-8 text-center space-y-2">
              <p className="text-sm text-slate-400">No recommendation audit logs match the current filter.</p>
              <button
                onClick={() => setFilterStatus('all')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
