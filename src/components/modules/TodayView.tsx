import React, { useState } from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  Home,
  CheckCircle2,
  Moon,
  Zap,
  Activity,
  Sliders,
  ChevronRight,
  ChevronDown,
  Calendar,
  Compass,
  ArrowRight,
  ShieldAlert,
  Battery,
  Coffee,
  Heart
} from 'lucide-react';
import {
  getWeekDates,
  isToday,
  isPast,
  isFuture,
  formatUserFriendlyDate
} from '../../utils/dateUtils.js';

export const TodayView: React.FC = () => {
  const {
    recommendation,
    context,
    evolvingState,
    behaviorSummary,
    currentUser,
    profile,
    adaptivePlan,
    setActiveModule,
    submitOutcome
  } = useHealthPilot();

  const [logModalOpen, setLogModalOpen] = useState(false);
  const [alternativesOpen, setAlternativesOpen] = useState(false);
  const [showWhyDetails, setShowWhyDetails] = useState(false);

  // Outcome submission form states
  const [outcomeStatus, setOutcomeStatus] = useState<'completed' | 'partially_completed' | 'skipped'>('completed');
  const [actualDuration, setActualDuration] = useState(recommendation?.durationMinutes || 20);
  const [skipReason, setSkipReason] = useState<any>('too_tired');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!recommendation || !context || !evolvingState) {
    return (
      <div className="p-12 flex items-center justify-center min-h-[420px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[var(--text-secondary)] font-medium">Personalizing today's fitness recommendation...</p>
        </div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = currentUser?.name?.split(' ')[0] || profile?.name?.split(' ')[0] || 'Friend';
  const recoveryScore = context.recoveryScore ?? evolvingState.recoveryReadiness ?? 72;

  const handleRecordOutcomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitOutcome({
        recommendationId: recommendation.id,
        recommendedActivity: recommendation.title,
        category: recommendation.category,
        plannedDurationMinutes: recommendation.durationMinutes,
        intensity: recommendation.intensity,
        contextSnapshot: {
          sleepHours: context.sleepHours,
          energyLevel: context.energyLevel,
          fatigueLevel: context.fatigueLevel,
          stressLevel: context.stressLevel,
          availableMinutes: context.availableMinutes,
          environment: context.environment
        },
        outcomeStatus,
        actualDurationMinutes: actualDuration,
        reasonForSkipOrPartial: outcomeStatus !== 'completed' ? skipReason : undefined,
        userFeedback: feedback || (outcomeStatus === 'completed' ? 'Executed session as planned.' : 'Session modified.'),
        perceivedEffort: outcomeStatus === 'completed' ? 5 : undefined
      });
      setLogModalOpen(false);
      setFeedback('');
    } catch (err) {
      console.error('Error submitting outcome:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Why this fits you bullets (human-friendly, non-technical)
  const fitReasons = [
    {
      title: 'Protects Recovery',
      desc: recoveryScore >= 70
        ? `Your recovery readiness is optimal (${recoveryScore}%), primed for active conditioning.`
        : `Your recovery readiness is measured at ${recoveryScore}%, so this session avoids excessive central fatigue.`
    },
    {
      title: 'Fits Your Schedule',
      desc: `Calibrated to your available ${context.availableMinutes} minutes at ${context.environment || 'home'}.`
    },
    {
      title: 'Matches Your Energy',
      desc: `Suited for today's ${context.energyLevel >= 7 ? 'high' : context.energyLevel <= 4 ? 'lower' : 'moderate'} energy level (${context.energyLevel}/10).`
    },
    {
      title: 'Advances Your Goal',
      desc: `Supports your focus on ${profile?.primaryGoal || 'healthy cardiovascular & strength progression'}.`
    }
  ];

  const weekDates = getWeekDates(new Date());

  return (
    <div className="space-y-8 max-w-5xl mx-auto transition-colors duration-200">
      {/* 1. GREETING */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Today's Recommendation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            {getGreeting()}, {userName}
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-normal">
            Here's what fits you today.
          </p>
        </div>

        {/* Quick Actions Header Pills */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setActiveModule('context')}
            className="px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-soft)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>Check In</span>
          </button>
          <button
            onClick={() => setLogModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Log Activity</span>
          </button>
        </div>
      </div>

      {/* 2. CURRENT STATE (5 Clean Compact Cards) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Your Readiness Today
          </h2>
          <button
            onClick={() => setActiveModule('context')}
            className="text-xs text-[var(--primary)] hover:underline font-semibold flex items-center gap-1"
          >
            <span>Update context</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Recovery */}
          <div className="p-4 bg-[var(--surface)] rounded-2xl border border-[var(--border)] space-y-1.5 shadow-xs hover:border-[var(--primary)]/40 transition-all">
            <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs">
              <span className="font-semibold">Recovery</span>
              <Activity className="w-3.5 h-3.5 text-[var(--primary)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              {recoveryScore}%
            </div>
            <div className="text-xs font-medium text-[var(--primary)]">
              {recoveryScore >= 75 ? 'Optimal' : recoveryScore >= 55 ? 'Moderate' : 'Needs Care'}
            </div>
          </div>

          {/* Energy */}
          <div className="p-4 bg-[var(--surface)] rounded-2xl border border-[var(--border)] space-y-1.5 shadow-xs hover:border-[var(--warning)]/40 transition-all">
            <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs">
              <span className="font-semibold">Energy</span>
              <Zap className="w-3.5 h-3.5 text-[var(--warning)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              {context.energyLevel} <span className="text-xs font-normal text-[var(--text-muted)]">/ 10</span>
            </div>
            <div className={`text-xs font-medium ${context.energyLevel >= 7 ? 'text-[var(--primary)]' : context.energyLevel <= 4 ? 'text-[var(--danger)]' : 'text-[var(--warning)]'}`}>
              {context.energyLevel >= 7 ? 'High Energy' : context.energyLevel <= 4 ? 'Low Energy' : 'Balanced'}
            </div>
          </div>

          {/* Fatigue */}
          <div className="p-4 bg-[var(--surface)] rounded-2xl border border-[var(--border)] space-y-1.5 shadow-xs hover:border-[var(--danger)]/40 transition-all">
            <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs">
              <span className="font-semibold">Fatigue</span>
              <Battery className="w-3.5 h-3.5 text-[var(--danger)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              {context.fatigueLevel} <span className="text-xs font-normal text-[var(--text-muted)]">/ 10</span>
            </div>
            <div className={`text-xs font-medium ${context.fatigueLevel >= 7 ? 'text-[var(--danger)]' : context.fatigueLevel <= 3 ? 'text-[var(--primary)]' : 'text-[var(--warning)]'}`}>
              {context.fatigueLevel >= 7 ? 'Elevated' : context.fatigueLevel <= 3 ? 'Low' : 'Manageable'}
            </div>
          </div>

          {/* Sleep */}
          <div className="p-4 bg-[var(--surface)] rounded-2xl border border-[var(--border)] space-y-1.5 shadow-xs hover:border-[var(--secondary)]/40 transition-all">
            <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs">
              <span className="font-semibold">Sleep</span>
              <Moon className="w-3.5 h-3.5 text-[var(--secondary)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              {context.sleepHours.toFixed(1)} <span className="text-xs font-normal text-[var(--text-muted)]">hrs</span>
            </div>
            <div className={`text-xs font-medium ${context.sleepHours < 6.5 ? 'text-[var(--danger)]' : context.sleepHours >= 7.5 ? 'text-[var(--primary)]' : 'text-[var(--secondary)]'}`}>
              {context.sleepHours < 6.5 ? 'Short Sleep' : context.sleepHours >= 7.5 ? 'Restorative' : 'Good'}
            </div>
          </div>

          {/* Available Time */}
          <div className="p-4 bg-[var(--surface)] rounded-2xl border border-[var(--border)] space-y-1.5 shadow-xs hover:border-[var(--primary)]/40 transition-all col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-[var(--text-secondary)] text-xs">
              <span className="font-semibold">Available</span>
              <Clock className="w-3.5 h-3.5 text-[var(--primary)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              {context.availableMinutes} <span className="text-xs font-normal text-[var(--text-muted)]">min</span>
            </div>
            <div className="text-xs font-medium text-[var(--text-secondary)] capitalize truncate">
              {context.environment || 'Home'}
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN RECOMMENDATION (Large Hero Section) */}
      <section className="relative overflow-hidden rounded-3xl bg-[var(--surface)] border border-[var(--border)] p-6 sm:p-8 shadow-md">
        {/* Soft background ambient gradient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 space-y-6">
          {/* Tag & Likelihood Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>YOUR RECOMMENDATION</span>
            </span>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-soft)] text-xs text-[var(--text-secondary)] border border-[var(--border)]">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
              <span>Completion Likelihood: <strong className="text-[var(--text-primary)] font-bold">{recommendation.predictedAdherence}%</strong></span>
            </div>
          </div>

          {/* Main Title & Short Explanation */}
          <div className="space-y-3">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              {recommendation.title}
            </h3>

            <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-3xl">
              {recommendation.whyRecommended}
            </p>
          </div>

          {/* Metadata Chips */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--surface-soft)] text-xs font-semibold text-[var(--text-primary)] border border-[var(--border)]">
              <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>{recommendation.durationMinutes} minutes</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--surface-soft)] text-xs font-semibold text-[var(--text-primary)] border border-[var(--border)] capitalize">
              <Activity className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>{recommendation.intensity} intensity</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--surface-soft)] text-xs font-semibold text-[var(--text-primary)] border border-[var(--border)] capitalize">
              <Home className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>{recommendation.environment}</span>
            </span>
          </div>

          {/* Goal vs Today's Condition Resolution (if active) */}
          {recommendation.goalConflict?.hasConflict && (
            <div className="bg-[var(--warning-soft)] border border-[var(--warning)]/30 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[var(--warning)] shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <div className="font-bold text-[var(--text-primary)]">
                  Adjusted for Today's Condition
                </div>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {recommendation.goalConflict.conflictExplanation}
                </p>
                <p className="text-[var(--text-primary)] pt-1 font-medium">
                  <strong>HealthPilot Adjustment:</strong> {recommendation.goalConflict.recommendedResolution}
                </p>
              </div>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setLogModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Start Workout</span>
              </button>
              <button
                onClick={() => setAlternativesOpen(!alternativesOpen)}
                className="px-5 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] hover:bg-[var(--surface-elevated)] text-[var(--text-primary)] text-sm font-semibold transition-colors"
              >
                {alternativesOpen ? 'Hide Options' : 'See Other Options'}
              </button>
            </div>

            <button
              onClick={() => setActiveModule('coach')}
              className="text-xs text-[var(--primary)] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Ask Coach about this</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Collapsible Alternative Candidates */}
          {alternativesOpen && (
            <div className="pt-4 border-t border-[var(--border)] space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Alternative Options Considered
                </h4>
                <button
                  onClick={() => setActiveModule('plan_lab')}
                  className="text-xs text-[var(--primary)] hover:underline font-semibold"
                >
                  Compare in Plan Lab →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recommendation.alternatives.map(alt => (
                  <div
                    key={alt.id}
                    className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] space-y-2 hover:border-[var(--primary)]/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-xs font-bold text-[var(--text-primary)]">{alt.title}</h5>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface)] text-[var(--text-secondary)] font-semibold border border-[var(--border)]">
                        {alt.durationMinutes}m
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                      {alt.rationale}
                    </p>
                    <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                      <span>Likelihood: <strong className="text-[var(--text-primary)] font-semibold">{alt.predictedAdherence}%</strong></span>
                      <span className="capitalize">{alt.intensity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. WHY THIS FITS YOU (3–4 Simple, Human Reasons) */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              Why This Fits You
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Personalized matching based on your body, schedule, and goals
            </p>
          </div>
          <button
            onClick={() => setShowWhyDetails(!showWhyDetails)}
            className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
          >
            <span>{showWhyDetails ? 'Hide details' : 'More details'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showWhyDetails ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fitReasons.map((reason, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border)] flex items-start gap-3.5"
            >
              <div className="w-8 h-8 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[var(--text-primary)]">
                  {reason.title}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {reason.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Expandable Deeper Breakdown */}
        {showWhyDetails && (
          <div className="pt-4 border-t border-[var(--border)] space-y-3 text-xs text-[var(--text-secondary)] leading-relaxed animate-in fade-in">
            <h4 className="font-bold text-[var(--text-primary)] uppercase text-[11px] tracking-wider">
              HealthPilot Decision Scoring
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)]">
                <span className="text-[11px] text-[var(--text-muted)] block">Physical Readiness</span>
                <span className="text-base font-bold text-[var(--primary)]">{recommendation.healthSuitabilityScore ?? recommendation.suitabilityScore}%</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)]">
                <span className="text-[11px] text-[var(--text-muted)] block">Habit Consistency</span>
                <span className="text-base font-bold text-[var(--primary)]">{recommendation.predictedAdherence}%</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)]">
                <span className="text-[11px] text-[var(--text-muted)] block">Goal Alignment</span>
                <span className="text-base font-bold text-[var(--primary)]">{recommendation.goalAlignmentScore || 85}%</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)]">
                <span className="text-[11px] text-[var(--text-muted)] block">Schedule Fit</span>
                <span className="text-base font-bold text-[var(--primary)]">{recommendation.contextFeasibilityScore || 95}%</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 5. THIS WEEK (Small Weekly Calendar) */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--primary)]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              This Week
            </h2>
          </div>
          <button
            onClick={() => setActiveModule('adaptive_plan')}
            className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
          >
            <span>Open Adaptive Plan</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2.5">
          {weekDates.map(w => {
            const today = isToday(w.date);
            const past = isPast(w.date);
            const planItem = adaptivePlan.find(p => p.date === w.date);

            return (
              <div
                key={w.date}
                className={`p-3 rounded-2xl border transition-all flex flex-col justify-between min-h-[90px] ${
                  today
                    ? 'bg-[var(--primary-soft)] border-[var(--primary)] shadow-sm ring-2 ring-[var(--primary)]/20'
                    : past
                    ? 'bg-[var(--surface-soft)] border-[var(--border-subtle)] opacity-70'
                    : 'bg-[var(--surface-soft)] border-[var(--border)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
                    {w.shortDay}
                  </span>
                  <span className={`text-xs font-bold ${today ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>
                    {w.dayOfMonth}
                  </span>
                </div>

                <div className="my-1">
                  <p className="text-[11px] font-semibold text-[var(--text-primary)] line-clamp-1">
                    {planItem ? planItem.title.split(' ')[0] : 'Activity'}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {planItem?.durationMinutes || 25}m
                  </p>
                </div>

                <div>
                  {today ? (
                    <span className="inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[var(--primary)] text-white">
                      Today
                    </span>
                  ) : past ? (
                    <span className="text-[9px] text-[var(--text-muted)]">Past</span>
                  ) : (
                    <span className="text-[9px] text-[var(--text-muted)]">Upcoming</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. RECENT INSIGHTS (Short Behavioral Cards) */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              Recent Behavioral Insight
            </h2>
          </div>
          <button
            onClick={() => setActiveModule('insights')}
            className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
          >
            <span>View all patterns</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-1.5">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {behaviorSummary?.keyObservation || 'You tend to complete shorter home workouts (20–25m) with your highest consistency.'}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            HealthPilot uses this pattern to schedule session lengths that match your real-life routine.
          </p>
        </div>
      </section>

      {/* 7. QUICK ACTIONS */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setLogModalOpen(true)}
            className="p-4 rounded-2xl bg-[var(--surface-soft)] hover:bg-[var(--primary-soft)] border border-[var(--border)] hover:border-[var(--primary)]/30 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[var(--text-primary)]">Log Today's Activity</h4>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Record completion, duration, and notes</p>
          </button>

          <button
            onClick={() => setActiveModule('context')}
            className="p-4 rounded-2xl bg-[var(--surface-soft)] hover:bg-[var(--primary-soft)] border border-[var(--border)] hover:border-[var(--primary)]/30 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Sliders className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[var(--text-primary)]">Update Context</h4>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Adjust sleep, fatigue, or schedule</p>
          </button>

          <button
            onClick={() => setActiveModule('coach')}
            className="p-4 rounded-2xl bg-[var(--surface-soft)] hover:bg-[var(--primary-soft)] border border-[var(--border)] hover:border-[var(--primary)]/30 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-[var(--text-primary)]">Ask Coach</h4>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Get advice on nutrition, pacing, or recovery</p>
          </button>
        </div>
      </section>

      {/* LOG ACTIVITY MODAL */}
      {logModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                Log Today's Activity
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {recommendation.title} ({recommendation.durationMinutes} min)
              </p>
            </div>

            <form onSubmit={handleRecordOutcomeSubmit} className="space-y-4">
              {/* Status Segmented Control */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  How did it go?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'completed', label: 'Completed' },
                    { id: 'partially_completed', label: 'Partial' },
                    { id: 'skipped', label: 'Skipped' }
                  ].map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setOutcomeStatus(s.id as any)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
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

              {/* Duration Slider if not skipped */}
              {outcomeStatus !== 'skipped' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-secondary)] font-semibold">Actual Duration</span>
                    <span className="font-bold text-[var(--primary)]">{actualDuration} min</span>
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

              {/* Reason if partial or skipped */}
              {outcomeStatus !== 'completed' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">
                    Main reason?
                  </label>
                  <select
                    value={skipReason}
                    onChange={(e) => setSkipReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                  >
                    <option value="too_tired">Too tired / low energy</option>
                    <option value="lack_of_time">Lack of time / busy schedule</option>
                    <option value="soreness">Muscle soreness / physical discomfort</option>
                    <option value="low_motivation">Low motivation today</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Notes / Feeling (optional)
                </label>
                <textarea
                  rows={2}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="How was the intensity or pace?"
                  className="w-full p-2.5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
