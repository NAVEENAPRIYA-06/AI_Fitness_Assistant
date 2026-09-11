import React, { useState } from 'react';
import { HealthPilotProvider, useHealthPilot } from './context/HealthPilotContext.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { Header } from './components/layout/Header.js';
import { AuthPage } from './components/auth/AuthPage.js';
import { TodayView } from './components/modules/TodayView.js';
import { MyContextView } from './components/modules/MyContextView.js';
import { BehaviorInsightsView } from './components/modules/BehaviorInsightsView.js';
import { PlanLabView } from './components/modules/PlanLabView.js';
import { WhatIfLabView } from './components/modules/WhatIfLabView.js';
import { GoalStrategyView } from './components/modules/GoalStrategyView.js';
import { GoalConflictsView } from './components/modules/GoalConflictsView.js';
import { AdaptivePlanView } from './components/modules/AdaptivePlanView.js';
import { OutcomeJournalView } from './components/modules/OutcomeJournalView.js';
import { ProgressView } from './components/modules/ProgressView.js';
import { AiCoachView } from './components/modules/AiCoachView.js';
import { RecommendationHistoryView } from './components/modules/RecommendationHistoryView.js';
import { SettingsView } from './components/modules/SettingsView.js';
import { EvaluationView } from './components/modules/EvaluationView.js';
import { OnboardingModal } from './components/common/OnboardingModal.js';
import { ErrorBoundary } from './components/common/ErrorBoundary.js';
import { Activity, Loader2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeModule, currentUser, token, isLoading } = useHealthPilot();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Initial authentication loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-pulse shadow-lg shadow-emerald-500/5">
            <Activity className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>Initializing HealthPilot AI...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated -> Render Authentication Page
  if (!currentUser || !token) {
    return <AuthPage />;
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'today':
        return <TodayView />;
      case 'context':
        return <MyContextView />;
      case 'insights':
        return <BehaviorInsightsView />;
      case 'plan_lab':
        return <PlanLabView />;
      case 'what_if':
        return <WhatIfLabView />;
      case 'goals':
        return <GoalStrategyView />;
      case 'conflicts':
        return <GoalConflictsView />;
      case 'adaptive_plan':
        return <AdaptivePlanView />;
      case 'journal':
        return <OutcomeJournalView />;
      case 'progress':
        return <ProgressView />;
      case 'coach':
        return <AiCoachView />;
      case 'history':
        return <RecommendationHistoryView />;
      case 'evaluation':
        return <EvaluationView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <TodayView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-200 flex">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Header */}
        <Header setMobileOpen={setMobileOpen} />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ErrorBoundary key={activeModule}>
            {renderModule()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Onboarding Guide for New Accounts */}
      <OnboardingModal />
    </div>
  );
};

export default function App() {
  return (
    <HealthPilotProvider>
      <MainContent />
    </HealthPilotProvider>
  );
}
