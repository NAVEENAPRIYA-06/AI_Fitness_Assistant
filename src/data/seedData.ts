import {
  UserProfile,
  DailyContext,
  EvolvingUserState,
  TodayRecommendation,
  BehaviorPatternSummary,
  GoalStrategyItem,
  AdaptivePlanDay,
  RecommendationOutcome,
  RecommendationHistoryItem,
  AdaptivePlanPayload
} from '../types/index.js';

export const initialProfile: UserProfile = {
  id: 'user-001',
  name: 'Alex Vance',
  age: 32,
  gender: 'Non-binary',
  heightCm: 175,
  weightKg: 71.5,
  bmi: 23.3,
  fitnessLevel: 'intermediate',
  healthConditions: ['Mild lower back tightness after prolonged desk sitting'],
  fitnessGoals: [
    'Improve cardiovascular endurance (10k preparation)',
    'Maintain posterior chain & core strength',
    'Optimize sleep architecture and stress resilience'
  ],
  nutritionGoals: [
    'Consistent hydration (min 2.5L/day)',
    'Adequate protein distribution (~1.6g/kg)',
    'Pre-workout complex carbs'
  ],
  activityPreferences: ['Zone 2 Running', 'Bodyweight HIIT', 'Kettlebell flows', 'Mobility yoga'],
  preferredWorkoutTypes: ['Home functional fitness', 'Short interval training', 'Low-impact active recovery'],
  preferredEnvironment: 'home',
  availableEquipment: ['Adjustable dumbbells', 'Pull-up bar', 'Resistance bands', 'Yoga mat', 'Foam roller']
};

export const initialContext: DailyContext = {
  id: 'ctx-today',
  userId: 'user-001',
  date: new Date().toISOString().split('T')[0],
  sleepHours: 5.8,
  sleepDuration: 5.8,
  sleepQuality: 5,
  energyLevel: 5,
  energy: 5,
  fatigueLevel: 7,
  fatigue: 7,
  stressLevel: 6,
  stress: 6,
  sorenessLevel: 6,
  soreness: 6,
  recoveryScore: 48,
  recoveryStatus: 'low',
  mood: 'fatigued',
  cognitiveLoad: 7,
  availableMinutes: 30,
  preferredTime: 'morning',
  environment: 'home',
  equipmentAvailable: ['Adjustable dumbbells', 'Resistance bands', 'Yoga mat'],
  activityPreference: 'Mobility & Stretching',
  currentPreferences: 'Prefer gentle mobility and light tempo, feel tight from yesterday desk work',
  hydrationLiters: 1.2,
  notes: 'Slightly fragmented sleep due to late work deadline.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const initialEvolvingState: EvolvingUserState = {
  recoveryReadiness: 48,
  recoveryLevel: 'low',
  physicalStrainScore: 68,
  energyState: 'moderate',
  energyLevel: 5,
  fatigueState: 'high',
  fatigueLevel: 7,
  stressState: 'moderate',
  stressLevel: 6,
  cognitiveLoad: 72,
  behavioralMomentum: 74,
  behavioralMomentumLabel: 'Moderate',
  behavioralMomentumRationale: 'Steady routine momentum (74/100) with 8 of 10 recent sessions completed.',
  weeklyAdherenceRate: 78.5,
  recentCompletionRatio: '8/10 completed',
  dominantBarrier: 'Fatigue & Time Crunch',
  adaptationStatus: 'recovery_needed',
  availableMinutes: 30,
  currentEnvironment: 'home',
  preferredTimeOfDay: 'morning',
  availableEquipmentCount: 3,
  primaryGoalTitle: 'Sub-50:00 10K (Endurance)',
  activeGoalConflictsCount: 2,
  hasGoalConflict: true,
  goalConflictSummary: 'Acute physiological fatigue (7/10) and low recovery estimate (48%) conflict with scheduled threshold intervals.',
  stateExplanation: "Today's recovery readiness is estimated at 48% (LOW) with MODERATE energy and MODERATE stress. With 30 min available at home, the decision model prioritizes restorative autonomic down-regulation.",
  isSystemEstimate: true,
  lastUpdated: new Date().toISOString()
};

export const initialRecommendation: TodayRecommendation = {
  id: 'rec-seed-today',
  recommendationId: 'rec-seed-today',
  title: 'Targeted Posterior Chain & Breathwork Recovery Flow',
  category: 'recovery',
  activityType: 'Mobility & Stretching',
  durationMinutes: 20,
  duration: 20,
  intensity: 'low',
  environment: 'home',
  targetDomain: 'Active Recovery & Parasympathetic Down-Regulation',
  predictedAdherence: 88,
  healthSuitabilityScore: 92,
  suitabilityScore: 92,
  goalAlignmentScore: 84,
  behavioralFitScore: 94,
  contextFeasibilityScore: 96,
  finalDecisionScore: 91,
  scoreBreakdown: {
    suitabilityContribution: 27.6,
    goalAlignmentContribution: 16.8,
    behavioralFitContribution: 9.4,
    predictedAdherenceContribution: 22.0,
    contextFeasibilityContribution: 14.4
  },
  whyRecommended: 'Low recovery readiness (48%) and short sleep (5.8h) demand restorative pacing to buffer autonomic fatigue while keeping 7-day adherence consistent.',
  explanation: {
    summary: 'Restorative mobility chosen over high-intensity cardio to prevent overreaching under acute fatigue.',
    keyFactors: [
      'Short sleep duration (<6.0h) triggers elevated cortisol sensitivity',
      'Home environment provides zero-friction execution',
      '20-minute timebox matches energy ceiling without willpower depletion'
    ],
    suitabilityExplanation: 'Gentle spinal decompression down-regulates sympathetic tone without taxing musculoskeletal reserves.',
    behavioralExplanation: 'Empirical outcome records demonstrate 88% completion for 20-min home mobility versus 33% for intense workouts when fatigue is >=7.',
    adherenceExplanation: 'Model predicts an 88% likelihood of full completion under current fatigue and time constraints.'
  },
  explainabilityFactors: [
    {
      feature: 'sleep_hours',
      impactScore: -0.28,
      direction: 'decreases_adherence',
      explanation: 'Short sleep (5.8h) strongly suppresses adherence for high-intensity training.'
    },
    {
      feature: 'is_home_environment',
      impactScore: 0.24,
      direction: 'increases_adherence',
      explanation: 'Executing at home removes commute and equipment friction.'
    },
    {
      feature: 'time_margin_minutes',
      impactScore: 0.22,
      direction: 'increases_adherence',
      explanation: '20-minute session leaves a 10-minute comfort margin in a 30-minute window.'
    },
    {
      feature: 'fatigue_level',
      impactScore: -0.19,
      direction: 'decreases_adherence',
      explanation: 'Subjective fatigue (7/10) favors restorative recovery over heavy loading.'
    }
  ],
  goalConflict: {
    hasConflict: true,
    goalName: 'Sub-50:00 10K (Cardiovascular)',
    conditionDescription: 'Acute sleep deficit (5.8h) and high fatigue (7/10)',
    severity: 'moderate',
    conflictExplanation: 'Scheduled 45m threshold tempo intervals would exacerbate systemic strain and risk overreaching.',
    recommendedResolution: 'Shift threshold intervals to Tuesday upon recovery rebound; complete 20m restorative flow today.'
  },
  alternatives: [
    {
      id: 'alt-1',
      activityType: 'Walking',
      title: 'Gentle 25-Minute Outdoor Parasympathetic Walk',
      durationMinutes: 25,
      intensity: 'low',
      environment: 'outdoor',
      requiredEquipment: [],
      goalAlignment: 'Circadian Light & Low-Impact Aerobic Flow',
      recoveryDemand: 'low',
      description: 'Easy walk in natural sunlight to aid retinal circadian synchronization.',
      suitabilityScore: 84,
      healthSuitabilityScore: 84,
      goalAlignmentScore: 76,
      behavioralFitScore: 82,
      predictedAdherence: 82,
      contextFeasibilityScore: 85,
      finalDecisionScore: 82,
      scoreBreakdown: {
        suitabilityContribution: 25.2,
        goalAlignmentContribution: 15.2,
        behavioralFitContribution: 8.2,
        predictedAdherenceContribution: 20.5,
        contextFeasibilityContribution: 12.8
      },
      rationale: 'Good alternative for circadian reset, slightly higher environmental friction than home.',
      suitabilityReasons: ['Gentle movement supports lymphatic drainage'],
      feasibilityReasons: ['Requires stepping outside'],
      goalReasons: ['Supports general aerobic health'],
      behavioralReasons: ['High adherence in outdoor weather']
    }
  ],
  nutritionAction: {
    title: 'Hydration & Magnesium Glycinate Support',
    description: 'Ensure 500ml water with electrolytes before noon and 300mg magnesium glycinate with dinner.',
    timing: 'Post-flow and evening'
  },
  recoveryAction: {
    title: 'Parasympathetic Box Breathing',
    description: '4-second inhale, 4-second hold, 4-second exhale, 4-second hold for 5 continuous minutes.'
  },
  timestamp: new Date().toISOString()
};

export const initialBehaviorSummary: BehaviorPatternSummary = {
  completionRateOverall: 79,
  partialRateOverall: 14,
  skipRateOverall: 7,
  completionRateHome: 86,
  completionRateGym: 58,
  completionRateOutdoor: 73,
  preferredDurationMin: 20,
  preferredDurationMax: 30,
  preferredWorkoutType: 'Home Mobility & Stretching',
  avgCompletedDurationMinutes: 26,
  avgRecommendedDurationMinutes: 28,
  observationCount: 14,
  dataSufficiency: 'moderate',
  dataSufficiencyText: '14 outcome entries logged across 4 activity domains.',
  commonBarriers: [
    { reason: 'no_time', label: 'Time Crunch / Overrun', count: 5, percentage: 36 },
    { reason: 'too_tired', label: 'Fatigue & Short Sleep', count: 4, percentage: 29 },
    { reason: 'equipment_unavailable', label: 'Equipment Inconvenience', count: 2, percentage: 14 },
    { reason: 'discomfort', label: 'Muscle Tightness / Soreness', count: 2, percentage: 14 },
    { reason: 'other', label: 'Other Friction', count: 1, percentage: 7 }
  ],
  successfulConditions: [
    'Home environment with available minutes >= 25',
    'Morning execution (07:00–09:00)',
    'Recovery sessions when fatigue >= 7'
  ],
  skipConditions: [
    'Gym resistance workouts when sleep < 6h',
    'Sessions exceeding 40 minutes under high stress'
  ],
  keyObservation: 'Highest adherence occurs during 20–30 minute home mobility sessions when feeling tired.'
};

export const initialGoals: GoalStrategyItem[] = [
  {
    id: 'goal-1',
    title: 'Cardiovascular Aerobic Base (10K sub-50 min)',
    category: 'endurance',
    targetDate: '2026-11-15',
    timeframe: '8 Weeks Remaining',
    targetValue: 'Sub-50:00 10K',
    currentValue: '54:20 Pace',
    currentProgress: 64,
    status: 'needs_adaptation',
    priority: 'primary',
    conflictStatus: 'transient_conflict',
    activeConflictFlag: true,
    conflictNote: 'Low sleep recovery (48%) conflicts with scheduled threshold intervals.',
    strategyAdjustment: 'Pivot today to low-intensity restorative mobility; shift threshold work to Tuesday.',
    milestones: [
      { id: 'm1', title: '5K Baseline under 26m', completed: true },
      { id: 'm2', title: 'Zone 2 45-min Continuous Run', completed: true },
      { id: 'm3', title: 'Pace Threshold 4x4 min at 4:55/km', completed: false }
    ]
  },
  {
    id: 'goal-2',
    title: 'Posterior Chain & Core Stability',
    category: 'strength',
    targetDate: '2026-12-01',
    timeframe: '12 Weeks Remaining',
    targetValue: '2x Bodyweight Deadlift',
    currentValue: '1.6x Bodyweight',
    currentProgress: 72,
    status: 'on_track',
    priority: 'secondary',
    conflictStatus: 'none',
    activeConflictFlag: false,
    strategyAdjustment: 'Steady progressive overload with home dumbbell Romanian deadlifts and bird-dogs.',
    milestones: [
      { id: 'm4', title: '3-min Continuous Plank', completed: true },
      { id: 'm5', title: '10 Single-Leg Romanian Deadlifts per leg', completed: true },
      { id: 'm6', title: 'Heavy Kettlebell Clean & Press Progression', completed: false }
    ]
  },
  {
    id: 'goal-3',
    title: 'Sleep Hygiene & Nervous System Recovery',
    category: 'sleep',
    targetDate: '2026-10-30',
    timeframe: '6 Weeks Remaining',
    targetValue: 'Avg 7.5h / 85% Recovery',
    currentValue: '6.2h / 68% Recovery',
    currentProgress: 58,
    status: 'needs_adaptation',
    priority: 'primary',
    conflictStatus: 'transient_conflict',
    activeConflictFlag: true,
    conflictNote: 'Late screen time and work deadlines lowering sleep duration to 5.8h.',
    strategyAdjustment: 'Prescribe evening down-regulation protocol and eliminate late sympathetic nervous stimulation.',
    milestones: [
      { id: 'm7', title: 'Consistent 22:30 Wind-Down for 7 days', completed: false },
      { id: 'm8', title: 'Zero screens 45 min before sleep', completed: true }
    ]
  }
];

export const initialAdaptivePlan: AdaptivePlanDay[] = [
  {
    id: 'plan-day-1',
    dayOfWeek: 'Monday',
    dayName: 'Monday',
    date: 'Today',
    title: '20-Min Restorative Spinal Mobility & Breathwork',
    plannedSession: '20-Min Restorative Spinal Mobility & Breathwork',
    category: 'recovery',
    durationMinutes: 20,
    intensity: 'low',
    isAdaptiveAdapted: true,
    adaptationReason: 'Adapted from high-intensity intervals due to acute sleep deficit (5.8h) and high fatigue.',
    status: 'adapted'
  },
  {
    id: 'plan-day-2',
    dayOfWeek: 'Tuesday',
    dayName: 'Tuesday',
    date: 'Tomorrow',
    title: '25-Min Home Dumbbell Strength (Posterior Focus)',
    plannedSession: '25-Min Home Dumbbell Strength (Posterior Focus)',
    category: 'workout',
    durationMinutes: 25,
    intensity: 'moderate',
    isAdaptiveAdapted: false,
    status: 'scheduled'
  },
  {
    id: 'plan-day-3',
    dayOfWeek: 'Wednesday',
    dayName: 'Wednesday',
    date: 'In 2 days',
    title: '35-Min Aerobic Zone 2 Base Run',
    plannedSession: '35-Min Aerobic Zone 2 Base Run',
    category: 'workout',
    durationMinutes: 35,
    intensity: 'moderate',
    isAdaptiveAdapted: false,
    status: 'scheduled'
  },
  {
    id: 'plan-day-4',
    dayOfWeek: 'Thursday',
    dayName: 'Thursday',
    date: 'In 3 days',
    title: 'Active Rest & Parasympathetic Walk',
    plannedSession: 'Active Rest & Parasympathetic Walk',
    category: 'active_rest',
    durationMinutes: 25,
    intensity: 'low',
    isAdaptiveAdapted: false,
    status: 'scheduled'
  },
  {
    id: 'plan-day-5',
    dayOfWeek: 'Friday',
    dayName: 'Friday',
    date: 'In 4 days',
    title: 'Threshold Pace Intervals (4 x 4 min)',
    plannedSession: 'Threshold Pace Intervals (4 x 4 min)',
    category: 'workout',
    durationMinutes: 35,
    intensity: 'high',
    isAdaptiveAdapted: true,
    adaptationReason: 'Shifted from Monday to allow full recovery buffer.',
    status: 'adapted'
  },
  {
    id: 'plan-day-6',
    dayOfWeek: 'Saturday',
    dayName: 'Saturday',
    date: 'In 5 days',
    title: 'Full Body Functional Kettlebell Circuit',
    plannedSession: 'Full Body Functional Kettlebell Circuit',
    category: 'workout',
    durationMinutes: 30,
    intensity: 'moderate',
    isAdaptiveAdapted: false,
    status: 'scheduled'
  },
  {
    id: 'plan-day-7',
    dayOfWeek: 'Sunday',
    dayName: 'Sunday',
    date: 'In 6 days',
    title: 'Deload & Deep Tissue Recovery Flow',
    plannedSession: 'Deload & Deep Tissue Recovery Flow',
    category: 'recovery',
    durationMinutes: 30,
    intensity: 'low',
    isAdaptiveAdapted: false,
    status: 'scheduled'
  }
];

export const initialOutcomes: RecommendationOutcome[] = [
  {
    id: 'out-14',
    recommendationId: 'rec-14',
    recommendedActivity: '30-Min Zone 2 Jog',
    category: 'workout',
    plannedDurationMinutes: 30,
    intensity: 'moderate',
    contextSnapshot: {
      sleepHours: 7.2,
      energyLevel: 7,
      fatigueLevel: 3,
      stressLevel: 4,
      availableMinutes: 45,
      environment: 'outdoor'
    },
    outcomeStatus: 'completed',
    actualDurationMinutes: 32,
    userFeedback: 'Felt very smooth, breathing stayed steady.',
    perceivedEffort: 5,
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'out-13',
    recommendationId: 'rec-13',
    recommendedActivity: '45-Min Heavy Gym Strength',
    category: 'workout',
    plannedDurationMinutes: 45,
    intensity: 'high',
    contextSnapshot: {
      sleepHours: 5.5,
      energyLevel: 4,
      fatigueLevel: 8,
      stressLevel: 7,
      availableMinutes: 50,
      environment: 'gym'
    },
    outcomeStatus: 'skipped',
    actualDurationMinutes: 0,
    reasonForSkipOrPartial: 'too_tired',
    userFeedback: 'Worked late, felt completely drained. Could not commute to gym.',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'out-12',
    recommendationId: 'rec-12',
    recommendedActivity: '20-Min Home Core & Bands',
    category: 'lighter_activity',
    plannedDurationMinutes: 20,
    intensity: 'low',
    contextSnapshot: {
      sleepHours: 6.0,
      energyLevel: 5,
      fatigueLevel: 6,
      stressLevel: 5,
      availableMinutes: 25,
      environment: 'home'
    },
    outcomeStatus: 'completed',
    actualDurationMinutes: 22,
    userFeedback: 'Quick and manageable, felt good after sitting all day.',
    perceivedEffort: 4,
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

export const initialRecommendationHistory: RecommendationHistoryItem[] = [
  {
    id: 'rec-hist-1',
    date: 'Today, 7:15 AM',
    title: 'Restorative Thoracic Mobility & Deep Decompression',
    durationMinutes: 20,
    intensity: 'low',
    environment: 'home',
    predictedAdherence: 88,
    suitability: 92,
    status: 'Decision Issued (Awaiting Outcome)',
    context: 'Sleep 5.8h • Fatigue 7/10 • Home • 30m Available',
    rationale: 'Acute sleep deficit + high fatigue triggered down-regulation from planned HIIT to preserve weekly momentum.'
  }
];

export const initialAdaptivePlanPayload: AdaptivePlanPayload = {
  days: initialAdaptivePlan,
  baselineDays: initialAdaptivePlan,
  adaptationEvents: [
    {
      id: 'evt-seed-1',
      timestamp: new Date().toISOString(),
      dayId: 'plan-day-1',
      dayOfWeek: 'Monday',
      date: 'Today',
      triggerType: 'fatigue_recovery',
      triggeringEvidence: 'Sleep 5.8h < 6.0h threshold, fatigue index 7/10',
      originalSession: {
        title: '45-Min Threshold Tempo Run',
        durationMinutes: 45,
        intensity: 'high'
      },
      adaptedSession: {
        title: '20-Min Restorative Spinal Mobility & Breathwork',
        durationMinutes: 20,
        intensity: 'low'
      },
      goalPreserved: 'Cardiovascular 10K Base (Intervals shifted to Friday upon recovery rebound)',
      status: 'active'
    }
  ],
  lastRebalancedAt: new Date().toISOString(),
  momentumStatus: 'Moderate',
  momentumScore: 74,
  activeAdaptationsCount: 2,
  dataSufficiency: 'moderate'
};
