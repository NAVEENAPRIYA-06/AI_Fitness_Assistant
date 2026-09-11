import React, { useState } from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  RotateCcw,
  Sliders,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Info,
  Calendar,
  Zap,
  Activity,
  Check
} from 'lucide-react';
import {
  isToday,
  isPast,
  isFuture,
  formatUserFriendlyDate,
  getDayOfWeekFromDate
} from '../../utils/dateUtils.js';

export const AdaptivePlanView: React.FC = () => {
  const {
    adaptivePlan,
    adaptivePlanPayload,
    isRebalancingPlan,
    rebalanceAdaptivePlan,
    resetAdaptivePlan,
    evolvingState,
    outcomes,
    setActiveModule
  } = useHealthPilot();

  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);

  const rawDays = adaptivePlanPayload?.days || adaptivePlan;
  const days = Array.isArray(rawDays) ? rawDays : [];
  const activeAdjustmentsCount = days.filter(d => d?.status === 'adapted' || d?.isAdaptiveAdapted).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold mb-2">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Weekly Schedule</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Your Adaptive Week
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-normal max-w-2xl">
            Your plan adjusts as your schedule, recovery, goals and activity patterns change.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={resetAdaptivePlan}
            disabled={isRebalancingPlan}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-soft)] hover:bg-[var(--surface)] border border-[var(--border)] transition-all disabled:opacity-50 flex items-center gap-1.5"
            title="Reset to original baseline template"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>Reset Baseline</span>
          </button>

          <button
            onClick={rebalanceAdaptivePlan}
            disabled={isRebalancingPlan}
            className="px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRebalancingPlan ? 'animate-spin' : ''}`} />
            <span>{isRebalancingPlan ? 'Recalibrating...' : 'Rebalance Plan'}</span>
          </button>
        </div>
      </div>

      {/* Adjustments Status Banner */}
      {activeAdjustmentsCount > 0 ? (
        <div className="bg-[var(--warning-soft)] border border-[var(--warning)]/30 rounded-3xl p-5 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-2xl bg-[var(--warning)]/20 text-[var(--warning)] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              {activeAdjustmentsCount} Session {activeAdjustmentsCount === 1 ? 'has been adjusted' : 'have been adjusted'} for you
            </h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              HealthPilot adjusted these workouts to match your recent sleep and recovery levels while keeping your weekly habit momentum steady.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-5 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              Plan on Track
            </h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Your workouts are calibrated to your current recovery baseline. If your fatigue or schedule changes, your plan will dynamically adapt.
            </p>
          </div>
        </div>
      )}

      {/* 7-DAY MINI BAR OVERVIEW */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            7-Day Cycle Overview
          </h3>
          <span className="text-xs text-[var(--text-muted)]">
            Monday – Sunday
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2.5">
          {days.map((day, idx) => {
            const isDayToday = isToday(day.date);
            const isDayPast = isPast(day.date);
            const isAdapted = day?.status === 'adapted' || !!day?.isAdaptiveAdapted;
            const isCompleted = day?.status === 'completed';
            const dayOfWeekName = day?.dayOfWeek || getDayOfWeekFromDate(day.date);
            const shortDay = dayOfWeekName.slice(0, 3);
            const dayNum = day?.date?.split('-')[2] || String(idx + 1);

            return (
              <div
                key={day.id || idx}
                onClick={() => setExpandedDayId(expandedDayId === day.id ? null : day.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[105px] ${
                  isDayToday
                    ? 'bg-[var(--primary-soft)] border-[var(--primary)] shadow-sm ring-2 ring-[var(--primary)]/25'
                    : isAdapted
                    ? 'bg-[var(--warning-soft)] border-[var(--warning)]/40'
                    : isDayPast && isCompleted
                    ? 'bg-[var(--surface-soft)] border-[var(--primary)]/30 opacity-80'
                    : isDayPast
                    ? 'bg-[var(--surface-soft)] border-[var(--border-subtle)] opacity-60'
                    : 'bg-[var(--surface-soft)] border-[var(--border)] hover:border-[var(--primary)]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                    {shortDay}
                  </span>
                  <span className={`text-xs font-bold ${isDayToday ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>
                    {dayNum}
                  </span>
                </div>

                <div className="my-1">
                  <p className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">
                    {day?.plannedSession || day?.title || 'Rest Day'}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {day?.durationMinutes ? `${day.durationMinutes} min` : 'Recovery'}
                  </p>
                </div>

                <div>
                  {isDayToday ? (
                    <span className="inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[var(--primary)] text-white">
                      Today
                    </span>
                  ) : isAdapted ? (
                    <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-[var(--warning)]/20 text-[var(--warning)]">
                      Adjusted
                    </span>
                  ) : isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-[var(--primary)]">
                      <Check className="w-2.5 h-2.5" /> Done
                    </span>
                  ) : isDayPast ? (
                    <span className="text-[9px] text-[var(--text-muted)]">Past</span>
                  ) : (
                    <span className="text-[9px] text-[var(--text-muted)]">Upcoming</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED 7-DAY WORKOUT LIST */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
          Detailed Sessions
        </h3>

        <div className="space-y-3">
          {days.map((day, idx) => {
            const isDayToday = isToday(day.date);
            const isDayPast = isPast(day.date);
            const isDayFuture = isFuture(day.date);
            const isAdapted = day?.status === 'adapted' || !!day?.isAdaptiveAdapted;
            const isCompleted = day?.status === 'completed';
            const dayOfWeekName = day?.dayOfWeek || getDayOfWeekFromDate(day.date);
            const formattedDate = formatUserFriendlyDate(day.date);
            const isExpanded = expandedDayId === day.id;

            // Plain human explanation for adjusted sessions
            const plainExplanation = (day as any)?.adaptationRationale || day?.adaptationReason ||
              'Adjusted from baseline because you had lower sleep and reduced available time, keeping you active safely.';

            return (
              <div
                key={day.id || idx}
                className={`bg-[var(--surface)] border rounded-3xl p-5 sm:p-6 transition-all shadow-xs space-y-3 ${
                  isDayToday
                    ? 'border-[var(--primary)] bg-[var(--surface)] ring-2 ring-[var(--primary)]/20'
                    : isAdapted
                    ? 'border-[var(--warning)]/40 bg-[var(--surface)]'
                    : isDayPast && !isCompleted
                    ? 'border-[var(--border-subtle)] opacity-75'
                    : 'border-[var(--border)]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Day Badge */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 ${
                        isDayToday
                          ? 'bg-[var(--primary)] text-white font-bold shadow-xs'
                          : isCompleted
                          ? 'bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/30'
                          : isAdapted
                          ? 'bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning)]/30'
                          : isDayPast
                          ? 'bg-[var(--surface-soft)] text-[var(--text-muted)]'
                          : 'bg-[var(--surface-soft)] text-[var(--text-primary)] border border-[var(--border)]'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {dayOfWeekName.slice(0, 3)}
                      </span>
                      <span className="text-sm font-extrabold leading-none">
                        {day?.date?.split('-')[2] || String(idx + 1)}
                      </span>
                    </div>

                    {/* Title & Metadata */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-base font-bold text-[var(--text-primary)]">
                          {day?.plannedSession || day?.title || 'Rest & Active Recovery'}
                        </h4>

                        {isDayToday && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[var(--primary)] text-white text-[10px] font-extrabold uppercase tracking-wider">
                            Today
                          </span>
                        )}

                        {isAdapted && (
                          <button
                            onClick={() => setExpandedDayId(isExpanded ? null : day.id)}
                            className="px-2.5 py-0.5 rounded-full bg-[var(--warning-soft)] text-[var(--warning)] border border-[var(--warning)]/30 text-[10px] font-bold inline-flex items-center gap-1 hover:bg-[var(--warning-soft)]/80 transition-colors"
                          >
                            <span>Adjusted for you</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}

                        {isCompleted && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-[10px] font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Completed
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{day?.durationMinutes || 25} minutes</span>
                        </span>
                        <span>•</span>
                        <span className="capitalize">{day?.intensity || 'moderate'} intensity</span>
                        <span>•</span>
                        <span className="capitalize">{(day as any)?.environment || 'Home'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action */}
                  <div className="flex items-center gap-2 self-end sm:self-auto pt-2 sm:pt-0">
                    {isDayToday && (
                      <button
                        onClick={() => setActiveModule('today')}
                        className="px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <span>Start Today</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Plain-sentence Adjusted Explanation when clicked */}
                {isAdapted && isExpanded && (
                  <div className="p-4 rounded-2xl bg-[var(--warning-soft)] border border-[var(--warning)]/30 text-xs text-[var(--text-secondary)] space-y-1 animate-in fade-in">
                    <p className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--warning)]" />
                      <span>Why this was adjusted:</span>
                    </p>
                    <p className="leading-relaxed">
                      {plainExplanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
