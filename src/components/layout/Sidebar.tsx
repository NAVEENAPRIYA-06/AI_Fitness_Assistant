import React from 'react';
import {
  Compass,
  Sliders,
  Sparkles,
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
  X,
  HelpCircle
} from 'lucide-react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activeModule, setActiveModule, evolvingState, recommendation } = useHealthPilot();

  const [researchEnabled, setResearchEnabled] = React.useState(() => {
    return localStorage.getItem('healthpilot_enable_research') === 'true';
  });

  React.useEffect(() => {
    const handleStorage = () => {
      setResearchEnabled(localStorage.getItem('healthpilot_enable_research') === 'true');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const navGroups = [
    {
      title: 'HOME',
      items: [
        { id: 'today', label: 'Today', icon: Compass, badge: recommendation ? 'Ready' : undefined }
      ]
    },
    {
      title: 'YOUR PLAN',
      items: [
        { id: 'context', label: 'My Context', icon: Sliders },
        { id: 'adaptive_plan', label: 'Adaptive Plan', icon: CalendarDays },
        { id: 'journal', label: 'Outcome Journal', icon: CheckCircle2 }
      ]
    },
    {
      title: 'INSIGHTS',
      items: [
        { id: 'progress', label: 'Progress', icon: TrendingUp },
        { id: 'insights', label: 'Behavior Insights', icon: Brain },
        { id: 'history', label: 'Activity History', icon: History }
      ]
    },
    {
      title: 'PLANNING',
      items: [
        { id: 'plan_lab', label: 'Plan Lab', icon: Layers },
        { id: 'what_if', label: 'What-If', icon: HelpCircle }
      ]
    },
    {
      title: 'GOALS',
      items: [
        { id: 'goals', label: 'Goal Strategy', icon: Target },
        {
          id: 'conflicts',
          label: 'Goal Conflicts',
          icon: AlertTriangle,
          badge: recommendation?.goalConflict?.hasConflict ? 'Adjusted' : undefined,
          badgeColor: 'amber'
        }
      ]
    },
    {
      title: 'COACH',
      items: [
        { id: 'coach', label: 'HealthPilot Coach', icon: Sparkles, highlight: true }
      ]
    },
    ...(researchEnabled
      ? [
          {
            title: 'INTERNAL RESEARCH',
            items: [
              { id: 'evaluation', label: 'Research & Evaluation', icon: Activity }
            ]
          }
        ]
      : []),
    {
      title: 'ACCOUNT',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings2 }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <div
            onClick={() => {
              setActiveModule('today');
              setMobileOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-base text-[var(--text-primary)] tracking-tight">HealthPilot</span>
                <span className="text-[var(--primary)] font-bold text-xs">AI</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] font-medium">Your Personal Fitness Coach</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)]"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Evolving State Mini Summary */}
        <div className="px-4 pt-3.5 pb-1">
          <div className="p-3 bg-[var(--surface-soft)] rounded-2xl border border-[var(--border)] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-secondary)] font-medium">Recovery Readiness</span>
              <span className="font-bold text-[var(--primary)]">
                {evolvingState ? `${evolvingState.recoveryReadiness}%` : '--'}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[var(--surface)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
                style={{ width: `${evolvingState?.recoveryReadiness || 60}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
              <span>Status: <strong className="text-[var(--text-primary)] font-medium capitalize">{evolvingState?.adaptationStatus?.replace('_', ' ') || 'Ready'}</strong></span>
              <span>Consistency: <strong className="text-[var(--text-primary)] font-medium">{evolvingState?.weeklyAdherenceRate || 75}%</strong></span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <h3 className="px-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
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
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        isActive
                          ? 'bg-[var(--primary-soft)] text-[var(--primary)] font-semibold border border-[var(--primary)]/25'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            item.badgeColor === 'amber'
                              ? 'bg-[var(--warning-soft)] text-[var(--warning)]'
                              : 'bg-[var(--primary-soft)] text-[var(--primary)]'
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

        {/* Bottom AI Coach Card */}
        <div className="p-3 border-t border-[var(--border)]">
          <button
            onClick={() => {
              setActiveModule('coach');
              setMobileOpen(false);
            }}
            className="w-full flex items-center gap-3 p-2.5 bg-[var(--surface-soft)] hover:bg-[var(--primary-soft)]/50 border border-[var(--border)] rounded-2xl cursor-pointer transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="text-xs min-w-0">
              <p className="text-[var(--text-primary)] font-bold truncate">HealthPilot Coach</p>
              <p className="text-[11px] text-[var(--text-muted)] truncate">Ask for personalized guidance</p>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
