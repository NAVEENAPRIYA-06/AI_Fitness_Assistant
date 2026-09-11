export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | 'athlete';
  healthConditions: string[];
  fitnessGoals: string[];
  nutritionGoals: string[];
  activityPreferences: string[];
  preferredWorkoutTypes: string[];
  preferredEnvironment: 'home' | 'gym' | 'outdoor' | 'flexible';
  availableEquipment: string[];
}

export interface DailyContext {
  id: string;
  _id?: string;
  userId?: string;
  date: string;
  
  // Physical / Recovery
  sleepHours: number; // alias: sleepDuration
  sleepDuration?: number;
  sleepQuality: number; // 1-10
  energyLevel: number; // 1-10, alias: energy
  energy?: number;
  fatigueLevel: number; // 1-10, alias: fatigue
  fatigue?: number;
  sorenessLevel: number; // 1-10, alias: soreness
  soreness?: number;
  recoveryScore: number; // 0-100 system estimate (derived)
  recoveryStatus?: 'good' | 'moderate' | 'low';

  // Mental / Lifestyle
  stressLevel: number; // 1-10, alias: stress
  stress?: number;
  mood?: 'great' | 'good' | 'neutral' | 'low' | 'anxious' | 'fatigued' | string;
  cognitiveLoad?: number; // 1-10

  // Availability
  availableMinutes: number;
  preferredTime?: 'morning' | 'afternoon' | 'evening';

  // Environment & Equipment
  environment: 'home' | 'gym' | 'outdoor' | 'travel' | 'other';
  equipmentAvailable: string[]; // alias: equipment
  equipment?: string[];

  // Preferences
  currentPreferences?: string; // qualitative notes or daily preference
  activityPreference?: string; // preferred activity/workout type
  currentPreferenceNote?: string;
  hydrationLiters?: number;
  notes?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface EvolvingUserState {
  // Dimension 1: Physiological & Recovery Estimates (System Estimates, NOT medical)
  recoveryReadiness: number; // 0-100 system estimate
  recoveryLevel?: 'good' | 'moderate' | 'low';
  physicalStrainScore: number; // 0-100 system estimate

  // Dimension 2: Subjective Energy & Fatigue States
  energyState?: 'high' | 'moderate' | 'low';
  energyLevel?: number; // 1-10
  fatigueState?: 'high' | 'moderate' | 'low';
  fatigueLevel?: number; // 1-10

  // Dimension 3: Stress & Cognitive Load
  stressState?: 'high' | 'moderate' | 'low';
  stressLevel?: number; // 1-10
  cognitiveLoad: number; // 0-100 system estimate

  // Dimension 4: Behavioral Momentum & Adherence Track
  behavioralMomentum: number; // 0-100
  behavioralMomentumLabel?: 'Strong' | 'Moderate' | 'Low';
  behavioralMomentumRationale?: string;
  weeklyAdherenceRate: number; // percentage
  recentCompletionRatio?: string; // e.g. "8/10 completed"
  dominantBarrier: string;
  adaptationStatus: 'primed' | 'steady' | 'fatigued' | 'overreaching' | 'recovery_needed';

  // Dimension 5: Operational Availability & Environment Constraints
  availableMinutes?: number;
  currentEnvironment?: string;
  preferredTimeOfDay?: string;
  availableEquipmentCount?: number;

  // Dimension 6: Goal Priorities & Conflict Awareness
  primaryGoalTitle?: string;
  activeGoalConflictsCount?: number;
  hasGoalConflict?: boolean;
  goalConflictSummary?: string;

  // Explanation & Transparency
  stateExplanation?: string;
  isSystemEstimate?: boolean; // always true
  lastUpdated: string;
}

export interface ExplainabilityFactor {
  feature: string;
  impactScore: number; // negative or positive weight (-1.0 to +1.0)
  direction: 'increases_adherence' | 'decreases_adherence' | 'neutral';
  explanation: string;
  rawFeature?: string;
  rawValue?: any;
  shapValue?: number;
  isGenuineShap?: boolean;
}

export interface ShapContributionItem {
  feature: string;
  displayName: string;
  value: any;
  shapValue: number;
  direction: 'positive' | 'negative';
  humanExplanation: string;
  impactScore: number;
}

export interface ShapExplanationData {
  prediction: number;
  predictedAdherence: number;
  predictedClass: string;
  model: string;
  modelVersion: string;
  explanationMethod: string;
  isGenuineShap: boolean;
  explanationStatus: string;
  baseValue?: number | null;
  features: Record<string, any>;
  contributions: ShapContributionItem[];
  topPositiveFactors: ShapContributionItem[];
  topNegativeFactors: ShapContributionItem[];
  topPositiveSummaries: string[];
  topNegativeSummaries: string[];
  disclaimerNotice?: string;
  fallbackReason?: string;
}

export interface DecisionFactorItem {
  factor: 'health_suitability' | 'predicted_adherence' | 'goal_alignment' | 'context_feasibility' | 'behavioral_fit';
  name: string; // e.g. "Health Suitability"
  score: number; // 0-100 score
  scoreDisplay: number; // 0.0 - 1.0 (e.g. 0.82)
  weight: number; // 0.0 - 1.0 (e.g. 0.30)
  weightPercentage: number; // 30%
  contribution: number; // e.g. 24.6%
  reason: string;
  isAttenuated?: boolean;
}

export interface GoalConditionConflict {
  hasConflict: boolean;
  goalName: string;
  conditionDescription: string;
  severity: 'low' | 'moderate' | 'high';
  conflictExplanation: string;
  recommendedResolution: string;
}

export type InterventionActivityType =
  | 'Functional Strength'
  | 'Aerobic Cardio'
  | 'Walking'
  | 'Mobility & Stretching'
  | 'HIIT'
  | 'Yoga'
  | 'Active Recovery'
  | 'Recovery / Rest';

export interface CandidateIntervention {
  id: string;
  activityType: InterventionActivityType;
  title: string;
  durationMinutes: number;
  intensity: 'low' | 'moderate' | 'high';
  environment: 'home' | 'gym' | 'outdoor' | 'any';
  requiredEquipment: string[];
  goalAlignment: string;
  recoveryDemand: 'low' | 'moderate' | 'high' | number;
  description: string;
  targetDomain?: string;
  category?: 'workout' | 'lighter_activity' | 'recovery' | 'nutrition' | 'lifestyle';
}

export interface EvaluatedCandidate extends CandidateIntervention {
  suitabilityScore: number;
  healthSuitabilityScore: number; // backward compatibility alias
  goalAlignmentScore: number;
  behavioralFitScore: number;
  predictedAdherence: number;
  contextFeasibilityScore: number;
  finalDecisionScore: number;
  scoreBreakdown: {
    suitabilityContribution: number;
    goalAlignmentContribution: number;
    behavioralFitContribution: number;
    predictedAdherenceContribution: number;
    contextFeasibilityContribution: number;
  };
  rationale: string;
  suitabilityReasons: string[];
  feasibilityReasons: string[];
  goalReasons: string[];
  behavioralReasons: string[];
  modelSource?: string;
  isModelPlaceholder?: boolean;
  isWinner?: boolean;
}

export type CandidateOption = EvaluatedCandidate;

export interface DecisionScoringWeights {
  suitabilityWeight: number; // default 0.30
  predictedAdherenceWeight: number; // default 0.25
  goalAlignmentWeight: number; // default 0.20
  contextFeasibilityWeight: number; // default 0.15
  behavioralFitWeight: number; // default 0.10
  isBehavioralWeightAttenuated?: boolean;
  attenuationReason?: string;
}

export interface RecommendationExplanation {
  summary: string;
  keyFactors: string[];
  suitabilityExplanation: string;
  behavioralExplanation: string;
  adherenceExplanation: string;
  conflictExplanation?: string;
  tradeoffNotice?: string;
  comparisonVsAlternatives?: string;
  decisionFactors?: DecisionFactorItem[];
  decisionWeightsNotice?: string;
}

export interface TodayRecommendation {
  id: string;
  recommendationId?: string;
  title: string;
  category: 'workout' | 'lighter_activity' | 'recovery' | 'nutrition' | 'lifestyle';
  activityType?: InterventionActivityType;
  selectedIntervention?: CandidateIntervention;
  durationMinutes: number;
  duration?: number;
  intensity: 'low' | 'moderate' | 'high';
  environment: string;
  targetDomain: string;
  predictedAdherence: number;
  healthSuitabilityScore: number; // alias for suitabilityScore
  suitabilityScore?: number;
  goalAlignmentScore?: number;
  behavioralFitScore?: number;
  contextFeasibilityScore?: number;
  finalDecisionScore?: number;
  scoreBreakdown?: {
    suitabilityContribution: number;
    goalAlignmentContribution: number;
    behavioralFitContribution: number;
    predictedAdherenceContribution: number;
    contextFeasibilityContribution: number;
  };
  scoringWeights?: DecisionScoringWeights;
  decisionFactors?: DecisionFactorItem[];
  shapExplanation?: ShapExplanationData;
  whyRecommended: string;
  explanation?: RecommendationExplanation;
  explainabilityFactors: ExplainabilityFactor[];
  goalConflict: GoalConditionConflict;
  alternatives: EvaluatedCandidate[];
  allEvaluatedCandidates?: EvaluatedCandidate[];
  nutritionAction: {
    title: string;
    description: string;
    timing: string;
  };
  recoveryAction: {
    title: string;
    description: string;
  };
  timestamp: string;
  generatedAt?: string;
  modelName?: string;
  modelVersion?: string;
  isBaselineFallback?: boolean;
  modelDataSource?: string;
  dataSourceLabel?: string;
  modelSource?: 'python_scikit_learn_service' | 'empirical_reference_heuristic_baseline';
  isModelPlaceholder?: boolean;
  limitationNotice?: string;
  predictionConfidence?: number;
  predictionConfidenceText?: string;
  predictionSource?: string;
}

export type OutcomeStatus = 'completed' | 'partially_completed' | 'skipped';

export type SkipReason = 
  | 'no_time'
  | 'too_tired'
  | 'too_difficult'
  | 'not_enjoyed'
  | 'equipment_unavailable'
  | 'schedule_changed'
  | 'discomfort'
  | 'other';

export interface RecommendationOutcome {
  id: string;
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
  outcomeStatus: OutcomeStatus;
  actualDurationMinutes: number;
  reasonForSkipOrPartial?: SkipReason;
  userFeedback: string;
  perceivedEffort?: number; // 1-10
  timestamp: string;
}

export interface DurationRangePattern {
  range: string; // '0–15m' | '16–30m' | '31–45m' | '46+m'
  minMinutes: number;
  maxMinutes: number;
  total: number;
  completed: number;
  partial: number;
  skipped: number;
  completionRate: number; // 0-100
}

export interface EnvironmentPattern {
  environment: 'home' | 'gym' | 'outdoor' | 'other';
  label: string;
  total: number;
  completed: number;
  partial: number;
  skipped: number;
  completionRate: number; // 0-100
}

export interface ActivityTypePattern {
  activityType: string;
  total: number;
  completed: number;
  partial: number;
  skipped: number;
  completionRate: number; // 0-100
}

export interface TimeOfDayPattern {
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  label: string;
  total: number;
  completed: number;
  completionRate: number; // 0-100
}

export interface ConditionAssociationItem {
  dimension: 'energy' | 'fatigue' | 'sleep' | 'time' | 'stress';
  label: string;
  conditionA: { label: string; count: number; completionRate: number };
  conditionB: { label: string; count: number; completionRate: number };
  deltaPercent: number;
  associationText: string;
}

export interface PersonalBehavioralProfile {
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
  completionRateOverall: number;
  partialRateOverall: number;
  skipRateOverall: number;
  avgCompletedDurationMinutes: number;
  avgRecommendedDurationMinutes: number;
  learnedInsights: string[];
  keyObservation: string;
}

export interface BehavioralPatternsData {
  durationPatterns: DurationRangePattern[];
  environmentPatterns: EnvironmentPattern[];
  activityPatterns: ActivityTypePattern[];
  timeOfDayPatterns: TimeOfDayPattern[];
  conditionAssociations: ConditionAssociationItem[];
}

export interface BehaviorPatternSummary {
  completionRateOverall: number;
  partialRateOverall?: number;
  skipRateOverall?: number;
  completionRateHome: number;
  completionRateGym: number;
  completionRateOutdoor: number;
  preferredDurationMin: number;
  preferredDurationMax: number;
  preferredWorkoutType: string;
  avgCompletedDurationMinutes?: number;
  avgRecommendedDurationMinutes?: number;
  observationCount?: number;
  dataSufficiency?: 'insufficient' | 'preliminary' | 'moderate' | 'high';
  dataSufficiencyText?: string;
  commonBarriers: {
    reason: SkipReason;
    label: string;
    count: number;
    percentage: number;
  }[];
  successfulConditions: string[];
  skipConditions: string[];
  keyObservation: string;
  profile?: PersonalBehavioralProfile;
  patterns?: BehavioralPatternsData;
}

export interface WhatIfScenarioInput {
  availableMinutes: number;
  energyLevel: number;
  fatigueLevel: number;
  stressLevel: number;
  environment: 'home' | 'gym' | 'outdoor' | 'travel';
  candidateDurationMinutes: number;
  candidateIntensity: 'low' | 'moderate' | 'high';
  // Extended scenario variables
  sleepHours?: number;
  sleepQuality?: number;
  sorenessLevel?: number;
  equipmentAvailable?: string[];
  preferredActivity?: string;
  activityType?: string;
  candidateCategory?: string;
  sensitivityVariable?: string;
}

export interface WhatIfFactorComparison {
  factor: string;
  weight: number;
  weightPercent: string;
  currentScore: number;
  whatIfScore: number;
  delta: number;
  reason: string;
}

export interface WhatIfShapItem {
  feature: string;
  displayName: string;
  value: number | string;
  shapValue: number;
  direction: 'positive' | 'negative' | 'neutral';
  humanExplanation: string;
}

export interface WhatIfCandidateItem {
  id: string;
  title: string;
  activityType: string;
  durationMinutes: number;
  intensity: 'low' | 'moderate' | 'high';
  environment: string;
  predictedAdherence: number;
  finalDecisionScore: number;
  suitabilityScore: number;
  goalAlignmentScore: number;
  contextFeasibilityScore: number;
  behavioralFitScore: number;
  rank: number;
  isRecommended: boolean;
  rankingRationale: string;
}

export interface WhatIfDetectedChange {
  variable: string;
  fromValue: string | number;
  toValue: string | number;
  direction: 'positive' | 'negative' | 'neutral';
  impactExplanation: string;
}

export interface SensitivityDataPoint {
  value: number;
  label: string;
  predictedAdherence: number;
  decisionScore: number;
  recommendedTitle: string;
}

export interface WhatIfScenarioResult {
  simulatedAdherence: number;
  baselineAdherence: number;
  deltaAdherence: number;
  simulatedSuitability: number;
  recommendedAction: string;
  shapExplanations: {
    feature: string;
    delta: number; // attribution weight
    direction: 'positive' | 'negative';
    description: string;
  }[];
  verdict: string;
  // Extended rich fields for Prompt 9
  modelDisclaimer?: string;
  currentRecommendation?: {
    id: string;
    title: string;
    durationMinutes: number;
    intensity: 'low' | 'moderate' | 'high';
    environment: string;
    activityType: string;
    predictedAdherence: number;
    decisionScore: number;
    suitabilityScore: number;
    goalAlignmentScore: number;
    contextFeasibilityScore: number;
    behavioralFitScore: number;
    predictedAdherenceContribution: number;
  };
  whatIfRecommendation?: {
    id: string;
    title: string;
    durationMinutes: number;
    intensity: 'low' | 'moderate' | 'high';
    environment: string;
    activityType: string;
    predictedAdherence: number;
    decisionScore: number;
    suitabilityScore: number;
    goalAlignmentScore: number;
    contextFeasibilityScore: number;
    behavioralFitScore: number;
    predictedAdherenceContribution: number;
  };
  detectedChanges?: WhatIfDetectedChange[];
  shapComparison?: {
    isGenuineShap: boolean;
    explanationStatus: string;
    method: string;
    modelName: string;
    baseValue: number;
    currentTopPositive: WhatIfShapItem[];
    currentTopNegative: WhatIfShapItem[];
    whatIfTopPositive: WhatIfShapItem[];
    whatIfTopNegative: WhatIfShapItem[];
    disclaimer: string;
  };
  fiveFactorComparison?: WhatIfFactorComparison[];
  candidateRankings?: WhatIfCandidateItem[];
  goalConflictAnalysis?: {
    hasConflict: boolean;
    goalTitle: string;
    severity: string;
    explanation: string;
    resolution: string;
    longTermTradeoffNotice: string;
  };
  counterfactualExplanation?: string;
  sensitivityAnalysis?: {
    variable: string;
    label: string;
    points: SensitivityDataPoint[];
  };
  technicalDetails?: {
    modelName: string;
    modelVersion: string;
    timestamp: string;
    explanationMethod: string;
    isGenuineShap: boolean;
    baselineVector: Record<string, any>;
    simulatedVector: Record<string, any>;
    weights: Record<string, number>;
  };
}

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
  targetDate?: string;
}

export interface GoalStrategyItem {
  id: string;
  title: string;
  category: 'endurance' | 'strength' | 'metabolic' | 'sleep' | 'consistency';
  targetDate: string;
  timeframe?: string;
  targetValue?: string;
  currentValue?: string;
  currentProgress: number; // 0-100
  status: 'on_track' | 'needs_adaptation' | 'at_risk';
  priority: 'primary' | 'secondary' | 'supporting';
  conflictStatus: 'none' | 'transient_conflict' | 'blocking';
  activeConflictFlag?: boolean;
  conflictNote?: string;
  strategyAdjustment: string;
  strategyAdjustmentNote?: string;
  milestones?: GoalMilestone[];
}

export interface AdaptivePlanDay {
  id?: string;
  dayOfWeek: string;
  dayName?: string; // alias for display
  date: string;
  title: string;
  plannedSession?: string; // alias for display
  category: 'workout' | 'lighter_activity' | 'recovery' | 'active_rest';
  durationMinutes: number;
  intensity: 'low' | 'moderate' | 'high';
  isAdaptiveAdapted: boolean;
  adaptationReason?: string;
  status: 'scheduled' | 'completed' | 'modified' | 'skipped' | 'adapted';
  originalTitle?: string;
  originalDurationMinutes?: number;
  originalIntensity?: 'low' | 'moderate' | 'high';
  originalCategory?: 'workout' | 'lighter_activity' | 'recovery' | 'active_rest';
  triggeringEvidence?: string;
  evidenceThresholdMet?: boolean;
  goalPreservedTitle?: string;
  adaptationTimestamp?: string;
}

export interface PlanAdaptationEvent {
  id: string;
  timestamp: string;
  dayId: string;
  dayOfWeek: string;
  date: string;
  triggerType: 'fatigue_recovery' | 'time_compression' | 'repeated_skip' | 'environment_friction' | 'adherence_rebound' | 'manual_rebalance';
  triggeringEvidence: string;
  originalSession: {
    title: string;
    durationMinutes: number;
    intensity: 'low' | 'moderate' | 'high';
  };
  adaptedSession: {
    title: string;
    durationMinutes: number;
    intensity: 'low' | 'moderate' | 'high';
  };
  goalPreserved: string;
  status: 'active' | 'superseded';
}

export interface AdaptivePlanPayload {
  days: AdaptivePlanDay[];
  baselineDays: AdaptivePlanDay[];
  adaptationEvents: PlanAdaptationEvent[];
  lastRebalancedAt: string;
  momentumStatus: 'Strong' | 'Moderate' | 'Low';
  momentumScore: number;
  activeAdaptationsCount: number;
  dataSufficiency: 'insufficient' | 'preliminary' | 'moderate' | 'high';
  dataSufficiencyNotice?: string;
}

export interface RecommendationHistoryItem {
  id: string;
  userId?: string;
  recommendationId?: string;
  date?: string;
  timestamp?: string;
  title: string;
  category?: string;
  activityType?: InterventionActivityType;
  durationMinutes: number;
  intensity: 'low' | 'moderate' | 'high';
  environment: string;
  predictedAdherence: number;
  suitability?: number;
  suitabilityScore?: number;
  contextSnapshot?: Partial<DailyContext>;
  whyRecommended?: string;
  adaptationApplied?: string;
  outcome?: {
    outcomeStatus: OutcomeStatus;
    actualDurationMinutes?: number;
    userFeedback?: string;
  };
  goalAlignmentScore?: number;
  behavioralFitScore?: number;
  contextFeasibilityScore?: number;
  finalDecisionScore?: number;
  status: string;
  context?: string;
  rationale?: string;
  explanationSummary?: string;
  goalConsidered?: string;
  conflictStatus?: string;
  alternatives?: EvaluatedCandidate[];
  modelVersion?: string;
  predictionSource?: string;
  outcomeStatus?: OutcomeStatus;
  actualDurationMinutes?: number;
  userFeedback?: string;
}

export interface WhatIfScenarioRecord {
  id: string;
  timestamp: string;
  input: WhatIfScenarioInput;
  result: WhatIfScenarioResult;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  contextRef?: string;
}

export interface AdherencePredictionRecord {
  id: string;
  userId: string;
  recommendationId: string;
  recommendationTitle: string;
  predictionProbability: number; // e.g. 0.78
  predictedAdherence: number; // e.g. 78 (%)
  predictedClass: 0 | 1;
  modelName: string;
  modelVersion: string;
  isBaselineFallback: boolean;
  dataSourceLabel: string;
  featureSnapshot: Record<string, any>;
  predictionTimestamp: string;
  actualOutcomeStatus?: OutcomeStatus;
  actualDurationMinutes?: number;
  limitationNotice?: string;
}

export interface MLModelMetrics {
  sample_count: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number | null;
  brier_score: number;
  confusion_matrix?: number[][];
  class_distribution?: {
    positive_completed: number;
    negative_skipped: number;
  };
  limitation_notice?: string;
}

export interface MLModelComparisonItem {
  model_name: string;
  metrics: MLModelMetrics;
}

export interface MLModelMetadata {
  model_name?: string;
  model_version?: string;
  training_dataset_size?: number;
  data_source?: string;
  training_timestamp?: string;
  feature_list?: string[];
  selected_model_metrics?: MLModelMetrics;
  class_distribution?: {
    completed_positive: number;
    skipped_negative: number;
  };
  model_comparison?: MLModelComparisonItem[];
  selection_rationale?: string;
  limitation_notice?: string;

  // CamelCase alternatives for repo compatibility
  modelName?: string;
  modelVersion?: string;
  algorithmFamily?: string;
  isBaselineFallback?: boolean;
  dataSource?: string;
  trainingSamplesCount?: number;
  evaluationMetrics?: any;
  hyperparameters?: Record<string, any>;
  featureImportances?: Array<{ feature: string; importance: number; direction: string }>;
  trainedAt?: string;
  evaluationSplit?: string;
}

// ==========================================
// SYSTEM EVALUATION & RESEARCH VALIDATION TYPES
// ==========================================

export interface EvaluationDatasetAudit {
  totalUsers: number;
  totalRecommendations: number;
  totalPredictions: number;
  totalOutcomes: number;
  completedOutcomes: number;
  partialOutcomes: number;
  skippedOutcomes: number;
  totalAdaptationEvents: number;
  totalBehavioralObservations: number;
  dataLabel: 'Seed / Demonstration Data' | 'Synthetic Data' | 'User-Generated Data' | 'Imported Research Dataset';
  isPrototype: boolean;
  insufficientDataNotice: string;
}

export interface EvaluationCalibrationBucket {
  bucketRange: string;
  sampleCount: number;
  meanPredictedProbability: number;
  observedCompletionRate: number;
}

export interface EvaluationMLEvaluation {
  sampleCount: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number | null;
  brierScore: number;
  meanAbsoluteError: number;
  confusionMatrix: number[][];
  classDistribution: {
    positiveCompleted: number;
    negativeSkipped: number;
  };
  calibrationBuckets: EvaluationCalibrationBucket[];
  dataLeakageVerification: string;
  limitationNotice: string;
}

export interface EvaluationBaselineComparisonItem {
  modelName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number | null;
  brierScore: number;
  calibrationQuality: string;
  selectionStatus: 'selected' | 'baseline' | 'candidate';
  notes: string;
}

export interface EvaluationPredictionVsActualItem {
  id: string;
  recommendationTitle: string;
  predictedProbability: number;
  predictedAdherence: number;
  actualOutcome: 'completed' | 'partially_completed' | 'skipped';
  isCorrectClass: boolean;
  isFalsePositive: boolean;
  isFalseNegative: boolean;
  contextSummary: string;
  date: string;
}

export interface EvaluationPredictionVsActual {
  totalPairs: number;
  correctPredictions: number;
  incorrectPredictions: number;
  falsePositives: number;
  falseNegatives: number;
  nonMedicalDisclaimer: string;
  items: EvaluationPredictionVsActualItem[];
}

export interface EvaluationDimensionBreakdown {
  dimension: string;
  category: string;
  totalAssigned: number;
  completedCount: number;
  completionRate: number;
}

export interface EvaluationRecommendationOutcomes {
  overallCompletionRate: number;
  partialRate: number;
  skipRate: number;
  avgCompletedDuration: number;
  avgRecommendedDuration: number;
  durationBreakdown: EvaluationDimensionBreakdown[];
  environmentBreakdown: EvaluationDimensionBreakdown[];
  activityTypeBreakdown: EvaluationDimensionBreakdown[];
  contextConditionBreakdown: EvaluationDimensionBreakdown[];
  observationalNotice: string;
}

export interface EvaluationFeedbackLoop {
  preAdaptationCompletionRate: number | null;
  postAdaptationCompletionRate: number | null;
  adaptationSampleCount: number;
  commonBarriers: Array<{ barrier: string; count: number }>;
  avgRecommendedDurationPre: number;
  avgRecommendedDurationPost: number;
  sufficiencyNotice: string;
}

export interface EvaluationAdaptationAuditItem {
  id: string;
  eventTitle: string;
  triggerEvidence: string;
  previousPlan: string;
  adaptedPlan: string;
  outcomeAfterAdaptation: string;
  goalPreserved: string;
  adaptationRule: string;
  isIsolatedIncident: boolean;
}

export interface EvaluationBehavioralMomentum {
  currentMomentumScore: number;
  momentumLabel: string;
  recentCompletionRatio: string;
  partialRatio: string;
  skipRatio: string;
  subsequentCompletionRate: number;
  indicatorDisclaimer: string;
}

export interface EvaluationWhatIfConsistencyResult {
  scenarioName: string;
  inputDifference: string;
  predictionChanged: boolean;
  shapRecalculated: boolean;
  factorsRecalculated: boolean;
  rankingChanged: boolean;
  status: 'passed' | 'failed';
  notes: string;
}

export interface EvaluationWhatIfConsistency {
  scenariosTested: number;
  scenariosPassed: number;
  zeroStateMutationVerified: boolean;
  planUnchangedVerified: boolean;
  journalUnchangedVerified: boolean;
  testResults: EvaluationWhatIfConsistencyResult[];
}

export interface EvaluationXaiVerification {
  modelFeaturesVerified: boolean;
  attributionSumsConsistent: boolean;
  positiveNegativeDistinct: boolean;
  genuineVsFallbackLabelled: boolean;
  nonCausalLanguageVerified: boolean;
  modelVersionDisplayed: string;
  technicalVerificationStatus: string;
}

export interface EvaluationDecisionEngine {
  fiveFactorWeightsVerified: boolean;
  summedContributionsExact: boolean;
  highestAdherenceNotAlwaysTopVerified: boolean;
  highAdherencePoorGoalRejectedVerified: boolean;
  acuteConflictHandledSafelyVerified: boolean;
  sampleScoringDemonstration: {
    interventionTitle: string;
    suitability: number;
    adherence: number;
    goalAlignment: number;
    feasibility: number;
    behavioralFit: number;
    weightedScore: number;
    explanation: string;
  };
}

export interface EvaluationSystemPerformance {
  apiPingLatencyMs: number;
  mlPredictionLatencyMs: number;
  shapExplainerLatencyMs: number;
  whatIfSimulationLatencyMs: number;
  decisionEngineLatencyMs: number;
  frontendBuildStatus: string;
  measurementTimestamp: string;
}

export interface EvaluationReliabilityTest {
  name: string;
  category: string;
  testedBehavior: string;
  status: 'passed' | 'failed';
  latencyMs?: number;
  details: string;
}

export interface SystemEvaluationReport {
  generatedAt: string;
  datasetAudit: EvaluationDatasetAudit;
  mlEvaluation: EvaluationMLEvaluation;
  baselineComparison: EvaluationBaselineComparisonItem[];
  predictionVsActual: EvaluationPredictionVsActual;
  recommendationOutcomes: EvaluationRecommendationOutcomes;
  feedbackLoop: EvaluationFeedbackLoop;
  adaptationAudit: EvaluationAdaptationAuditItem[];
  behavioralMomentum: EvaluationBehavioralMomentum;
  whatIfConsistency: EvaluationWhatIfConsistency;
  xaiVerification: EvaluationXaiVerification;
  decisionEngine: EvaluationDecisionEngine;
  systemPerformance: EvaluationSystemPerformance;
  reliabilityTests: EvaluationReliabilityTest[];
  researchLimitations: string[];
}



