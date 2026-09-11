import React, { useState } from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import {
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Plus,
  Filter,
  Activity,
  Flame,
  Search,
  Sparkles,
  ChevronDown,
  Smile,
  Calendar
} from 'lucide-react';
import { formatUserFriendlyDate } from '../../utils/dateUtils.js';
import { SkipReason } from '../../types/index.js';

export const OutcomeJournalView: React.FC = () => {
  const {
    outcomes,
    submitOutcome,
    recommendation,
    context,
    evolvingState,
    setActiveModule
  } = useHealthPilot();

  const [showLogForm, setShowLogForm] = useState(false);
  const [outcomeStatus, setOutcomeStatus] = useState<'completed' | 'partially_completed' | 'skipped'>('completed');
  const [actualDuration, setActualDuration] = useState(recommendation?.durationMinutes || 25);
  const [skipReason, setSkipReason] = useState<SkipReason>('too_tired');
  const [feedback, setFeedback] = useState('');
  const [perceivedEffort, setPerceivedEffort] = useState(5);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'partially_completed' | 'skipped'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getEffortLabel = (effort: number) => {
    if (effort <= 2) return 'Very Light (Relaxing recovery)';
    if (effort <= 4) return 'Light to Moderate (Comfortable pace)';
    if (effort <= 6) return 'Moderate (Felt the workout)';
    if (effort <= 8) return 'Challenging (Strong effort)';
    return 'Maximum Exertion (Pushed limits)';
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
          sleepHours: context?.sleepHours || 7.0,
          energyLevel: context?.energyLevel || 6,
          fatigueLevel: context?.fatigueLevel || 4,
          stressLevel: context?.stressLevel || 4,
          availableMinutes: context?.availableMinutes || 30,
          environment: context?.environment || 'home'
        },
        outcomeStatus,
        actualDurationMinutes: outcomeStatus === 'skipped' ? 0 : actualDuration,
        reasonForSkipOrPartial: outcomeStatus !== 'completed' ? skipReason : undefined,
        userFeedback: feedback || (outcomeStatus === 'completed' ? 'Executed session as planned.' : 'Session modified.'),
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

  const filteredOutcomes = outcomes.filter(o => {
    if (filterStatus !== 'all' && o.outcomeStatus !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.recommendedActivity.toLowerCase().includes(q) ||
        (o.userFeedback && o.userFeedback.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalCompleted = outcomes.filter(o => o.outcomeStatus === 'completed').length;
  const completionRate = outcomes.length > 0 ? Math.round((totalCompleted / outcomes.length) * 100) : 100;

  return (
    <div className="space-y-8 max-w-5xl mx-auto transition-colors duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Activity Journal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            How did your activity go?
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-normal">
            Logging your workouts helps HealthPilot learn what fits your real life and refine future recommendations.
          </p>
        </div>

        <button
          onClick={() => setShowLogForm(!showLogForm)}
          className="px-5 py-2.5 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showLogForm ? 'Hide Form' : 'Log an Activity'}</span>
        </button>
      </div>

      {/* Quick Summary Pill Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">Logged Sessions</span>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{outcomes.length}</p>
          <p className="text-xs text-[var(--text-secondary)]">{totalCompleted} completed as planned</p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">Consistency Rate</span>
          <p className="text-2xl font-bold text-[var(--primary)]">{completionRate}%</p>
          <p className="text-xs text-[var(--text-secondary)]">Over recent recorded sessions</p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">Current Readiness</span>
          <p className="text-2xl font-bold text-[var(--primary)]">{evolvingState?.recoveryReadiness || 72}%</p>
          <p className="text-xs text-[var(--text-secondary)]">Calibrated from sleep & exertion logs</p>
        </div>
      </div>

      {/* Log Activity Inline Form */}
      {showLogForm && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 shadow-md space-y-5 animate-in fade-in">
          <div className="border-b border-[var(--border)] pb-3">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Record Activity Outcome
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Target: {recommendation?.title || "Today's Session"} ({recommendation?.durationMinutes || 25} min)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Status */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-primary)] block">
                Activity Result
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'completed', label: 'Completed as Planned' },
                  { id: 'partially_completed', label: 'Partially Completed' },
                  { id: 'skipped', label: 'Skipped Session' }
                ].map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setOutcomeStatus(s.id as any)}
                    className={`py-3 rounded-2xl text-xs font-bold transition-all text-center ${
                      outcomeStatus === s.id
                        ? 'bg-[var(--primary)] text-white shadow-xs'
                        : 'bg-[var(--surface-soft)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration if not skipped */}
            {outcomeStatus !== 'skipped' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--text-primary)]">Actual Minutes Active</span>
                  <span className="font-bold text-sm text-[var(--primary)]">{actualDuration} min</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={90}
                  step={5}
                  value={actualDuration}
                  onChange={(e) => setActualDuration(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
              </div>
            )}

            {/* Perceived Effort if completed */}
            {outcomeStatus === 'completed' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--text-primary)]">Perceived Effort (RPE)</span>
                  <span className="font-bold text-sm text-[var(--primary)]">{perceivedEffort} / 10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={perceivedEffort}
                  onChange={(e) => setPerceivedEffort(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
                <p className="text-[11px] text-[var(--text-muted)] font-medium">
                  {getEffortLabel(perceivedEffort)}
                </p>
              </div>
            )}

            {/* Reason if partial or skipped */}
            {outcomeStatus !== 'completed' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--text-primary)] block">
                  Friendly reason for modification:
                </label>
                <select
                  value={skipReason}
                  onChange={(e) => setSkipReason(e.target.value as SkipReason)}
                  className="w-full p-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                >
                  <option value="too_tired">Too tired / Low physical energy</option>
                  <option value="no_time">Ran out of time / Work or personal conflict</option>
                  <option value="low_motivation">Low motivation today</option>
                  <option value="soreness_pain">Muscle soreness or joint stiffness</option>
                  <option value="equipment_unavailable">Equipment or gym was not accessible</option>
                  <option value="illness">Under the weather / Feeling unwell</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-primary)] block">
                Session Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="How did the movement feel? Any tight muscles or great momentum?"
                className="w-full p-3 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save to Journal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History List Section */}
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search past activities..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-soft)] rounded-2xl border border-[var(--border)] self-start sm:self-auto">
            {(['all', 'completed', 'partially_completed', 'skipped'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  filterStatus === f
                    ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs border border-[var(--border)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {f === 'partially_completed' ? 'Partial' : f}
              </button>
            ))}
          </div>
        </div>

        {/* History Cards */}
        {filteredOutcomes.length === 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-10 text-center space-y-2">
            <p className="text-sm font-semibold text-[var(--text-primary)]">No activities found</p>
            <p className="text-xs text-[var(--text-muted)]">No logs match the current search or filter criteria.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOutcomes.map((item) => {
              const isCompleted = item.outcomeStatus === 'completed';
              const isPartial = item.outcomeStatus === 'partially_completed';
              const isSkipped = item.outcomeStatus === 'skipped';

              return (
                <div
                  key={item.id}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-5 sm:p-6 transition-all hover:border-[var(--primary)]/30 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isCompleted
                            ? 'bg-[var(--primary-soft)] text-[var(--primary)]'
                            : isPartial
                            ? 'bg-[var(--warning-soft)] text-[var(--warning)]'
                            : 'bg-[var(--danger-soft)] text-[var(--danger)]'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : isPartial ? (
                          <Clock className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-base font-bold text-[var(--text-primary)]">
                            {item.recommendedActivity}
                          </h4>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                              isCompleted
                                ? 'bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/20'
                                : isPartial
                                ? 'bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning)]/20'
                                : 'bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger)]/20'
                            }`}
                          >
                            {isCompleted ? 'Completed' : isPartial ? 'Partial' : 'Skipped'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                          <span>{formatUserFriendlyDate(item.timestamp || (item as any).date)}</span>
                          <span>•</span>
                          <span>{item.actualDurationMinutes} min active</span>
                          {item.perceivedEffort && (
                            <>
                              <span>•</span>
                              <span>Effort: {item.perceivedEffort}/10</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="capitalize">{item.intensity || 'moderate'} intensity</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feedback or Reason */}
                  {(item.userFeedback || item.reasonForSkipOrPartial) && (
                    <div className="p-3.5 rounded-2xl bg-[var(--surface-soft)] text-xs text-[var(--text-secondary)] leading-relaxed space-y-1">
                      {item.userFeedback && <p>{item.userFeedback}</p>}
                      {item.reasonForSkipOrPartial && (
                        <p className="text-[var(--text-muted)]">
                          <strong>Adjustment reason:</strong> {item.reasonForSkipOrPartial.replace(/_/g, ' ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
