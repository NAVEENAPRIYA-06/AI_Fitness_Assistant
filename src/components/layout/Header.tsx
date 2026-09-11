import React from 'react';
import { Menu, RefreshCw, Sparkles, Sliders, ShieldCheck } from 'lucide-react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setMobileOpen }) => {
  const { activeModule, setActiveModule, profile, refreshAll, isLoading } = useHealthPilot();

  const moduleTitles: Record<string, { title: string; subtitle: string }> = {
    today: {
      title: 'Today’s Decision Intelligence',
      subtitle: 'What should you focus on today based on physiological readiness & behavioral patterns?'
    },
    context: {
      title: 'My Daily Context',
      subtitle: 'Record changing sleep, fatigue, stress, soreness, time, and environment conditions.'
    },
    coach: {
      title: 'AI Health Coach',
      subtitle: 'Conversational health intelligence grounded in your evolving state and model explanations.'
    },
    what_if: {
      title: 'What-If & Counterfactual Lab',
      subtitle: 'Simulate condition changes and observe model-based adherence shifts with SHAP attributions.'
    },
    plan_lab: {
      title: 'Plan Lab',
      subtitle: 'Compare candidate interventions, trade-offs, and multi-objective suitability scores.'
    },
    conflicts: {
      title: 'Goal-Condition Conflict Detector',
      subtitle: 'Identifies acute recovery mismatches against long-term athletic goals and resolves them.'
    },
    insights: {
      title: 'Behavioral Pattern Analysis',
      subtitle: 'Empirical analysis of workout duration, environment, completion rates, and failure barriers.'
    },
    journal: {
      title: 'Outcome Journal',
      subtitle: 'Log actual decisions and barriers to close the continuous feedback loop.'
    },
    history: {
      title: 'Recommendation History',
      subtitle: 'Auditable timeline of issued decisions, context snapshots, and real outcomes.'
    },
    progress: {
      title: 'Progress & Trends',
      subtitle: 'Recovery readiness, adherence trajectories, and physiological volume over time.'
    },
    adaptive_plan: {
      title: 'Adaptive Weekly Plan',
      subtitle: 'Dynamic training schedule that automatically shifts sessions based on completed and skipped actions.'
    },
    goals: {
      title: 'Goal Strategy',
      subtitle: 'Active goals, milestones, and strategic adjustments.'
    },
    settings: {
      title: 'System Settings & Profile',
      subtitle: 'Manage physiological metrics, hardware equipment, and modular ML connections.'
    }
  };

  const currentMeta = moduleTitles[activeModule] || {
    title: 'HealthPilot AI',
    subtitle: 'Decision Intelligence System'
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0A0A0B]/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {currentMeta.title}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Verified Engine
            </span>
          </div>
          <p className="hidden md:block text-xs text-slate-400 mt-0.5 tracking-tight line-clamp-1">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Context Switch */}
        <button
          onClick={() => setActiveModule('context')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
          <span>Update Context</span>
        </button>

        {/* Quick Coach Ask */}
        <button
          onClick={() => setActiveModule('coach')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0A0A0B] bg-emerald-500 hover:bg-emerald-400 transition-colors shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask Coach</span>
        </button>

        {/* Refresh Data */}
        <button
          onClick={refreshAll}
          disabled={isLoading}
          title="Refresh Decision State"
          className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>

        {/* Profile Avatar Pill */}
        <button
          onClick={() => setActiveModule('settings')}
          className="flex items-center gap-2 pl-2 sm:pl-3 pr-2 py-1 bg-slate-900 border border-slate-800 rounded-full hover:bg-slate-800 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-center">
            {profile?.name?.charAt(0) || 'A'}
          </div>
          <span className="hidden md:inline text-xs font-medium text-slate-300">
            {profile?.name || 'Alex'}
          </span>
        </button>
      </div>
    </header>
  );
};
