import React from 'react';
import {
  Compass,
  Sliders,
  Sparkles,
  FlaskConical,
  Layers,
  AlertTriangle,
  Brain,
  CheckCircle2,
  History,
  TrendingUp,
  CalendarDays,
  Target,
  Settings2,
  Activity,
  ShieldCheck,
  X
} from 'lucide-react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activeModule, setActiveModule, evolvingState, recommendation } = useHealthPilot();

  const navGroups = [
    {
      title: 'Core',
      items: [
        { id: 'today', label: 'Today', icon: Compass, badge: recommendation ? 'Decision Ready' : undefined },
        { id: 'context', label: 'My Context', icon: Sliders },
        { id: 'adaptive_plan', label: 'Adaptive Plan', icon: CalendarDays },
        { id: 'journal', label: 'Outcome Journal', icon: CheckCircle2 }
      ]
    },
    {
      title: 'Insights',
      items: [
        { id: 'insights', label: 'Behavior Insights', icon: Brain },
        { id: 'progress', label: 'Progress', icon: TrendingUp },
        { id: 'history', label: 'Recommendation History', icon: History }
      ]
    },
    {
      title: 'Decision Lab',
      items: [
        { id: 'plan_lab', label: 'Plan Lab', icon: Layers },
        { id: 'what_if', label: 'What-If Lab', icon: FlaskConical, badge: 'XAI' },
        { id: 'goals', label: 'Goal Strategy', icon: Target },
        { id: 'conflicts', label: 'Goal Conflicts', icon: AlertTriangle, badge: recommendation?.goalConflict.hasConflict ? 'Active' : undefined, badgeColor: 'amber' }
      ]
    },
    {
      title: 'AI',
      items: [
        { id: 'coach', label: 'AI Coach', icon: Sparkles, highlight: true }
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings2 },
        { id: 'evaluation', label: 'Evaluation', icon: ShieldCheck, badge: 'Research' }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0F0F11] border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-[#0A0A0B] font-bold shadow-xs">
              <Activity className="w-4 h-4 text-[#0A0A0B]" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-base text-white tracking-tight">HealthPilot</span>
                <span className="text-emerald-500 font-light text-xs align-top ml-0.5">AI</span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal tracking-tight">Decision Intelligence System</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Evolving State Mini-Pill */}
        <div className="px-4 pt-3 pb-1">
          <div className="p-3 bg-[#141417] rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Recovery Readiness</span>
              <span className="font-mono font-bold text-emerald-400">
                {evolvingState ? `${evolvingState.recoveryReadiness}%` : '--'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${evolvingState?.recoveryReadiness || 50}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
              <span>Status: <strong className="text-slate-300 capitalize font-medium">{evolvingState?.adaptationStatus.replace('_', ' ') || 'Ready'}</strong></span>
              <span>Adherence: <strong className="text-slate-300 font-mono">{evolvingState?.weeklyAdherenceRate || 75}%</strong></span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                {group.title}
              </h3>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveModule(item.id);
                        setMobileOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {isActive ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        ) : (
                          <Icon className="w-4 h-4 text-slate-500" />
                        )}
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold border ${
                            item.badgeColor === 'amber'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-slate-800/80 text-slate-400 border-slate-700/80'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom AI Coach Card & Service Status */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <div
            onClick={() => setActiveModule('coach')}
            className="flex items-center gap-3 p-2.5 bg-slate-800/30 border border-slate-800/60 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
              AI
            </div>
            <div className="text-xs min-w-0">
              <p className="text-slate-200 font-medium truncate">Coach Gemini</p>
              <p className="text-[11px] text-slate-500 truncate">Ready to analyze...</p>
            </div>
          </div>

          <div className="px-1 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Decisions Verified</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
