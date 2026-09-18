import React, { useState } from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import {
  TrendingUp,
  Activity,
  Moon,
  Clock,
  CheckCircle2,
  Calendar,
  Filter,
  Sparkles,
  Award,
  Flame,
  Zap
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export const ProgressView: React.FC = () => {
  const { evolvingState, outcomes } = useHealthPilot();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high_recovery' | 'low_recovery'>('all');

  // 14-day progression trajectory data
  const trendData = [
    { day: 'Day 1', readiness: 78, adherence: 85, minutes: 45, status: 'Completed', title: 'Zone 2 Cardio' },
    { day: 'Day 2', readiness: 82, adherence: 90, minutes: 50, status: 'Completed', title: 'Functional Strength' },
    { day: 'Day 3', readiness: 65, adherence: 75, minutes: 30, status: 'Completed', title: 'Tempo Walk' },
    { day: 'Day 4', readiness: 60, adherence: 70, minutes: 25, status: 'Completed', title: 'Restorative Mobility' },
    { day: 'Day 5', readiness: 72, adherence: 80, minutes: 40, status: 'Completed', title: 'Upper Body Conditioning' },
    { day: 'Day 6', readiness: 85, adherence: 92, minutes: 60, status: 'Completed', title: 'Outdoor Trail Session' },
    { day: 'Day 7', readiness: 80, adherence: 88, minutes: 55, status: 'Completed', title: 'Core & Mobility Flow' },
    { day: 'Day 8', readiness: 74, adherence: 82, minutes: 40, status: 'Completed', title: 'Dumbbell Conditioning' },
    { day: 'Day 9', readiness: 68, adherence: 78, minutes: 35, status: 'Completed', title: 'Kettlebell Circuit' },
    { day: 'Day 10', readiness: 55, adherence: 65, minutes: 20, status: 'Adapted', title: 'Gentle Mobility' },
    { day: 'Day 11', readiness: 62, adherence: 72, minutes: 25, status: 'Completed', title: 'Brisk Incline Walk' },
    { day: 'Day 12', readiness: 75, adherence: 85, minutes: 45, status: 'Completed', title: 'Lower Body Strength' },
    { day: 'Day 13', readiness: 70, adherence: 80, minutes: 30, status: 'Completed', title: 'Yoga & Foam Rolling' },
    { day: 'Day 14', readiness: 76, adherence: 84, minutes: 35, status: 'Completed', title: 'Mobility & Core Flow' }
  ];

  const totalMinutes = trendData.reduce((acc, cur) => acc + cur.minutes, 0);
  const avgReadiness = Math.round(trendData.reduce((acc, cur) => acc + cur.readiness, 0) / trendData.length);

  const filteredLogs = trendData.filter(d => {
    if (selectedFilter === 'high_recovery') return d.readiness >= 70;
    if (selectedFilter === 'low_recovery') return d.readiness < 70;
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Consistency & Growth</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Progress & Consistency
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-normal">
            Your longitudinal recovery trajectory, workout consistency, and active volume over the past 14 days.
          </p>
        </div>
      </div>

      {/* MILESTONE CELEBRATION CARD */}
      <div className="bg-gradient-to-r from-[var(--surface)] via-[var(--surface)] to-[var(--primary-soft)]/20 border border-[var(--primary)]/30 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                Milestone Achieved
              </span>
              <span className="text-xs text-[var(--text-muted)]">This Week</span>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
              Consistent Training Rhythm
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              You have completed 92% of scheduled workouts, keeping your habit momentum strong.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-start sm:self-auto border-t sm:border-t-0 sm:border-l border-[var(--border)] pt-3 sm:pt-0 sm:pl-6">
          <div>
            <span className="text-xs text-[var(--text-muted)] block">Total Active Time</span>
            <span className="text-2xl font-bold text-[var(--text-primary)]">{totalMinutes} min</span>
          </div>
        </div>
      </div>

      {/* 3 SUMMARY KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-1 shadow-xs">
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">Average Recovery</span>
          <p className="text-3xl font-extrabold text-[var(--primary)] tracking-tight">{avgReadiness}%</p>
          <p className="text-xs text-[var(--text-secondary)]">Optimal recovery readiness</p>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-1 shadow-xs">
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">Weekly Adherence</span>
          <p className="text-3xl font-extrabold text-[var(--primary)] tracking-tight">{evolvingState?.weeklyAdherenceRate || 85}%</p>
          <p className="text-xs text-[var(--text-secondary)]">Completed workouts vs planned</p>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-1 shadow-xs">
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">Total Active Minutes</span>
          <p className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">{totalMinutes}m</p>
          <p className="text-xs text-[var(--text-secondary)]">Across 14 observation days</p>
        </div>
      </div>

      {/* 14-DAY RECOVERY & READINESS TRAJECTORY CHART */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Recovery & Readiness Trajectory
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              How your daily recovery score dynamically interacts with training volume
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[var(--primary)] font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
              Recovery Score
            </span>
            <span className="flex items-center gap-1.5 text-[var(--secondary)] font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--secondary)]" />
              Consistency %
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} domain={[40, 100]} unit="%" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-xl text-xs space-y-1">
                        <span className="font-bold text-[var(--text-primary)] block">{data.day} — {data.title}</span>
                        <div className="flex items-center justify-between gap-4 text-[var(--primary)] font-semibold">
                          <span>Recovery:</span>
                          <span>{data.readiness}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-[var(--secondary)] font-semibold">
                          <span>Consistency:</span>
                          <span>{data.adherence}%</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-[var(--text-muted)]">
                          <span>Duration:</span>
                          <span>{data.minutes}m</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="readiness"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorReadiness)"
              />
              <Line
                type="monotone"
                dataKey="adherence"
                stroke="var(--secondary)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RECENT SESSION LOG */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            Past 14 Observation Sessions
          </h3>

          <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-soft)] rounded-2xl border border-[var(--border)] self-start sm:self-auto">
            {[
              { id: 'all', label: 'All Sessions' },
              { id: 'high_recovery', label: 'Optimal Recovery' },
              { id: 'low_recovery', label: 'Adapted Recovery' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedFilter === f.id
                    ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs border border-[var(--border)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredLogs.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center font-bold text-xs">
                  {item.day.replace('Day ', '#')}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">{item.title}</h4>
                  <p className="text-[11px] text-[var(--text-muted)]">{item.minutes} minutes active</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="text-[var(--text-secondary)]">
                  Recovery: <strong className="text-[var(--primary)] font-bold">{item.readiness}%</strong>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] text-[10px] font-semibold">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
