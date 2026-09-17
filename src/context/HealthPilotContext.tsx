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
  initialAdaptivePlan,
  initialOutcomes,
  initialRecommendationHistory
} from '../data/seedData.js';

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: string;
  onboardingComplete: boolean;
}

interface HealthPilotContextType {
  activeModule: string;
  setActiveModule: (module: string) => void;
  currentUser: CurrentUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isOnboardingModalOpen: boolean;
  setIsOnboardingModalOpen: (open: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginDemo: () => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  completeOnboarding: (profileData: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
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
  // Browser opens/reloads -> Always start unauthenticated to show Authentication Landing Page
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState<boolean>(false);
  const [activeModule, setActiveModule] = useState<string>('today');
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [context, setContext] = useState<DailyContext | null>(initialContext);
  const [contextHistory, setContextHistory] = useState<DailyContext[]>([]);
  const [evolvingState, setEvolvingState] = useState<EvolvingUserState | null>(initialEvolvingState);
  const [recommendation, setRecommendation] = useState<TodayRecommendation | null>(initialRecommendation);
  const [recommendationHistory, setRecommendationHistory] = useState<RecommendationHistoryItem[]>(initialRecommendationHistory);
  const [outcomes, setOutcomes] = useState<RecommendationOutcome[]>(initialOutcomes);
  const [behaviorSummary, setBehaviorSummary] = useState<BehaviorPatternSummary | null>(initialBehaviorSummary);
  const [goals, setGoals] = useState<GoalStrategyItem[]>([]);
  const [adaptivePlan, setAdaptivePlan] = useState<AdaptivePlanDay[]>(initialAdaptivePlan);
  const [adaptivePlanPayload, setAdaptivePlanPayload] = useState<AdaptivePlanPayload | null>({
    days: initialAdaptivePlan,
    adaptationEvents: [],
    activeAdaptationsCount: 1,
    lastRebalanced: new Date().toISOString()
  });
  const [isRebalancingPlan, setIsRebalancingPlan] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [mlModelMetadata, setMLModelMetadata] = useState<MLModelMetadata | null>(null);
  const [predictionRecords, setPredictionRecords] = useState<AdherencePredictionRecord[]>([]);
  const [isTrainingML, setIsTrainingML] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSavingContext, setIsSavingContext] = useState<boolean>(false);
  const [isSubmittingOutcome, setIsSubmittingOutcome] = useState<boolean>(false);
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, [token]);

  const authFetch = useCallback((url: string, options: RequestInit = {}) => {
    const headers = {
      ...getAuthHeaders(),
      ...(options.headers || {})
    };
    return fetch(url, { ...options, headers });
  }, [getAuthHeaders]);

  const fetchContextHistory = useCallback(async () => {
    try {
      const res = await authFetch('/api/context/history');
      if (res.ok) {
        const data = await res.json();
        setContextHistory(data);
      }
    } catch (err) {
      console.error('Error fetching context history:', err);
    }
  }, [authFetch]);

  const fetchRecommendationHistory = useCallback(async () => {
    try {
      const res = await authFetch('/api/recommendations/history');
      if (res.ok) {
        const data = await res.json();
        setRecommendationHistory(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching recommendation history:', err);
    }
  }, [authFetch]);

  const fetchInitialData = useCallback(async (tokenOverride?: string) => {
    const activeToken = tokenOverride || token;
    if (!activeToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const authHeaders = { Authorization: `Bearer ${activeToken}` };
    const authGet = (url: string) => fetch(url, { headers: authHeaders });
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
        authGet('/api/user/profile').then(r => r.json()),
        authGet('/api/context/latest').then(r => r.json()),
        authGet('/api/context/history').then(r => r.json()),
        authGet('/api/state').then(r => r.json()),
        authGet('/api/recommendation/today').then(r => r.json()),
        authGet('/api/outcomes').then(r => r.json()),
        authGet('/api/behavior/insights').then(r => r.json()),
        authGet('/api/goals').then(r => r.json()),
        authGet('/api/plan/adaptive').then(r => r.json()),
        authGet('/api/adaptive-plan').then(r => r.json()).catch(() => null),
        authGet('/api/ml/model').then(r => r.ok ? r.json() : null).catch(() => null),
        authGet('/api/ml/predictions').then(r => r.ok ? r.json() : null).catch(() => null),
        authGet('/api/recommendations/history').then(r => r.ok ? r.json() : []).catch(() => [])
      ]);

      setProfile(profRes && !profRes.error ? profRes : initialProfile);
      setContext(ctxRes && !ctxRes.error && ctxRes.sleepHours !== undefined ? ctxRes : initialContext);
      setContextHistory(Array.isArray(historyRes) ? historyRes : []);
      setEvolvingState(stateRes && !stateRes.error && stateRes.recoveryReadiness !== undefined ? stateRes : initialEvolvingState);
      setRecommendation(recRes && !recRes.error && recRes.title ? recRes : initialRecommendation);
      setOutcomes(Array.isArray(outRes) ? outRes : initialOutcomes);
      setBehaviorSummary(behRes && !behRes.error ? behRes : initialBehaviorSummary);
      setGoals(Array.isArray(goalRes) ? goalRes : []);

      const resolvedDays = Array.isArray(planPayloadRes?.days)
        ? planPayloadRes.days
        : Array.isArray(planRes)
        ? planRes
        : initialAdaptivePlan;

      setAdaptivePlan(resolvedDays);
      if (planPayloadRes && Array.isArray(planPayloadRes.days)) {
        setAdaptivePlanPayload(planPayloadRes);
      } else {
        setAdaptivePlanPayload({
          days: resolvedDays,
          adaptationEvents: [],
          activeAdaptationsCount: resolvedDays.filter((d: any) => d.status === 'adapted').length,
          lastRebalanced: new Date().toISOString()
        });
      }

      if (mlModelRes && !mlModelRes.error) setMLModelMetadata(mlModelRes);
      if (predsRes && Array.isArray(predsRes.predictions)) {
        setPredictionRecords(predsRes.predictions);
      }
      if (Array.isArray(recHistRes)) {
        setRecommendationHistory(recHistRes);
      }

      // Initialize welcome chat with the user's name
      const userName = (profRes && !profRes.error && profRes.name) || (typeof window !== 'undefined' && localStorage.getItem('healthpilot_user') ? JSON.parse(localStorage.getItem('healthpilot_user')!).name : 'there');
      setChatMessages([
        {
          id: 'welcome-msg',
          sender: 'ai',
          text: `Hello ${userName}! I am your HealthPilot AI Coach. I synthesize your personal multi-domain state, daily context, and empirical behavioral patterns. Ask me anything about today's restorative recommendation, goal conflicts, or What-If trade-offs.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error('Error fetching HealthPilot data:', err);
      setError('Could not connect to HealthPilot backend server.');
      // Keep state initialized with reliable data
      setProfile(initialProfile);
      setContext(initialContext);
      setContextHistory([]);
      setEvolvingState(initialEvolvingState);
      setRecommendation(initialRecommendation);
      setGoals([]);
      setAdaptivePlan(initialAdaptivePlan);
      setAdaptivePlanPayload({
        days: initialAdaptivePlan,
        adaptationEvents: [],
        activeAdaptationsCount: 1,
        lastRebalanced: new Date().toISOString()
      });
      setOutcomes(initialOutcomes);
      setBehaviorSummary(initialBehaviorSummary);
    } finally {
      setIsLoading(false);
    }
  }, [authFetch, token]);

  // Session validation on startup:
  // - If user is unauthenticated: remain unauthenticated, showing the Auth Landing Page as the public entry point.
  // - If user is authenticated with a valid token: restore their authenticated session and load their data.
  // - If token is expired or invalid: clear session and return to Auth Landing Page.
  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      try {
        const savedToken = typeof window !== 'undefined' ? localStorage.getItem('healthpilot_jwt_token') : null;
        if (!savedToken) {
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setToken(savedToken);
            setCurrentUser(data.user);
            await fetchInitialData(savedToken);
          }
        } else {
          // Token expired or invalid
          if (typeof window !== 'undefined') {
            localStorage.removeItem('healthpilot_jwt_token');
            localStorage.removeItem('healthpilot_user');
          }
          if (isMounted) {
            setToken(null);
            setCurrentUser(null);
          }
        }
      } catch (err) {
        console.error('Session restoration error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, [fetchInitialData]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Unable to sign in. Please check your email and password.' };
      }
      setToken(data.token);
      setCurrentUser(data.user);
      try {
        localStorage.setItem('healthpilot_jwt_token', data.token);
        localStorage.setItem('healthpilot_user', JSON.stringify(data.user));
      } catch {}
      setIsAuthModalOpen(false);
      setActiveModule('today');
      if (!data.user.onboardingComplete) {
        setIsOnboardingModalOpen(true);
      }
      await fetchInitialData(data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Something went wrong. Please try again.' };
    }
  };

  const loginDemo = async (): Promise<{ success: boolean; error?: string }> => {
    return { success: false, error: 'Demo mode is disabled.' };
  };

  const signup = async (email: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Signup failed. Please try again.' };
      }
      setToken(data.token);
      setCurrentUser(data.user);
      try {
        localStorage.setItem('healthpilot_jwt_token', data.token);
        localStorage.setItem('healthpilot_user', JSON.stringify(data.user));
      } catch {}
      setIsAuthModalOpen(false);
      setActiveModule('today');
      setIsOnboardingModalOpen(true);
      await fetchInitialData(data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Something went wrong. Please try again.' };
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    setProfile(null);
    setContext(null);
    setContextHistory([]);
    setEvolvingState(null);
    setRecommendation(null);
    setRecommendationHistory([]);
    setOutcomes([]);
    setBehaviorSummary(null);
    setGoals([]);
    setAdaptivePlan([]);
    setAdaptivePlanPayload(null);
    setPredictionRecords([]);
    setChatMessages([]);
    setActiveModule('today');
    setIsAuthModalOpen(false);
    setIsOnboardingModalOpen(false);
    try {
      localStorage.removeItem('healthpilot_jwt_token');
      localStorage.removeItem('healthpilot_user');
    } catch {}
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  };

  const completeOnboarding = async (profileData: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await authFetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to complete onboarding' };
      }
      if (currentUser) {
        const updated = { ...currentUser, onboardingComplete: true };
        setCurrentUser(updated);
        localStorage.setItem('healthpilot_user', JSON.stringify(updated));
      }
      setIsOnboardingModalOpen(false);
      await fetchInitialData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error completing onboarding' };
    }
  };

  const refreshAll = async () => {
    await fetchInitialData();
  };

  const updateContext = async (updates: Partial<DailyContext>): Promise<{ success: boolean; error?: string; validationErrors?: Record<string, string> }> => {
    setIsSavingContext(true);
    try {
      const res = await authFetch('/api/context', {
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
      const recRes = await authFetch('/api/recommendation/today').then(r => r.json());
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
      const res = await authFetch(`/api/context/${id}`, {
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
      const recRes = await authFetch('/api/recommendation/today').then(r => r.json());
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
      const res = await authFetch('/api/outcomes', {
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
        authFetch('/api/recommendation/today').then(r => r.json()),
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
      const res = await authFetch('/api/adaptive-plan/rebalance', {
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
      const res = await authFetch('/api/adaptive-plan/reset', {
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
      const res = await authFetch('/api/user/profile', {
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
      const res = await authFetch(`/api/goals/${id}`, {
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
      const res = await authFetch('/api/what-if', {
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
      const res = await authFetch('/api/coach/chat', {
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
      const res = await authFetch('/api/behavior/recalculate', { method: 'POST' });
      const data = await res.json();
      if (data.summary) {
        setBehaviorSummary(data.summary);
      }
      const stateRes = await authFetch('/api/state').then(r => r.json());
      setEvolvingState(stateRes);
    } catch (err) {
      console.error('Error recalculating behavior patterns:', err);
    }
  };

  const fetchMLModel = async () => {
    try {
      const res = await authFetch('/api/ml/model');
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
      const res = await authFetch('/api/ml/predictions');
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

  const generateCustomRecommendation = async (params: { context?: Partial<DailyContext>; weights?: Partial<DecisionScoringWeights> }): Promise<TodayRecommendation> => {
    try {
      const res = await authFetch('/api/recommendations/generate', {
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
      const res = await authFetch('/api/recommendations/evaluate-candidates', {
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
      const res = await authFetch('/api/ml/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataSource })
      });
      const data = await res.json();
      if (data.metadata) {
        setMLModelMetadata(data.metadata);
      }
      await fetchPredictions();
      const recRes = await authFetch('/api/recommendation/today').then(r => r.json());
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
        currentUser,
        token,
        isAuthenticated: !!token || !!currentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isOnboardingModalOpen,
        setIsOnboardingModalOpen,
        login,
        loginDemo,
        signup,
        logout,
        completeOnboarding,
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
