import React, { useState } from 'react';
import { HealthPilotProvider, useHealthPilot } from './context/HealthPilotContext.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { Header } from './components/layout/Header.js';
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

const MainContent: React.FC = () => {
  const { activeModule } = useHealthPilot();
  const [mobileOpen, setMobileOpen] = useState(false);

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
          {renderModule()}
        </main>
      </div>
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
