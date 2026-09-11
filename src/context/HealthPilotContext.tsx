import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  DailyContext,
  EvolvingUserState,
  TodayRecommendation,
  RecommendationOutcome,
  BehaviorPatternSummary,
  GoalStrategyItem,
  AdaptivePlanDay,
  AdaptivePlanPayload,
  PlanAdaptationEvent,
  WhatIfScenarioResult,
  ChatMessage,
  MLModelMetadata,
  AdherencePredictionRecord,
  RecommendationHistoryItem,
  CandidateIntervention,
  EvaluatedCandidate,
  DecisionScoringWeights
} from '../types/index.js';
import {
  initialProfile,
  initialContext,
  initialEvolvingState,
  initialRecommendation,
  initialBehaviorSummary,
  initialGoals,
  initialAdaptivePlan,
  initialOutcomes,
  initialRecommendationHistory
} from '../data/seedData.js';

interface HealthPilotContextType {
  activeModule: string;
  setActiveModule: (module: string) => void;
  profile: UserProfile | null;
  context: DailyContext | null;
  contextHistory: DailyContext[];
  evolvingState: EvolvingUserState | null;
  recommendation: TodayRecommendation | null;
  recommendationHistory: RecommendationHistoryItem[];
  outcomes: RecommendationOutcome[];
  behaviorSummary: BehaviorPatternSummary | null;
  goals: GoalStrategyItem[];
  adaptivePlan: AdaptivePlanDay[];
  adaptivePlanPayload: AdaptivePlanPayload | null;
  chatMessages: ChatMessage[];
  mlModelMetadata: MLModelMetadata | null;
  predictionRecords: AdherencePredictionRecord[];
  isLoading: boolean;
  isSavingContext: boolean;
  isSubmittingOutcome: boolean;
  isSendingChat: boolean;
  isTrainingML: boolean;
  isRebalancingPlan: boolean;
  error: string | null;
  refreshAll: () => Promise<void>;
  fetchContextHistory: () => Promise<void>;
  fetchRecommendationHistory: () => Promise<void>;
  generateCustomRecommendation: (params: { context?: Partial<DailyContext>; weights?: Partial<DecisionScoringWeights> }) => Promise<TodayRecommendation>;
  evaluateCandidateMatrix: (params: { candidates?: CandidateIntervention[]; context?: Partial<DailyContext>; weights?: Partial<DecisionScoringWeights> }) => Promise<{ candidates: EvaluatedCandidate[]; weights: DecisionScoringWeights }>;
  updateContext: (updates: Partial<DailyContext>) => Promise<{ success: boolean; error?: string; validationErrors?: Record<string, string> }>;
  updateContextById: (id: string, updates: Partial<DailyContext>) => Promise<{ success: boolean; error?: string; validationErrors?: Record<string, string> }>;
  submitOutcome: (outcome: Omit<RecommendationOutcome, 'id' | 'timestamp'>) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<GoalStrategyItem>) => Promise<void>;
  rebalanceAdaptivePlan: () => Promise<void>;
  resetAdaptivePlan: () => Promise<void>;
  runWhatIfScenario: (simulatedParams: Record<string, any>) => Promise<WhatIfScenarioResult | null>;
  sendCoachMessage: (text: string) => Promise<void>;
  recalculateBehaviorPatterns: () => Promise<void>;
  fetchMLModel: () => Promise<void>;
  fetchPredictions: () => Promise<void>;
  trainMLModels: (dataSource?: string) => Promise<any>;
}

const HealthPilotContext = createContext<HealthPilotContextType | undefined>(undefined);

export const HealthPilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<string>('today');
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [context, setContext] = useState<DailyContext | null>(initialContext);
  const [contextHistory, setContextHistory] = useState<DailyContext[]>([initialContext]);
  const [evolvingState, setEvolvingState] = useState<EvolvingUserState | null>(initialEvolvingState);
  const [recommendation, setRecommendation] = useState<TodayRecommendation | null>(initialRecommendation);
  const [recommendationHistory, setRecommendationHistory] = useState<RecommendationHistoryItem[]>(initialRecommendationHistory);
  const [outcomes, setOutcomes] = useState<RecommendationOutcome[]>(initialOutcomes);
  const [behaviorSummary, setBehaviorSummary] = useState<BehaviorPatternSummary | null>(initialBehaviorSummary);
  const [goals, setGoals] = useState<GoalStrategyItem[]>(initialGoals);
  const [adaptivePlan, setAdaptivePlan] = useState<AdaptivePlanDay[]>(initialAdaptivePlan);
  const [adaptivePlanPayload, setAdaptivePlanPayload] = useState<AdaptivePlanPayload | null>({
    days: initialAdaptivePlan,
    activeAdaptationsCount: initialAdaptivePlan.filter(d => d.status === 'adapted').length,
    lastRebalanced: new Date().toISOString(),
    adaptationEvents: [
      {
        id: 'evt-seed-1',
        timestamp: new Date().toISOString(),
        triggerType: 'short_sleep_high_fatigue',
        description: 'Auto-adapted Monday: shifted 45m Threshold Tempo Run to Tuesday; prescribed 20m Targeted Recovery Flow.',
        affectedDays: ['Monday', 'Tuesday'],
        previousPlanSnippet: 'Monday: 45m Threshold Run | Tuesday: Rest',
        newPlanSnippet: 'Monday: 20m Recovery Flow | Tuesday: 45m Tempo Run',
        confidenceScore: 0.91,
        physiologicalDriver: 'Sleep 5.8h < 6.0h threshold, fatigue index 7/10',
        behavioralDriver: 'Historical completion for mobility is 88% under fatigue vs 32% for tempo'
      }
    ]
  });
  const [isRebalancingPlan, setIsRebalancingPlan] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: 'Hello Alex! I am your HealthPilot AI Coach. I synthesize your evolving multi-domain state, daily context, and empirical behavioral patterns. Today, I noticed your sleep was 5.8 hours with elevated fatigue. Ask me anything about today\'s restorative recommendation, goal conflicts, or What-If trade-offs.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [mlModelMetadata, setMLModelMetadata] = useState<MLModelMetadata | null>(null);
  const [predictionRecords, setPredictionRecords] = useState<AdherencePredictionRecord[]>([]);
  const [isTrainingML, setIsTrainingML] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSavingContext, setIsSavingContext] = useState<boolean>(false);
  const [isSubmittingOutcome, setIsSubmittingOutcome] = useState<boolean>(false);
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContextHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/context/history');
      if (res.ok) {
        const data = await res.json();
        setContextHistory(data);
      }
    } catch (err) {
      console.error('Error fetching context history:', err);
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        profRes,
        ctxRes,
        historyRes,
        stateRes,
        recRes,
        outRes,
        behRes,
        goalRes,
        planRes,
        planPayloadRes,
        mlModelRes,
        predsRes,
        recHistRes
      ] = await Promise.all([
        fetch('/api/user/profile').then(r => r.json()),
        fetch('/api/context/latest').then(r => r.json()),
        fetch('/api/context/history').then(r => r.json()),
        fetch('/api/state').then(r => r.json()),
        fetch('/api/recommendation/today').then(r => r.json()),
        fetch('/api/outcomes').then(r => r.json()),
        fetch('/api/behavior/insights').then(r => r.json()),
        fetch('/api/goals').then(r => r.json()),
        fetch('/api/plan/adaptive').then(r => r.json()),
        fetch('/api/adaptive-plan').then(r => r.json()).catch(() => null),
        fetch('/api/ml/model').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/ml/predictions').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/recommendations/history').then(r => r.ok ? r.json() : []).catch(() => [])
      ]);

      setProfile(profRes);
      setContext(ctxRes);
      setContextHistory(Array.isArray(historyRes) ? historyRes : []);
      setEvolvingState(stateRes);
      setRecommendation(recRes);
      setOutcomes(outRes);
      setBehaviorSummary(behRes);
      setGoals(goalRes);
      if (planPayloadRes) {
        setAdaptivePlanPayload(planPayloadRes);
        setAdaptivePlan(planPayloadRes.days || planRes);
      } else {
        setAdaptivePlan(planRes);
      }
      if (mlModelRes) setMLModelMetadata(mlModelRes);
      if (predsRes && Array.isArray(predsRes.predictions)) {
        setPredictionRecords(predsRes.predictions);
      }
      if (Array.isArray(recHistRes)) {
        setRecommendationHistory(recHistRes);
      }
    } catch (err: any) {
      console.error('Error fetching HealthPilot data:', err);
      setError('Could not connect to HealthPilot backend server. Running in fallback mode.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const refreshAll = async () => {
    await fetchInitialData();
  };

  const updateContext = async (updates: Partial<DailyContext>): Promise<{ success: boolean; error?: string; validationErrors?: Record<string, string> }> => {
    setIsSavingContext(true);
    try {
      const res = await fetch('/api/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'Validation error',
          validationErrors: data.validationErrors
        };
      }

      setContext(data.context);
      setEvolvingState(data.evolvingState);

      // Refresh history list
      await fetchContextHistory();

      // Re-fetch today's recommendation as context changed
      const recRes = await fetch('/api/recommendation/today').then(r => r.json());
      setRecommendation(recRes);

      return { success: true };
    } catch (err: any) {
      console.error('Error updating daily context:', err);
      return { success: false, error: err.message || 'Network error updating daily context.' };
    } finally {
      setIsSavingContext(false);
    }
  };

  const updateContextById = async (id: string, updates: Partial<DailyContext>): Promise<{ success: boolean; error?: string; validationErrors?: Record<string, string> }> => {
    setIsSavingContext(true);
    try {
      const res = await fetch(`/api/context/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'Validation error',
          validationErrors: data.validationErrors
        };
      }

      setContext(data.context);
      setEvolvingState(data.evolvingState);

      // Refresh history list
      await fetchContextHistory();

      // Re-fetch today's recommendation as context changed
      const recRes = await fetch('/api/recommendation/today').then(r => r.json());
      setRecommendation(recRes);

      return { success: true };
    } catch (err: any) {
      console.error('Error updating daily context by id:', err);
      return { success: false, error: err.message || 'Network error updating daily context.' };
    } finally {
      setIsSavingContext(false);
    }
  };

  const submitOutcome = async (outcomeData: Omit<RecommendationOutcome, 'id' | 'timestamp'>) => {
    setIsSubmittingOutcome(true);
    try {
      const res = await fetch('/api/outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outcomeData)
      });
      const data = await res.json();
      setOutcomes(prev => [data.outcome, ...prev]);
      setEvolvingState(data.updatedState);
      setBehaviorSummary(data.behaviorSummary);

      // Update adaptive plan from payload returned by feedback loop
      if (data.adaptivePlanPayload) {
        setAdaptivePlanPayload(data.adaptivePlanPayload);
        if (Array.isArray(data.adaptivePlanPayload.days)) {
          setAdaptivePlan(data.adaptivePlanPayload.days);
        }
      }

      // Refresh recommendation history and today's recommendation
      const [recRes] = await Promise.all([
        fetch('/api/recommendation/today').then(r => r.json()),
        fetchRecommendationHistory()
      ]);
      setRecommendation(recRes);
    } catch (err: any) {
      console.error('Error submitting outcome:', err);
    } finally {
      setIsSubmittingOutcome(false);
    }
  };

  const rebalanceAdaptivePlan = async () => {
    setIsRebalancingPlan(true);
    try {
      const res = await fetch('/api/adaptive-plan/rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.payload) {
        setAdaptivePlanPayload(data.payload);
        if (Array.isArray(data.payload.days)) {
          setAdaptivePlan(data.payload.days);
        }
      }
    } catch (err) {
      console.error('Error rebalancing adaptive plan:', err);
    } finally {
      setIsRebalancingPlan(false);
    }
  };

  const resetAdaptivePlan = async () => {
    setIsRebalancingPlan(true);
    try {
      const res = await fetch('/api/adaptive-plan/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.payload) {
        setAdaptivePlanPayload(data.payload);
        if (Array.isArray(data.payload.days)) {
          setAdaptivePlan(data.payload.days);
        }
      }
    } catch (err) {
      console.error('Error resetting adaptive plan:', err);
    } finally {
      setIsRebalancingPlan(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      setProfile(data);
    } catch (err: any) {
      console.error('Error updating profile:', err);
    }
  };

  const updateGoal = async (id: string, updates: Partial<GoalStrategyItem>) => {
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      setGoals(prev => prev.map(g => g.id === id ? data : g));
    } catch (err: any) {
      console.error('Error updating goal:', err);
    }
  };

  const runWhatIfScenario = async (simulatedParams: Record<string, any>): Promise<WhatIfScenarioResult | null> => {
    try {
      const res = await fetch('/api/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simulatedParams)
      });
      return await res.json();
    } catch (err: any) {
      console.error('Error running What-If scenario:', err);
      return null;
    }
  };

  const sendCoachMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsSendingChat(true);

    try {
      const res = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Error sending chat message:', err);
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'I could not connect to the decision intelligence coach service. Please verify server status.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const recalculateBehaviorPatterns = async () => {
    try {
      const res = await fetch('/api/behavior/recalculate', { method: 'POST' });
      const data = await res.json();
      if (data.summary) {
        setBehaviorSummary(data.summary);
      }
      const stateRes = await fetch('/api/state').then(r => r.json());
      setEvolvingState(stateRes);
    } catch (err) {
      console.error('Error recalculating behavior patterns:', err);
    }
  };

  const fetchMLModel = async () => {
    try {
      const res = await fetch('/api/ml/model');
      if (res.ok) {
        const data = await res.json();
        setMLModelMetadata(data);
      }
    } catch (err) {
      console.error('Error fetching ML model metadata:', err);
    }
  };

  const fetchPredictions = async () => {
    try {
      const res = await fetch('/api/ml/predictions');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.predictions)) {
          setPredictionRecords(data.predictions);
        }
      }
    } catch (err) {
      console.error('Error fetching predictions:', err);
    }
  };

  const fetchRecommendationHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/recommendations/history');
      if (res.ok) {
        const data = await res.json();
        setRecommendationHistory(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching recommendation history:', err);
    }
  }, []);

  const generateCustomRecommendation = async (params: { context?: Partial<DailyContext>; weights?: Partial<DecisionScoringWeights> }): Promise<TodayRecommendation> => {
    try {
      const res = await fetch('/api/recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      await fetchRecommendationHistory();
      return data;
    } catch (err) {
      console.error('Error generating custom recommendation:', err);
      throw err;
    }
  };

  const evaluateCandidateMatrix = async (params: { candidates?: CandidateIntervention[]; context?: Partial<DailyContext>; weights?: Partial<DecisionScoringWeights> }): Promise<{ candidates: EvaluatedCandidate[]; weights: DecisionScoringWeights }> => {
    try {
      const res = await fetch('/api/recommendations/evaluate-candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Error evaluating candidate matrix:', err);
      throw err;
    }
  };

  const trainMLModels = async (dataSource?: string) => {
    setIsTrainingML(true);
    try {
      const res = await fetch('/api/ml/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataSource })
      });
      const data = await res.json();
      if (data.metadata) {
        setMLModelMetadata(data.metadata);
      }
      await fetchPredictions();
      const recRes = await fetch('/api/recommendation/today').then(r => r.json());
      setRecommendation(recRes);
      await fetchRecommendationHistory();
      return data;
    } catch (err) {
      console.error('Error retraining ML models:', err);
      throw err;
    } finally {
      setIsTrainingML(false);
    }
  };

  return (
    <HealthPilotContext.Provider
      value={{
        activeModule,
        setActiveModule,
        profile,
        context,
        contextHistory,
        evolvingState,
        recommendation,
        recommendationHistory,
        outcomes,
        behaviorSummary,
        goals,
        adaptivePlan,
        adaptivePlanPayload,
        chatMessages,
        mlModelMetadata,
        predictionRecords,
        isLoading,
        isSavingContext,
        isSubmittingOutcome,
        isSendingChat,
        isTrainingML,
        isRebalancingPlan,
        error,
        refreshAll,
        fetchContextHistory,
        fetchRecommendationHistory,
        generateCustomRecommendation,
        evaluateCandidateMatrix,
        updateContext,
        updateContextById,
        submitOutcome,
        updateProfile,
        updateGoal,
        rebalanceAdaptivePlan,
        resetAdaptivePlan,
        runWhatIfScenario,
        sendCoachMessage,
        recalculateBehaviorPatterns,
        fetchMLModel,
        fetchPredictions,
        trainMLModels
      }}
    >
      {children}
    </HealthPilotContext.Provider>
  );
};

export const useHealthPilot = () => {
  const ctx = useContext(HealthPilotContext);
  if (!ctx) {
    throw new Error('useHealthPilot must be used within a HealthPilotProvider');
  }
  return ctx;
};
