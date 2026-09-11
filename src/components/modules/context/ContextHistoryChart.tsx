import React, { useState } from 'react';
import { DailyContext } from '../../../types/index.js';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  Calendar,
  TrendingUp,
  History,
  Moon,
  Zap,
  BatteryCharging,
  Clock,
  Home,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ContextHistoryChartProps {
  history: DailyContext[];
  onSelectRecord?: (record: DailyContext) => void;
}

export const ContextHistoryChart: React.FC<ContextHistoryChartProps> = ({
  history,
  onSelectRecord
}) => {
  const [activeMetricView, setActiveMetricView] = useState<'recovery_sleep' | 'strain_energy' | 'availability'>('recovery_sleep');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Format data for recharts (chronological order from past to present)
  const chartData = [...history]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(record => {
      const dateObj = new Date(record.date);
      const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        date: record.date,
        displayDate: label,
        recoveryScore: record.recoveryScore,
        sleepHours: record.sleepHours,
        energyLevel: record.energyLevel,
        fatigueLevel: record.fatigueLevel,
        stressLevel: record.stressLevel,
        sorenessLevel: record.sorenessLevel,
        availableMinutes: record.availableMinutes
      };
    });

  const toggleRow = (id: string) => {
    setExpandedRow(prev => (prev === id ? null : id));
  };

  return (
    <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 space-y-5 shadow-xs">
      {/* Header & Metric View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Daily Context History & Trends</h3>
            <p className="text-[11px] text-slate-400">Tracking longitudinal variations in autonomic readiness, sleep, and fatigue</p>
          </div>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveMetricView('recovery_sleep')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeMetricView === 'recovery_sleep'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Recovery & Sleep
          </button>
          <button
            type="button"
            onClick={() => setActiveMetricView('strain_energy')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeMetricView === 'strain_energy'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Energy vs Strain
          </button>
          <button
            type="button"
            onClick={() => setActiveMetricView('availability')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              activeMetricView === 'availability'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Available Time
          </button>
        </div>
      </div>

      {/* Interactive Trend Chart */}
      <div className="h-64 w-full pt-1">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            No historical daily context recorded yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {activeMetricView === 'recovery_sleep' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="recoveryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="displayDate" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#10B981" domain={[0, 100]} fontSize={11} tickLine={false} unit="%" />
                <YAxis yAxisId="right" orientation="right" stroke="#6366F1" domain={[0, 12]} fontSize={11} tickLine={false} unit="h" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="recoveryScore"
                  name="Recovery Score (%)"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#recoveryGradient)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="sleepHours"
                  name="Sleep Hours (h)"
                  stroke="#818CF8"
                  strokeWidth={2}
                  dot={{ fill: '#818CF8', r: 3 }}
                />
              </AreaChart>
            ) : activeMetricView === 'strain_energy' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="displayDate" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 10]} stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="energyLevel"
                  name="Energy (1-10)"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  dot={{ fill: '#F59E0B', r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="fatigueLevel"
                  name="Fatigue (1-10)"
                  stroke="#F43F5E"
                  strokeWidth={2}
                  dot={{ fill: '#F43F5E', r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="stressLevel"
                  name="Stress (1-10)"
                  stroke="#FB923C"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ fill: '#FB923C', r: 2 }}
                />
              </LineChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="displayDate" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#14B8A6" domain={[0, 90]} fontSize={11} tickLine={false} unit="m" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="availableMinutes"
                  name="Available Time (Minutes)"
                  stroke="#14B8A6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#timeGradient)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Historical Dated Records Log Table / Accordion */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
          <span>Logged Historical Context Records ({history.length})</span>
          <span className="text-[11px] font-normal text-slate-500">Sorted by most recent</span>
        </div>

        <div className="space-y-2">
          {history.map((record) => {
            const isExpanded = expandedRow === record.id;
            const recStatus = record.recoveryStatus || (record.recoveryScore >= 70 ? 'good' : record.recoveryScore < 48 ? 'low' : 'moderate');
            const statusBadge =
              recStatus === 'good'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : recStatus === 'low'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

            return (
              <div
                key={record.id}
                className="bg-slate-900/60 rounded-lg border border-slate-800/80 overflow-hidden transition-all text-xs"
              >
                <div
                  onClick={() => toggleRow(record.id)}
                  className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="font-mono font-bold text-white text-xs flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{record.date}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${statusBadge}`}>
                      {record.recoveryScore}% {recStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-400">
                    <div className="hidden sm:flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Moon className="w-3 h-3 text-indigo-400" />
                        <span>{record.sleepHours.toFixed(1)}h</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>{record.energyLevel}/10</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <BatteryCharging className="w-3 h-3 text-rose-400" />
                        <span>{record.fatigueLevel}/10</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-teal-400" />
                        <span>{record.availableMinutes}m</span>
                      </span>
                      <span className="capitalize text-slate-300 font-medium">
                        {record.environment}
                      </span>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-3.5 bg-slate-950/60 border-t border-slate-800/80 space-y-2.5 text-[11px] text-slate-300">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-2 bg-slate-900 rounded border border-white/5">
                        <span className="text-slate-400 block text-[10px]">Sleep Quality</span>
                        <span className="font-bold text-white">{record.sleepQuality} / 10</span>
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-white/5">
                        <span className="text-slate-400 block text-[10px]">Stress / Cognitive Load</span>
                        <span className="font-bold text-white">{record.stressLevel} / 10 {record.cognitiveLoad ? `(Load: ${record.cognitiveLoad}/10)` : ''}</span>
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-white/5">
                        <span className="text-slate-400 block text-[10px]">Muscle Soreness</span>
                        <span className="font-bold text-white">{record.sorenessLevel} / 10</span>
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-white/5">
                        <span className="text-slate-400 block text-[10px]">Logged Mood & Hydration</span>
                        <span className="font-bold text-white capitalize">{record.mood || 'Good'} • {record.hydrationLiters || 1.5}L</span>
                      </div>
                    </div>

                    {record.currentPreferences && (
                      <div className="p-2 bg-slate-900/60 rounded border border-white/5">
                        <span className="text-slate-400 text-[10px] block font-semibold">User Notes & Qualitative Preferences:</span>
                        <p className="text-slate-300 italic mt-0.5">{record.currentPreferences}</p>
                      </div>
                    )}

                    {record.equipmentAvailable && record.equipmentAvailable.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-slate-500 text-[10px]">Equipment:</span>
                        {record.equipmentAvailable.map((eq, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                            {eq}
                          </span>
                        ))}
                      </div>
                    )}

                    {onSelectRecord && (
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => onSelectRecord(record)}
                          className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          Load this record into editor
                        </button>
                      </div>
                    )}
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
