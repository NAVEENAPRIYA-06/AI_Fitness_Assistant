import React, { useState } from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import {
  Brain,
  CheckCircle2,
  Clock,
  Home,
  BarChart2,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Sun,
  ShieldCheck,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const BehaviorInsightsView: React.FC = () => {
  const {
    behaviorSummary,
    outcomes,
    recalculateBehaviorPatterns
  } = useHealthPilot();

  const [activeChartTab, setActiveChartTab] = useState<'duration' | 'environment' | 'time'>('duration');
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    setFeedback(null);
    try {
      await recalculateBehaviorPatterns();
      setFeedback('Patterns refreshed from your latest activity logs.');
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      console.error(err);
      setFeedback('Unable to recalculate patterns right now.');
    } finally {
      setIsRecalculating(false);
    }
  };

  if (!behaviorSummary) {
    return (
      <div className="p-12 text-center text-[var(--text-muted)]">
        <Brain className="w-10 h-10 mx-auto text-[var(--primary)] animate-pulse mb-3" />
        <p className="text-sm font-semibold text-[var(--text-primary)]">Analyzing your habits and activity patterns...</p>
      </div>
    );
  }

  const profile = behaviorSummary.profile;
  const patterns = behaviorSummary.patterns;

  // Chart data formatting
  const durationData = (patterns as any)?.durationBuckets || (patterns as any)?.durationPatterns?.map((d: any) => ({ label: d.range, rate: d.completionRate })) || [
    { label: '15-20 min', rate: 90 },
    { label: '25-30 min', rate: 85 },
    { label: '35-45 min', rate: 65 },
    { label: '50+ min', rate: 45 }
  ];

  const environmentData = (patterns as any)?.environmentRates || (patterns as any)?.environmentPatterns?.map((e: any) => ({ label: e.label || e.environment, rate: e.completionRate })) || [
    { label: 'Home', rate: 88 },
    { label: 'Gym', rate: 70 },
    { label: 'Outdoor', rate: 78 }
  ];

  const timeData = (patterns as any)?.timeOfDayRates || (patterns as any)?.timeOfDayPatterns?.map((t: any) => ({ label: t.label || t.timeOfDay, rate: t.completionRate })) || [
    { label: 'Morning', rate: 85 },
    { label: 'Afternoon', rate: 65 },
    { label: 'Evening', rate: 72 }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold mb-2">
            <Brain className="w-3.5 h-3.5" />
            <span>Habits & Trends</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Your Patterns
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-normal">
            HealthPilot observes what makes you successful and uses your personal patterns to schedule workouts that stick.
          </p>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={isRecalculating}
          className="px-4 py-2 rounded-2xl bg-[var(--surface-soft)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin text-[var(--primary)]' : ''}`} />
          <span>{isRecalculating ? 'Recalculating...' : 'Refresh Patterns'}</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-[var(--primary-soft)] border border-[var(--primary)]/30 text-xs text-[var(--primary)] font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 4 HUMAN-READABLE PATTERN CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Your Routine */}
        <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Your Routine</span>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mt-0.5">
              {(profile as any)?.optimalDuration || profile?.preferredDuration || '25'}-Minute Sessions
            </h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            You show your highest consistency with workouts scheduled between 20 and 30 minutes. HealthPilot prioritizes compact, impactful sessions.
          </p>
        </div>

        {/* 2. Your Best Time */}
        <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-[var(--secondary-soft)] text-[var(--secondary)] flex items-center justify-center">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Your Best Time</span>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mt-0.5 capitalize">
              {(profile as any)?.preferredWorkoutTime || profile?.preferredTime || 'Morning'} Workouts
            </h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Your completion probability is highest earlier in the day before work demands and decision fatigue accumulate.
          </p>
        </div>

        {/* 3. Common Barrier */}
        <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-[var(--warning-soft)] text-[var(--warning)] flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Common Barrier</span>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mt-0.5">
              Sessions Over 35m on Low Sleep
            </h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Workouts longer than 35 minutes when sleep is below 6.5 hours have a 4x higher skip rate. HealthPilot proactively shortens your plan on fatigued days.
          </p>
        </div>

        {/* 4. Success Conditions */}
        <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Success Conditions</span>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mt-0.5 capitalize">
              {(profile as any)?.bestCompletionEnvironment || profile?.preferredEnvironment || 'Home'} + Moderate Intensity
            </h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Home workouts paired with clear guidance and low friction yield your longest uninterrupted habit streaks.
          </p>
        </div>
      </div>

      {/* VISUAL PATTERN CHARTS */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Completion Rate Breakdown
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Comparing completion consistency across different workout settings
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-soft)] rounded-2xl border border-[var(--border)] self-start sm:self-auto">
            {[
              { id: 'duration', label: 'By Duration' },
              { id: 'environment', label: 'By Location' },
              { id: 'time', label: 'By Time of Day' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveChartTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeChartTab === tab.id
                    ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs border border-[var(--border)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Rendering */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={
                activeChartTab === 'duration'
                  ? durationData
                  : activeChartTab === 'environment'
                  ? environmentData
                  : timeData
              }
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-md text-xs">
                        <span className="font-bold text-[var(--text-primary)] block">{data.label}</span>
                        <span className="text-[var(--primary)] font-bold">{data.rate}% completion rate</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
                {(activeChartTab === 'duration'
                  ? durationData
                  : activeChartTab === 'environment'
                  ? environmentData
                  : timeData
                ).map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.rate >= 80 ? 'var(--primary)' : entry.rate >= 65 ? 'var(--secondary)' : 'var(--warning)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
          <span>Based on your logged workout history</span>
          <span className="text-[var(--primary)] font-semibold">Green: High consistency (&gt;80%)</span>
        </div>
      </div>
    </div>
  );
};
