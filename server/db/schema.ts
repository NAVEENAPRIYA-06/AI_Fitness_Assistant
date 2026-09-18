/**
 * MongoDB Data Model Schemas for HealthPilot AI
 * Designed for MongoDB collections:
 * - users
 * - health_profiles
 * - daily_contexts
 * - goals
 * - workouts
 * - nutrition
 * - recovery
 * - recommendations
 * - recommendation_outcomes
 * - behavioral_patterns
 * - adherence_predictions
 * - what_if_scenarios
 */

export interface MongoDocument {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserDoc extends MongoDocument {
  email: string;
  name: string;
  timezone: string;
  role: 'research_participant' | 'user';
}

export interface HealthProfileDoc extends MongoDocument {
  userId: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | 'athlete';
  restingHeartRate: number;
  healthConditions: string[];
  fitnessGoals: string[];
  nutritionGoals: string[];
  activityPreferences: string[];
  preferredWorkoutTypes: string[];
  preferredEnvironment: 'home' | 'gym' | 'outdoor' | 'flexible';
  availableEquipment: string[];
}

export interface DailyContextDoc extends MongoDocument {
  userId: string;
  date: string;
  sleepHours: number;
  sleepDuration?: number;
  sleepQuality: number; // 1-10
  energyLevel: number; // 1-10
  fatigueLevel: number; // 1-10
  stressLevel: number; // 1-10
  sorenessLevel: number; // 1-10
  recoveryScore: number; // 0-100 system estimate
  recoveryStatus?: 'good' | 'moderate' | 'low';
  mood?: string;
  cognitiveLoad?: number; // 1-10
  availableMinutes: number;
  preferredTime?: 'morning' | 'afternoon' | 'evening';
  environment: 'home' | 'gym' | 'outdoor' | 'travel' | 'other';
  equipmentAvailable: string[];
  activityPreference?: string;
  currentPreferences?: string;
  currentPreferenceNote?: string;
  hydrationLiters?: number;
  notes?: string;
}

export interface GoalDoc extends MongoDocument {
  userId: string;
  title: string;
  category: 'endurance' | 'strength' | 'metabolic' | 'sleep' | 'consistency';
  targetMetric?: string;
  targetValue?: string;
  currentValue?: string;
  timeframe?: string;
  currentProgress: number; // 0-100
  targetDate: string;
  priority: 'primary' | 'secondary' | 'supporting';
  status: 'active' | 'paused' | 'achieved';
  currentConflict: boolean;
  conflictDetails?: string;
  strategyAdjustment?: string;
  milestones?: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

export interface RecommendationDoc extends MongoDocument {
  userId: string;
  date: string;
  status: 'active' | 'completed' | 'dismissed' | 'adapted';
  contextSnapshotId?: string;
  primaryIntervention: {
    title: string;
    category: 'workout' | 'lighter_activity' | 'recovery' | 'nutrition' | 'lifestyle';
    durationMinutes: number;
    intensity: 'low' | 'moderate' | 'high';
    environment: string;
    targetDomain: string;
  };
  predictedAdherence: number;
  healthSuitabilityScore: number;
  whyRecommended: string;
  explainabilityAttributions: {
    feature: string;
    impactScore: number;
    direction: 'increases_adherence' | 'decreases_adherence' | 'neutral';
    explanation: string;
  }[];
  conflictIdentified?: {
    goal: string;
    condition: string;
    resolution: string;
  };
  alternatives: {
    title: string;
    category: string;
    durationMinutes: number;
    intensity: string;
    predictedAdherence: number;
    rationale: string;
  }[];
}

export interface RecommendationOutcomeDoc extends MongoDocument {
  userId: string;
  recommendationId: string;
  recommendedActivity: string;
  category: string;
  plannedDurationMinutes: number;
  intensity: 'low' | 'moderate' | 'high';
  contextSnapshot: {
    sleepHours: number;
    energyLevel: number;
    fatigueLevel: number;
    stressLevel: number;
    availableMinutes: number;
    environment: string;
  };
  outcomeStatus: 'completed' | 'partially_completed' | 'skipped';
  actualDurationMinutes: number;
  reasonForSkipOrPartial?: string;
  userFeedback: string;
  perceivedEffort?: number;
}

export interface BehavioralPatternDoc extends MongoDocument {
  userId: string;
  lastAnalyzedAt: string;
  sampleSize: number;
  completionRateOverall: number;
  partialRateOverall: number;
  skipRateOverall: number;
  completionRateHome: number;
  completionRateGym: number;
  completionRateOutdoor: number;
  preferredDurationMin: number;
  preferredDurationMax: number;
  preferredWorkoutType: string;
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening';
  barriersDistribution: {
    reason: string;
    label: string;
    count: number;
    percentage: number;
  }[];
  durationPatterns: {
    range: string;
    minMinutes: number;
    maxMinutes: number;
    total: number;
    completed: number;
    completionRate: number;
  }[];
  environmentPatterns: {
    environment: string;
    total: number;
    completed: number;
    completionRate: number;
  }[];
  activityPatterns: {
    activityType: string;
    total: number;
    completed: number;
    completionRate: number;
  }[];
  contextAssociations: {
    dimension: string;
    label: string;
    conditionA: { label: string; count: number; completionRate: number };
    conditionB: { label: string; count: number; completionRate: number };
    deltaPercent: number;
    associationText: string;
  }[];
  successfulConditions: string[];
  skipConditions: string[];
  keyInsights: string[];
}

export interface BehavioralProfileDoc extends MongoDocument {
  userId: string;
  calculatedAt: string;
  observationCount: number;
  dataSufficiency: 'insufficient' | 'preliminary' | 'moderate' | 'high';
  dataSufficiencyText: string;
  preferredDuration: string;
  preferredEnvironment: string;
  preferredActivity: string;
  preferredTime: string;
  mostFrequentActivity: string;
  highestAdherenceActivity: string;
  mostSkippedActivity: string;
  dominantBarrier: string;
  strongestAdherenceConditions: string[];
  weakAdherenceConditions: string[];
  overallRecentAdherence: number;
  completionRates: {
    overall: number;
    partial: number;
    skip: number;
    home: number;
    gym: number;
    outdoor: number;
  };
  barrierDistribution: {
    reason: string;
    label: string;
    count: number;
    percentage: number;
  }[];
  contextAssociations: {
    dimension: string;
    associationText: string;
  }[];
  insights: string[];
  confidence: string;
}

export interface WhatIfScenarioDoc extends MongoDocument {
  userId: string;
  originalContext: Record<string, any>;
  modifiedContext: Record<string, any>;
  predictedResult: {
    baselineAdherence: number;
    simulatedAdherence: number;
    deltaAdherence: number;
    simulatedSuitability: number;
    verdict: string;
  };
  recommendationChange: {
    recommendedAction: string;
    shapExplanations: {
      feature: string;
      delta: number;
      direction: 'positive' | 'negative';
      description: string;
    }[];
  };
}

export interface RecommendationHistoryDoc extends MongoDocument {
  userId: string;
  recommendationId: string;
  title: string;
  category: string;
  durationMinutes: number;
  intensity: string;
  environment: string;
  contextSnapshot: {
    sleepHours: number;
    energyLevel: number;
    fatigueLevel: number;
    stressLevel: number;
    availableMinutes: number;
    environment: string;
  };
  predictedAdherence: number;
  suitabilityScore: number;
  status: string;
  whyRecommended: string;
  outcome?: {
    outcomeStatus: string;
    actualDurationMinutes: number;
    userFeedback?: string;
  };
  adaptationApplied?: string;
}

export interface AdherencePredictionRecordDoc extends MongoDocument {
  userId: string;
  recommendationId: string;
  recommendationTitle: string;
  predictionProbability: number;
  predictedAdherence: number;
  predictedClass: 0 | 1;
  modelName: string;
  modelVersion: string;
  isBaselineFallback: boolean;
  dataSourceLabel: string;
  featureSnapshot: Record<string, any>;
  predictionTimestamp: string;
  actualOutcomeStatus?: 'completed' | 'partially_completed' | 'skipped';
  actualDurationMinutes?: number;
}

export interface MLModelMetadataDoc extends MongoDocument {
  model_name: string;
  model_version: string;
  training_dataset_size: number;
  data_source: string;
  training_timestamp: string;
  feature_list: string[];
  selected_model_metrics: {
    sample_count: number;
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number | null;
    brier_score: number;
    confusion_matrix: number[][];
    class_distribution: { positive_completed: number; negative_skipped: number };
    limitation_notice: string;
  };
  class_distribution: { completed_positive: number; skipped_negative: number };
  model_comparison: Array<{
    model_name: string;
    metrics: {
      sample_count: number;
      accuracy: number;
      precision: number;
      recall: number;
      f1_score: number;
      roc_auc: number | null;
      brier_score: number;
      confusion_matrix: number[][];
      class_distribution: { positive_completed: number; negative_skipped: number };
      limitation_notice: string;
    };
  }>;
  selection_rationale: string;
  limitation_notice: string;
}

