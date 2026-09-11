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
  FileText,
  ChevronDown,
  ChevronUp
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
  const { evolvingState, behaviorSummary, outcomes } = useHealthPilot();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high_recovery' | 'low_recovery'>('all');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Synthetic 14-day historical trend data representing evolving state over time
  const trendData = [
    { day: 'Day 1', readiness: 78, adherence: 85, sleep: 7.4, volume: 45, status: 'Completed', notes: '45m Zone 2 Aerobic run. Clean pacing and prompt recovery.' },
    { day: 'Day 2', readiness: 82, adherence: 90, sleep: 7.8, volume: 50, status: 'Completed', notes: 'Full-body functional strength. Autonomic readiness high.' },
    { day: 'Day 3', readiness: 65, adherence: 75, sleep: 6.2, volume: 30, status: 'Completed', notes: '30m tempo walk. Scaled from 45m due to moderate fatigue.' },
    { day: 'Day 4', readiness: 60, adherence: 70, sleep: 5.9, volume: 25, status: 'Completed', notes: '25m restorative mobility. Acute sleep deficit detected.' },
    { day: 'Day 5', readiness: 72, adherence: 80, sleep: 7.1, volume: 40, status: 'Completed', notes: 'Upper-body functional strength. Recovery rebound.' },
    { day: 'Day 6', readiness: 85, adherence: 92, sleep: 8.2, volume: 60, status: 'Completed', notes: '60m weekend outdoor trail run. Peak weekly stimulus.' },
    { day: 'Day 7', readiness: 80, adherence: 88, sleep: 7.5, volume: 55, status: 'Completed', notes: '55m mobility flow & core stability. Active recovery.' },
    { day: 'Day 8', readiness: 74, adherence: 82, sleep: 6.8, volume: 40, status: 'Completed', notes: '40m dumbbell conditioning. Solid session rhythm.' },
    { day: 'Day 9', readiness: 68, adherence: 78, sleep: 6.4, volume: 35, status: 'Completed', notes: '35m kettlebell circuit. Compressed schedule.' },
    { day: 'Day 10', readiness: 55, adherence: 65, sleep: 5.5, volume: 20, status: 'Adapted', notes: '20m micro-mobility. Tight deadline and travel fatigue.' },
    { day: 'Day 11', readiness: 62, adherence: 72, sleep: 6.1, volume: 25, status: 'Completed', notes: '25m brisk incline walk. Autonomic restoration priority.' },
    { day: 'Day 12', readiness: 75, adherence: 85, sleep: 7.3, volume: 45, status: 'Completed', notes: '45m lower-body hypertrophy. Strong exertion follow-through.' },
    { day: 'Day 13', readiness: 70, adherence: 80, sleep: 6.7, volume: 30, status: 'Completed', notes: '30m restorative yoga and foam rolling.' },
    { day: 'Day 14', readiness: 58, adherence: 78, sleep: 5.8, volume: 20, status: 'Adapted', notes: '20m core mobility. Pre-emptive load throttling applied.' }
  ];

  const filteredLogs = trendData.filter(d => {
    if (selectedFilter === 'high_recovery') return d.readiness >= 70;
    if (selectedFilter === 'low_recovery') return d.readiness < 70;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
            <TrendingUp className="w-4 h-4 inline mr-1 text-emerald-400" />
            Longitudinal Progress
          </span>
          <span className="text-xs text-slate-500 font-mono">14-Day Trajectory</span>
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">
          Recovery Readiness & Adherence Trajectories
        </h2>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Tracking the dynamic interaction between sleep recovery, daily stress, prescribed training volume,
          and actual follow-through rate across 14 consecutive observation periods.
        </p>
      </div>

      {/* 1. PROGRESS SUMMARY */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              1. Progress Summary
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Autonomic Baseline
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-4.5 space-y-1">
            <span className="text-xs font-semibold text-slate-400">Current Recovery Score</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-emerald-400">
                {evolvingState?.recoveryReadiness}%
              </span>
              <span className="text-[11px] text-slate-500">Readiness Baseline</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">Autonomic restoration model</p>
          </div>

          <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-4.5 space-y-1">
            <span className="text-xs font-semibold text-slate-400">14-Day Average Adherence</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-white">
                {evolvingState?.weeklyAdherenceRate}%
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold">+6% vs prior month</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">Driven by adaptive session sizing</p>
          </div>

          <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-4.5 space-y-1">
            <span className="text-xs font-semibold text-slate-400">Total Minutes Accumulated</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-indigo-400">475m</span>
              <span className="text-[11px] text-indigo-400 font-medium">14 days</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">Consistent stimulus without burnout</p>
          </div>
        </div>
      </div>

      {/* 2. KEY TRENDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              2. Key Trends
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Readiness vs. Volume Trajectory
          </span>
        </div>

        {/* Chart 1: Recovery Readiness & Adherence */}
        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">
                Recovery Readiness vs. Adherence Probability
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Notice how higher recovery directly protects high adherence follow-through
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Recovery Readiness</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-slate-300">Adherence %</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis unit="%" domain={[40, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `${val}%`,
                    name === 'readiness' ? 'Recovery Readiness' : 'Adherence'
                  ]}
                  contentStyle={{ backgroundColor: '#0F0F11', borderRadius: '8px', border: '1px solid #334155', color: '#f8fafc', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="readiness"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="adherence"
                  stroke="#818cf8"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2.5, fill: '#818cf8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Sleep Duration vs Session Volume */}
        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">
                Sleep Duration vs. Active Training Minutes
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Adaptive throttling safely reduces training duration on poor sleep nights
              </p>
            </div>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis unit="m" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(val: any) => [`${val} mins`, 'Active Volume']}
                  contentStyle={{ backgroundColor: '#0F0F11', borderRadius: '8px', border: '1px solid #334155', color: '#f8fafc', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorVolume)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. DETAILED LOGS */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              3. Detailed Logs
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-xs">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All (14)
              </button>
              <button
                onClick={() => setSelectedFilter('high_recovery')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedFilter === 'high_recovery'
                    ? 'bg-slate-800 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                High Recovery (≥70%)
              </button>
              <button
                onClick={() => setSelectedFilter('low_recovery')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedFilter === 'low_recovery'
                    ? 'bg-slate-800 text-amber-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Adapted / Low Recovery
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-mono text-[11px]">
                  <th className="py-3 px-4 font-semibold">Observation Period</th>
                  <th className="py-3 px-4 font-semibold">Sleep Duration</th>
                  <th className="py-3 px-4 font-semibold">Recovery Readiness</th>
                  <th className="py-3 px-4 font-semibold">Active Volume</th>
                  <th className="py-3 px-4 font-semibold">Adherence Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.map((log) => {
                  const isExpanded = expandedDay === log.day;
                  return (
                    <React.Fragment key={log.day}>
                      <tr className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-white">{log.day}</td>
                        <td className="py-3 px-4 font-mono text-slate-300">{log.sleep} hrs</td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-mono font-bold ${
                              log.readiness >= 75
                                ? 'text-emerald-400'
                                : log.readiness >= 60
                                ? 'text-indigo-300'
                                : 'text-amber-400'
                            }`}
                          >
                            {log.readiness}%
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">{log.volume} mins</td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                              log.status === 'Completed'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setExpandedDay(isExpanded ? null : log.day)}
                            className="text-slate-400 hover:text-white transition-colors p-1"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 inline" />
                            ) : (
                              <ChevronDown className="w-4 h-4 inline" />
                            )}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-900/30">
                          <td colSpan={6} className="py-3 px-4 text-xs border-t border-slate-800/40">
                            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 space-y-1">
                              <span className="font-bold text-white text-[11px] block">Session Note:</span>
                              <p className="text-slate-300 leading-relaxed">{log.notes}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
