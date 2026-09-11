import React, { useState } from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import {
  History,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  Sparkles,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { formatUserFriendlyDate } from '../../utils/dateUtils.js';

export const RecommendationHistoryView: React.FC = () => {
  const { recommendationHistory, recommendation, setActiveModule } = useHealthPilot();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const items = recommendationHistory.length > 0
    ? recommendationHistory.map(hist => {
        const rec = (hist as any).recommendationSnapshot || hist;
        const ctx = hist.contextSnapshot;
        const outcome = (hist as any).outcomeLogged || (hist as any).outcome;

        let statusText = 'Decision Issued';
        let statusType: 'completed' | 'partial' | 'skipped' | 'pending' = 'pending';

        if (outcome && typeof outcome === 'object') {
          const outcomeStatus = (outcome as any).status || (outcome as any).outcomeStatus;
          if (outcomeStatus === 'completed') {
            statusText = `Completed (${(outcome as any).actualDurationMinutes || rec.durationMinutes || 30}m)`;
            statusType = 'completed';
          } else if (outcomeStatus === 'partially_completed') {
            statusText = `Partially Completed (${(outcome as any).actualDurationMinutes || 15}m)`;
            statusType = 'partial';
          } else {
            statusText = 'Skipped';
            statusType = 'skipped';
          }
        }

        const dateStr = formatUserFriendlyDate(hist.timestamp || (hist as any).date, {
          includeWeekday: true,
          includeTime: false
        });

        return {
          id: hist.id,
          date: dateStr,
          title: rec.title,
          category: rec.category,
          durationMinutes: rec.durationMinutes,
          intensity: rec.intensity,
          environment: rec.environment,
          predictedAdherence: rec.predictedAdherence || 85,
          statusText,
          statusType,
          context: `Sleep: ${ctx?.sleepHours ? ctx.sleepHours.toFixed(1) : '7.0'}h • Energy: ${ctx?.energyLevel || 6}/10 • Fatigue: ${ctx?.fatigueLevel || 4}/10`,
          rationale: rec.whyRecommended || 'Calibrated to daily recovery readiness and primary training goal.',
          keyFactors: rec.explanation?.keyFactors || []
        };
      })
    : [
        {
          id: 'seed-rec-1',
          date: formatUserFriendlyDate(new Date(), { includeWeekday: true, includeTime: false }),
          title: recommendation?.title || 'Restorative Mobility & Deep Decompression',
          category: recommendation?.category || 'mobility',
          durationMinutes: recommendation?.durationMinutes || 20,
          intensity: recommendation?.intensity || 'low',
          environment: recommendation?.environment || 'home',
          predictedAdherence: recommendation?.predictedAdherence || 88,
          statusText: 'Today’s Recommendation',
          statusType: 'pending' as const,
          context: 'Sleep: 6.2h • Energy: 5/10 • Fatigue: 6/10',
          rationale: recommendation?.whyRecommended || 'Down-regulated from planned heavy lifting to protect recovery and keep habit momentum.',
          keyFactors: [
            'Sleep duration below target, prioritizing restorative movement',
            'Fits comfortably in your home workout setting'
          ]
        },
        {
          id: 'seed-rec-2',
          date: formatUserFriendlyDate(new Date(Date.now() - 86400000), { includeWeekday: true, includeTime: false }),
          title: 'Full Body Functional Strength Tempo',
          category: 'strength',
          durationMinutes: 30,
          intensity: 'moderate',
          environment: 'home',
          predictedAdherence: 82,
          statusText: 'Completed (30m)',
          statusType: 'completed' as const,
          context: 'Sleep: 7.4h • Energy: 7/10 • Fatigue: 3/10',
          rationale: 'High recovery readiness supported progressive dumbbell strength session.',
          keyFactors: ['Optimal autonomic readiness allowed full progressive overload']
        },
        {
          id: 'seed-rec-3',
          date: formatUserFriendlyDate(new Date(Date.now() - 86400000 * 2), { includeWeekday: true, includeTime: false }),
          title: 'Aerobic Zone 2 Baseline Jog',
          category: 'cardio',
          durationMinutes: 35,
          intensity: 'moderate',
          environment: 'outdoor',
          predictedAdherence: 78,
          statusText: 'Completed (35m)',
          statusType: 'completed' as const,
          context: 'Sleep: 7.5h • Energy: 8/10 • Fatigue: 3/10',
          rationale: 'Aerobic baseline development for cardiovascular endurance.',
          keyFactors: ['Cardio stimulus maintained at steady aerobic heart rate']
        }
      ];

  const filteredItems = items.filter(item => {
    if (filterStatus === 'completed') return item.statusType === 'completed';
    if (filterStatus === 'partial_or_skipped') return item.statusType === 'partial' || item.statusType === 'skipped';
    if (filterStatus === 'pending') return item.statusType === 'pending';
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Past Recommendations
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-normal">
            A transparent history of workouts recommended by HealthPilot and the recovery context behind each decision.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-soft)] rounded-2xl border border-[var(--border)] self-start sm:self-auto">
          {[
            { id: 'all', label: 'All Decisions' },
            { id: 'completed', label: 'Completed' },
            { id: 'partial_or_skipped', label: 'Modified' },
            { id: 'pending', label: 'Recent' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === f.id
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs border border-[var(--border)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* DECISIONS LIST */}
      <div className="space-y-4">
        {filteredItems.map(item => {
          const isExpanded = expandedIds[item.id];
          const isCompleted = item.statusType === 'completed';
          const isPartial = item.statusType === 'partial';
          const isSkipped = item.statusType === 'skipped';

          return (
            <div
              key={item.id}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 transition-all hover:border-[var(--primary)]/30"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                      {item.title}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isCompleted
                          ? 'bg-[var(--primary-soft)] text-[var(--primary)]'
                          : isPartial
                          ? 'bg-[var(--warning-soft)] text-[var(--warning)]'
                          : isSkipped
                          ? 'bg-[var(--danger-soft)] text-[var(--danger)]'
                          : 'bg-[var(--surface-soft)] text-[var(--text-secondary)] border border-[var(--border)]'
                      }`}
                    >
                      {item.statusText}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span>{item.date}</span>
                    <span>•</span>
                    <span>{item.durationMinutes} min</span>
                    <span>•</span>
                    <span className="capitalize">{item.intensity} intensity</span>
                    <span>•</span>
                    <span className="capitalize">{item.environment || 'Home'}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleExpand(item.id)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--surface-soft)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <span>{isExpanded ? 'Less' : 'Why this session'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--surface-soft)] text-xs text-[var(--text-secondary)] leading-relaxed">
                {item.rationale}
              </div>

              {isExpanded && (
                <div className="pt-2 border-t border-[var(--border)] space-y-3 text-xs text-[var(--text-secondary)] animate-in fade-in">
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <span className="font-semibold text-[var(--text-primary)]">Daily Context:</span>
                    <span>{item.context}</span>
                  </div>

                  {item.keyFactors && item.keyFactors.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="font-semibold text-[var(--text-primary)] block">Primary Decision Drivers:</span>
                      <ul className="space-y-1 pl-4 list-disc text-[var(--text-secondary)]">
                        {item.keyFactors.map((kf: string, kidx: number) => (
                          <li key={kidx}>{kf}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
