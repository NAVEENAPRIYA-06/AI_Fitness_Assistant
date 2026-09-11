import {
  UserProfile,
  DailyContext,
  EvolvingUserState,
  RecommendationOutcome,
  BehaviorPatternSummary,
  GoalStrategyItem,
  AdaptivePlanDay,
  TodayRecommendation,
  RecommendationHistoryItem,
  WhatIfScenarioRecord,
  DurationRangePattern,
  EnvironmentPattern,
  ActivityTypePattern,
  TimeOfDayPattern,
  ConditionAssociationItem,
  PersonalBehavioralProfile,
  BehavioralPatternsData,
  AdherencePredictionRecord,
  MLModelMetadata,
  PlanAdaptationEvent,
  AdaptivePlanPayload
} from '../../src/types/index.js';
import { adaptivePlanEngine } from '../engine/adaptivePlanEngine.js';

/**
 * HealthPilot AI In-Memory Database Repository
 * Features:
 * - Research Baseline Seed Data for cold-start demo execution
 * - Dynamic mutation state that preserves session updates
 * - Dynamic physiological index recalculation (Recovery Score, Cognitive Load, Adaptation Status)
 * - Continuous empirical feedback loop (outcomes update behavioral momentum & adherence rates)
 */
class InMemoryHealthPilotDB {
  // RESEARCH BASELINE SEED DATA: User Profile
  private userProfile: UserProfile = {
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

  // RESEARCH BASELINE SEED DATA: Daily Context History (Dated Records)
  private dailyContextHistory: DailyContext[] = [
    {
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
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ctx-yesterday',
      userId: 'user-001',
      date: '2026-09-06',
      sleepHours: 7.2,
      sleepDuration: 7.2,
      sleepQuality: 7,
      energyLevel: 7,
      energy: 7,
      fatigueLevel: 4,
      fatigue: 4,
      stressLevel: 4,
      stress: 4,
      sorenessLevel: 4,
      soreness: 4,
      recoveryScore: 78,
      recoveryStatus: 'good',
      mood: 'good',
      cognitiveLoad: 4,
      availableMinutes: 40,
      preferredTime: 'morning',
      environment: 'home',
      equipmentAvailable: ['Adjustable dumbbells', 'Resistance bands', 'Pull-up bar', 'Yoga mat'],
      activityPreference: 'Functional Strength',
      currentPreferences: 'Feeling balanced, ready for posterior chain strength tempo.',
      hydrationLiters: 2.4,
      notes: 'Slept soundly, morning energy was prompt.',
      createdAt: '2026-09-06T07:15:00.000Z',
      updatedAt: '2026-09-06T07:15:00.000Z'
    },
    {
      id: 'ctx-d2',
      userId: 'user-001',
      date: '2026-09-05',
      sleepHours: 7.6,
      sleepDuration: 7.6,
      sleepQuality: 8,
      energyLevel: 8,
      energy: 8,
      fatigueLevel: 3,
      fatigue: 3,
      stressLevel: 3,
      stress: 3,
      sorenessLevel: 2,
      soreness: 2,
      recoveryScore: 86,
      recoveryStatus: 'good',
      mood: 'great',
      cognitiveLoad: 3,
      availableMinutes: 50,
      preferredTime: 'morning',
      environment: 'outdoor',
      equipmentAvailable: ['Running shoes', 'GPS watch'],
      activityPreference: 'Aerobic Cardio',
      currentPreferences: 'Clear outdoor weather, ideal for aerobic base jog.',
      hydrationLiters: 2.8,
      notes: 'Full restorative sleep.',
      createdAt: '2026-09-05T06:45:00.000Z',
      updatedAt: '2026-09-05T06:45:00.000Z'
    },
    {
      id: 'ctx-d3',
      userId: 'user-001',
      date: '2026-09-04',
      sleepHours: 6.2,
      sleepDuration: 6.2,
      sleepQuality: 6,
      energyLevel: 6,
      energy: 6,
      fatigueLevel: 6,
      fatigue: 6,
      stressLevel: 6,
      stress: 6,
      sorenessLevel: 4,
      soreness: 4,
      recoveryScore: 60,
      recoveryStatus: 'moderate',
      mood: 'neutral',
      cognitiveLoad: 6,
      availableMinutes: 25,
      preferredTime: 'evening',
      environment: 'gym',
      equipmentAvailable: ['Barbell & Rack', 'Dumbbells', 'Cable machine'],
      activityPreference: 'Functional Strength',
      currentPreferences: 'High time compression, quick upper session.',
      hydrationLiters: 1.8,
      notes: 'Busy workday, squeezed in workout between meetings.',
      createdAt: '2026-09-04T17:30:00.000Z',
      updatedAt: '2026-09-04T17:30:00.000Z'
    },
    {
      id: 'ctx-d4',
      userId: 'user-001',
      date: '2026-09-03',
      sleepHours: 7.0,
      sleepDuration: 7.0,
      sleepQuality: 7,
      energyLevel: 7,
      energy: 7,
      fatigueLevel: 4,
      fatigue: 4,
      stressLevel: 4,
      stress: 4,
      sorenessLevel: 3,
      soreness: 3,
      recoveryScore: 76,
      recoveryStatus: 'good',
      mood: 'good',
      cognitiveLoad: 4,
      availableMinutes: 35,
      preferredTime: 'morning',
      environment: 'home',
      equipmentAvailable: ['Adjustable dumbbells', 'Yoga mat'],
      activityPreference: 'HIIT',
      currentPreferences: 'Good readiness for moderate intervals.',
      hydrationLiters: 2.2,
      notes: 'Steady morning routine.',
      createdAt: '2026-09-03T07:10:00.000Z',
      updatedAt: '2026-09-03T07:10:00.000Z'
    },
    {
      id: 'ctx-d5',
      userId: 'user-001',
      date: '2026-09-02',
      sleepHours: 5.4,
      sleepDuration: 5.4,
      sleepQuality: 4,
      energyLevel: 4,
      energy: 4,
      fatigueLevel: 8,
      fatigue: 8,
      stressLevel: 7,
      stress: 7,
      sorenessLevel: 6,
      soreness: 6,
      recoveryScore: 42,
      recoveryStatus: 'low',
      mood: 'anxious',
      cognitiveLoad: 8,
      availableMinutes: 20,
      preferredTime: 'evening',
      environment: 'home',
      equipmentAvailable: ['Yoga mat', 'Foam roller'],
      activityPreference: 'Mobility & Stretching',
      currentPreferences: 'Stressful product release day, low back tightness.',
      hydrationLiters: 1.4,
      notes: 'Skipped intense session, did 15 min foam roll.',
      createdAt: '2026-09-02T19:00:00.000Z',
      updatedAt: '2026-09-02T19:00:00.000Z'
    },
    {
      id: 'ctx-d6',
      userId: 'user-001',
      date: '2026-09-01',
      sleepHours: 8.0,
      sleepDuration: 8.0,
      sleepQuality: 9,
      energyLevel: 9,
      energy: 9,
      fatigueLevel: 2,
      fatigue: 2,
      stressLevel: 2,
      stress: 2,
      sorenessLevel: 1,
      soreness: 1,
      recoveryScore: 92,
      recoveryStatus: 'good',
      mood: 'great',
      cognitiveLoad: 2,
      availableMinutes: 60,
      preferredTime: 'morning',
      environment: 'outdoor',
      equipmentAvailable: ['Running shoes', 'Resistance bands'],
      activityPreference: 'Aerobic Cardio',
      currentPreferences: 'High readiness, completed full 45m trail run.',
      hydrationLiters: 3.0,
      notes: 'Holiday recovery day.',
      createdAt: '2026-09-01T08:00:00.000Z',
      updatedAt: '2026-09-01T08:00:00.000Z'
    }
  ];

  // RESEARCH BASELINE SEED DATA: Current/Latest Daily Context (Pointer to latest dated record)
  private dailyContext: DailyContext = this.dailyContextHistory[0];

  // RESEARCH BASELINE SEED DATA: Multi-Dimensional Evolving User State
  private evolvingState: EvolvingUserState = {
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
    behavioralMomentumRationale: 'Steady routine momentum (74/100) with 8 of 10 recent sessions completed. Preserving consistency while adapting around high fatigue.',
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
    stateExplanation: "Today's recovery readiness is estimated at 48% (LOW) with MODERATE energy and MODERATE stress. With 30 min available at home, the decision model prioritizes restorative autonomic down-regulation to buffer acute sleep debt.",
    isSystemEstimate: true,
    lastUpdated: new Date().toISOString()
  };

  // RESEARCH BASELINE SEED DATA: Historical Outcomes (Empirical Training & Feedback Set)
  private outcomes: RecommendationOutcome[] = [
    {
      id: 'out-14',
      recommendationId: 'rec-14',
      recommendedActivity: '30-Min Zone 2 Jog',
      category: 'workout',
      plannedDurationMinutes: 30,
      intensity: 'moderate',
      contextSnapshot: { sleepHours: 7.2, energyLevel: 7, fatigueLevel: 3, stressLevel: 4, availableMinutes: 45, environment: 'outdoor' },
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
      contextSnapshot: { sleepHours: 5.5, energyLevel: 4, fatigueLevel: 8, stressLevel: 7, availableMinutes: 50, environment: 'gym' },
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
      contextSnapshot: { sleepHours: 6.0, energyLevel: 5, fatigueLevel: 6, stressLevel: 5, availableMinutes: 25, environment: 'home' },
      outcomeStatus: 'completed',
      actualDurationMinutes: 22,
      userFeedback: 'Great alternative. Hit the spot without causing exhaustion.',
      perceivedEffort: 4,
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'out-11',
      recommendationId: 'rec-11',
      recommendedActivity: '25-Min Dumbbell Circuit',
      category: 'workout',
      plannedDurationMinutes: 25,
      intensity: 'moderate',
      contextSnapshot: { sleepHours: 7.5, energyLevel: 8, fatigueLevel: 3, stressLevel: 3, availableMinutes: 35, environment: 'home' },
      outcomeStatus: 'completed',
      actualDurationMinutes: 26,
      userFeedback: 'Strong workout, completed all rounds.',
      perceivedEffort: 6,
      timestamp: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 'out-10',
      recommendationId: 'rec-10',
      recommendedActivity: '40-Min Outdoor Intervals',
      category: 'workout',
      plannedDurationMinutes: 40,
      intensity: 'high',
      contextSnapshot: { sleepHours: 6.2, energyLevel: 5, fatigueLevel: 6, stressLevel: 6, availableMinutes: 45, environment: 'outdoor' },
      outcomeStatus: 'partially_completed',
      actualDurationMinutes: 20,
      reasonForSkipOrPartial: 'no_time',
      userFeedback: 'Cut short due to sudden work meeting call.',
      perceivedEffort: 7,
      timestamp: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'out-09',
      recommendationId: 'rec-09',
      recommendedActivity: '20-Min Guided Mobility & Foam Roll',
      category: 'recovery',
      plannedDurationMinutes: 20,
      intensity: 'low',
      contextSnapshot: { sleepHours: 5.2, energyLevel: 4, fatigueLevel: 7, stressLevel: 8, availableMinutes: 30, environment: 'home' },
      outcomeStatus: 'completed',
      actualDurationMinutes: 20,
      userFeedback: 'Spine felt so much better afterwards.',
      perceivedEffort: 2,
      timestamp: new Date(Date.now() - 86400000 * 6).toISOString()
    },
    {
      id: 'out-08',
      recommendationId: 'rec-08',
      recommendedActivity: '50-Min Gym Leg Session',
      category: 'workout',
      plannedDurationMinutes: 50,
      intensity: 'high',
      contextSnapshot: { sleepHours: 6.0, energyLevel: 4, fatigueLevel: 8, stressLevel: 6, availableMinutes: 40, environment: 'gym' },
      outcomeStatus: 'skipped',
      actualDurationMinutes: 0,
      reasonForSkipOrPartial: 'schedule_changed',
      userFeedback: 'Did not have travel time to the gym facility.',
      timestamp: new Date(Date.now() - 86400000 * 7).toISOString()
    },
    {
      id: 'out-07',
      recommendationId: 'rec-07',
      recommendedActivity: '25-Min Home Dumbbell Strength',
      category: 'workout',
      plannedDurationMinutes: 25,
      intensity: 'moderate',
      contextSnapshot: { sleepHours: 7.0, energyLevel: 7, fatigueLevel: 4, stressLevel: 4, availableMinutes: 35, environment: 'home' },
      outcomeStatus: 'completed',
      actualDurationMinutes: 25,
      userFeedback: 'Good rhythm, consistent rest intervals.',
      perceivedEffort: 6,
      timestamp: new Date(Date.now() - 86400000 * 8).toISOString()
    },
    {
      id: 'out-06',
      recommendationId: 'rec-06',
      recommendedActivity: '35-Min Aerobic Zone 2 Run',
      category: 'workout',
      plannedDurationMinutes: 35,
      intensity: 'moderate',
      contextSnapshot: { sleepHours: 7.4, energyLevel: 8, fatigueLevel: 3, stressLevel: 3, availableMinutes: 50, environment: 'outdoor' },
      outcomeStatus: 'completed',
      actualDurationMinutes: 36,
      userFeedback: 'Felt very energized, heart rate stayed in Zone 2 throughout.',
      perceivedEffort: 5,
      timestamp: new Date(Date.now() - 86400000 * 9).toISOString()
    },
    {
      id: 'out-05',
      recommendationId: 'rec-05',
      recommendedActivity: '45-Min Heavy Gym Strength',
      category: 'workout',
      plannedDurationMinutes: 45,
      intensity: 'high',
      contextSnapshot: { sleepHours: 5.8, energyLevel: 4, fatigueLevel: 7, stressLevel: 6, availableMinutes: 45, environment: 'gym' },
      outcomeStatus: 'partially_completed',
      actualDurationMinutes: 25,
      reasonForSkipOrPartial: 'too_tired',
      userFeedback: 'Felt heavy and sluggish, stopped after squats to avoid strain.',
      perceivedEffort: 8,
      timestamp: new Date(Date.now() - 86400000 * 10).toISOString()
    },
    {
      id: 'out-04',
      recommendationId: 'rec-04',
      recommendedActivity: '15-Min Active Recovery & Foam Roll',
      category: 'recovery',
      plannedDurationMinutes: 15,
      intensity: 'low',
      contextSnapshot: { sleepHours: 6.0, energyLevel: 5, fatigueLevel: 7, stressLevel: 7, availableMinutes: 20, environment: 'home' },
      outcomeStatus: 'completed',
      actualDurationMinutes: 15,
      userFeedback: 'Short and restorative session, helped lower back tension.',
      perceivedEffort: 2,
      timestamp: new Date(Date.now() - 86400000 * 11).toISOString()
    },
    {
      id: 'out-03',
      recommendationId: 'rec-03',
      recommendedActivity: '30-Min Bodyweight HIIT',
      category: 'workout',
      plannedDurationMinutes: 30,
      intensity: 'high',
      contextSnapshot: { sleepHours: 7.2, energyLevel: 7, fatigueLevel: 4, stressLevel: 4, availableMinutes: 40, environment: 'home' },
      outcomeStatus: 'completed',
      actualDurationMinutes: 30,
      userFeedback: 'High heart rate spikes, finished strong.',
      perceivedEffort: 7,
      timestamp: new Date(Date.now() - 86400000 * 12).toISOString()
    },
    {
      id: 'out-02',
      recommendationId: 'rec-02',
      recommendedActivity: '20-Min Yoga & Thoracic Flow',
      category: 'recovery',
      plannedDurationMinutes: 20,
      intensity: 'low',
      contextSnapshot: { sleepHours: 6.8, energyLevel: 6, fatigueLevel: 5, stressLevel: 5, availableMinutes: 30, environment: 'home' },
      outcomeStatus: 'completed',
      actualDurationMinutes: 20,
      userFeedback: 'Great mobility release for shoulders and hips.',
      perceivedEffort: 3,
      timestamp: new Date(Date.now() - 86400000 * 13).toISOString()
    },
    {
      id: 'out-01',
      recommendationId: 'rec-01',
      recommendedActivity: '45-Min Outdoor Tempo Run',
      category: 'workout',
      plannedDurationMinutes: 45,
      intensity: 'high',
      contextSnapshot: { sleepHours: 6.2, energyLevel: 6, fatigueLevel: 5, stressLevel: 7, availableMinutes: 30, environment: 'outdoor' },
      outcomeStatus: 'skipped',
      actualDurationMinutes: 0,
      reasonForSkipOrPartial: 'no_time',
      userFeedback: 'Had only 30m window before client call; 45m tempo run was impossible to fit.',
      timestamp: new Date(Date.now() - 86400000 * 14).toISOString()
    }
  ];

  // ADHERENCE PREDICTION LEDGER & ML MODEL REGISTRY
  private predictionRecords: AdherencePredictionRecord[] = [
    {
      id: 'pred-today',
      userId: 'user-001',
      recommendationId: 'rec-today',
      recommendationTitle: '20-Min Guided Mobility & Decompression Flow',
      predictionProbability: 0.88,
      predictedAdherence: 88,
      predictedClass: 1,
      modelName: 'Logistic Regression',
      modelVersion: '1.0.0-prototype',
      isBaselineFallback: false,
      dataSourceLabel: 'Demonstration model trained on seed data',
      featureSnapshot: {
        sleep_hours: 5.8,
        energy_level: 5,
        fatigue_level: 7,
        stress_level: 6,
        available_minutes: 35,
        recommended_duration_minutes: 20,
        environment: 'home',
        intensity: 'low'
      },
      predictionTimestamp: new Date().toISOString()
    },
    {
      id: 'pred-13',
      userId: 'user-001',
      recommendationId: 'rec-13',
      recommendationTitle: '45-Min Heavy Gym Strength',
      predictionProbability: 0.28,
      predictedAdherence: 28,
      predictedClass: 0,
      modelName: 'Logistic Regression',
      modelVersion: '1.0.0-prototype',
      isBaselineFallback: false,
      dataSourceLabel: 'Demonstration model trained on seed data',
      featureSnapshot: { sleep_hours: 5.5, energy_level: 4, fatigue_level: 8, stress_level: 7, available_minutes: 50, recommended_duration_minutes: 45, environment: 'gym', intensity: 'high' },
      predictionTimestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      actualOutcomeStatus: 'skipped',
      actualDurationMinutes: 0
    },
    {
      id: 'pred-12',
      userId: 'user-001',
      recommendationId: 'rec-12',
      recommendationTitle: '20-Min Home Core & Bands',
      predictionProbability: 0.84,
      predictedAdherence: 84,
      predictedClass: 1,
      modelName: 'Logistic Regression',
      modelVersion: '1.0.0-prototype',
      isBaselineFallback: false,
      dataSourceLabel: 'Demonstration model trained on seed data',
      featureSnapshot: { sleep_hours: 6.0, energy_level: 5, fatigue_level: 6, stress_level: 5, available_minutes: 25, recommended_duration_minutes: 20, environment: 'home', intensity: 'low' },
      predictionTimestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
      actualOutcomeStatus: 'completed',
      actualDurationMinutes: 22
    },
    {
      id: 'pred-11',
      userId: 'user-001',
      recommendationId: 'rec-11',
      recommendationTitle: '25-Min Dumbbell Circuit',
      predictionProbability: 0.91,
      predictedAdherence: 91,
      predictedClass: 1,
      modelName: 'Logistic Regression',
      modelVersion: '1.0.0-prototype',
      isBaselineFallback: false,
      dataSourceLabel: 'Demonstration model trained on seed data',
      featureSnapshot: { sleep_hours: 7.5, energy_level: 8, fatigue_level: 3, stress_level: 3, available_minutes: 35, recommended_duration_minutes: 25, environment: 'home', intensity: 'moderate' },
      predictionTimestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
      actualOutcomeStatus: 'completed',
      actualDurationMinutes: 26
    },
    {
      id: 'pred-10',
      userId: 'user-001',
      recommendationId: 'rec-10',
      recommendationTitle: '40-Min Outdoor Intervals',
      predictionProbability: 0.44,
      predictedAdherence: 44,
      predictedClass: 0,
      modelName: 'Logistic Regression',
      modelVersion: '1.0.0-prototype',
      isBaselineFallback: false,
      dataSourceLabel: 'Demonstration model trained on seed data',
      featureSnapshot: { sleep_hours: 6.2, energy_level: 5, fatigue_level: 6, stress_level: 6, available_minutes: 45, recommended_duration_minutes: 40, environment: 'outdoor', intensity: 'high' },
      predictionTimestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
      actualOutcomeStatus: 'partially_completed',
      actualDurationMinutes: 20
    },
    {
      id: 'pred-09',
      userId: 'user-001',
      recommendationId: 'rec-09',
      recommendationTitle: '20-Min Guided Mobility & Foam Roll',
      predictionProbability: 0.86,
      predictedAdherence: 86,
      predictedClass: 1,
      modelName: 'Logistic Regression',
      modelVersion: '1.0.0-prototype',
      isBaselineFallback: false,
      dataSourceLabel: 'Demonstration model trained on seed data',
      featureSnapshot: { sleep_hours: 5.2, energy_level: 4, fatigue_level: 7, stress_level: 8, available_minutes: 30, recommended_duration_minutes: 20, environment: 'home', intensity: 'low' },
      predictionTimestamp: new Date(Date.now() - 86400000 * 6).toISOString(),
      actualOutcomeStatus: 'completed',
      actualDurationMinutes: 20
    },
    {
      id: 'pred-08',
      userId: 'user-001',
      recommendationId: 'rec-08',
      recommendationTitle: '50-Min Gym Leg Session',
      predictionProbability: 0.31,
      predictedAdherence: 31,
      predictedClass: 0,
      modelName: 'Logistic Regression',
      modelVersion: '1.0.0-prototype',
      isBaselineFallback: false,
      dataSourceLabel: 'Demonstration model trained on seed data',
      featureSnapshot: { sleep_hours: 6.0, energy_level: 4, fatigue_level: 8, stress_level: 6, available_minutes: 40, recommended_duration_minutes: 50, environment: 'gym', intensity: 'high' },
      predictionTimestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
      actualOutcomeStatus: 'skipped',
      actualDurationMinutes: 0
    },
    {
      id: 'pred-07',
      userId: 'user-001',
      recommendationId: 'rec-07',
      recommendationTitle: '25-Min Home Dumbbell Strength',
      predictionProbability: 0.87,
      predictedAdherence: 87,
      predictedClass: 1,
      modelName: 'Logistic Regression',
      modelVersion: '1.0.0-prototype',
      isBaselineFallback: false,
      dataSourceLabel: 'Demonstration model trained on seed data',
      featureSnapshot: { sleep_hours: 7.0, energy_level: 7, fatigue_level: 4, stress_level: 4, available_minutes: 35, recommended_duration_minutes: 25, environment: 'home', intensity: 'moderate' },
      predictionTimestamp: new Date(Date.now() - 86400000 * 8).toISOString(),
      actualOutcomeStatus: 'completed',
      actualDurationMinutes: 25
    },
    {
      id: 'pred-06',
      userId: 'user-001',
      recommendationId: 'rec-06',
      recommendationTitle: '35-Min Aerobic Zone 2 Run',
      predictionProbability: 0.89,
      predictedAdherence: 89,
      predictedClass: 1,
      modelName: 'Logistic Regression',
      modelVersion: '1.0.0-prototype',
      isBaselineFallback: false,
      dataSourceLabel: 'Demonstration model trained on seed data',
      featureSnapshot: { sleep_hours: 7.4, energy_level: 8, fatigue_level: 3, stress_level: 3, available_minutes: 50, recommended_duration_minutes: 35, environment: 'outdoor', intensity: 'moderate' },
      predictionTimestamp: new Date(Date.now() - 86400000 * 9).toISOString(),
      actualOutcomeStatus: 'completed',
      actualDurationMinutes: 36
    },
    {
      id: 'pred-05',
      userId: 'user-001',
      recommendationId: 'rec-05',
      recommendationTitle: '45-Min Heavy Gym Strength',
      predictionProbability: 0.33,
      predictedAdherence: 33,
      predictedClass: 0,
      modelName: 'Logistic Regression',
      modelVersion: '1.0.0-prototype',
      isBaselineFallback: false,
      dataSourceLabel: 'Demonstration model trained on seed data',
      featureSnapshot: { sleep_hours: 5.8, energy_level: 4, fatigue_level: 7, stress_level: 6, available_minutes: 45, recommended_duration_minutes: 45, environment: 'gym', intensity: 'high' },
      predictionTimestamp: new Date(Date.now() - 86400000 * 10).toISOString(),
      actualOutcomeStatus: 'skipped',
      actualDurationMinutes: 0
    },
    {
      id: 'pred-04',
      userId: 'user-001',
      recommendationId: 'rec-04',
      recommendationTitle: '30-Min High-Rep Dumbbell Circuit',
      predictionProbability: 0.76,
      predictedAdherence: 76,
      predictedClass: 1,
      modelName: 'Logistic Regression',
      modelVersion: '1.0.0-prototype',
      isBaselineFallback: false,
      dataSourceLabel: 'Demonstration model trained on seed data',
      featureSnapshot: { sleep_hours: 6.5, energy_level: 6, fatigue_level: 5, stress_level: 5, available_minutes: 40, recommended_duration_minutes: 30, environment: 'home', intensity: 'moderate' },
      predictionTimestamp: new Date(Date.now() - 86400000 * 11).toISOString(),
      actualOutcomeStatus: 'partially_completed',
      actualDurationMinutes: 18
    },
    {
      id: 'pred-03',
      userId: 'user-001',
      recommendationId: 'rec-03',
      recommendationTitle: '30-Min Cardio Intervals',
      predictionProbability: 0.82,
      predictedAdherence: 82,
      predictedClass: 1,
      modelName: 'Logistic Regression',
      modelVersion: '1.0.0-prototype',
      isBaselineFallback: false,
      dataSourceLabel: 'Demonstration model trained on seed data',
      featureSnapshot: { sleep_hours: 7.2, energy_level: 7, fatigue_level: 4, stress_level: 4, available_minutes: 40, recommended_duration_minutes: 30, environment: 'home', intensity: 'high' },
      predictionTimestamp: new Date(Date.now() - 86400000 * 12).toISOString(),
      actualOutcomeStatus: 'completed',
      actualDurationMinutes: 30
    },
    {
      id: 'pred-02',
      userId: 'user-001',
      recommendationId: 'rec-02',
      recommendationTitle: '20-Min Yoga & Thoracic Flow',
      predictionProbability: 0.93,
      predictedAdherence: 93,
      predictedClass: 1,
      modelName: 'Logistic Regression',
      modelVersion: '1.0.0-prototype',
      isBaselineFallback: false,
      dataSourceLabel: 'Demonstration model trained on seed data',
      featureSnapshot: { sleep_hours: 6.8, energy_level: 6, fatigue_level: 5, stress_level: 5, available_minutes: 30, recommended_duration_minutes: 20, environment: 'home', intensity: 'low' },
      predictionTimestamp: new Date(Date.now() - 86400000 * 13).toISOString(),
      actualOutcomeStatus: 'completed',
      actualDurationMinutes: 20
    },
    {
      id: 'pred-01',
      userId: 'user-001',
      recommendationId: 'rec-01',
      recommendationTitle: '45-Min Outdoor Tempo Run',
      predictionProbability: 0.25,
      predictedAdherence: 25,
      predictedClass: 0,
      modelName: 'Logistic Regression',
      modelVersion: '1.0.0-prototype',
      isBaselineFallback: false,
      dataSourceLabel: 'Demonstration model trained on seed data',
      featureSnapshot: { sleep_hours: 6.2, energy_level: 6, fatigue_level: 5, stress_level: 7, available_minutes: 30, recommended_duration_minutes: 45, environment: 'outdoor', intensity: 'high' },
      predictionTimestamp: new Date(Date.now() - 86400000 * 14).toISOString(),
      actualOutcomeStatus: 'skipped',
      actualDurationMinutes: 0
    }
  ];

  private activeMLModelMetadata: MLModelMetadata | null = {
    modelName: 'Logistic Regression (Calibrated)',
    modelVersion: '1.0.0-prototype',
    algorithmFamily: 'LogisticRegression',
    isBaselineFallback: false,
    dataSource: 'Demonstration model trained on seed data',
    trainingSamplesCount: 14,
    evaluationMetrics: {
      brierScore: 0.1391,
      rocAuc: 0.9000,
      f1Score: 0.8571,
      accuracy: 0.8571,
      precision: 0.8889,
      recall: 0.8889,
      meanAbsoluteError: 15.2,
      accuracyWithin15Percent: 78.6,
      calibrationQuality: 'Well Calibrated (Brier < 0.15)'
    },
    hyperparameters: {
      penalty: 'l2',
      C: 1.0,
      class_weight: 'balanced',
      solver: 'lbfgs'
    },
    featureImportances: [
      { feature: 'time_margin_minutes', importance: 0.32, direction: 'positive' },
      { feature: 'fatigue_level', importance: -0.28, direction: 'negative' },
      { feature: 'is_home_environment', importance: 0.24, direction: 'positive' },
      { feature: 'is_gym_environment', importance: -0.19, direction: 'negative' },
      { feature: 'energy_level', importance: 0.18, direction: 'positive' },
      { feature: 'sleep_hours', importance: 0.15, direction: 'positive' },
      { feature: 'stress_level', importance: -0.12, direction: 'negative' }
    ],
    trainedAt: new Date().toISOString(),
    evaluationSplit: 'Stratified 5-Fold Cross Validation'
  };

  // RESEARCH BASELINE SEED DATA: Goals with Milestones & Conflict Flags
  private goals: GoalStrategyItem[] = [
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
      strategyAdjustment: 'Pivot today to low-intensity restorative mobility; shift threshold work to day after tomorrow upon recovery rebound.',
      strategyAdjustmentNote: 'Acute sleep deficit (5.8h) down-regulated today\'s threshold intervals to preserve nervous system reserve while maintaining training consistency.',
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
      strategyAdjustmentNote: 'Bi-weekly progression progressing on track with home dumbbells and resistance band volume.',
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
      strategyAdjustmentNote: 'Dynamic guardrail: Automatically down-regulates daily training load when sleep is below 6 hours.',
      milestones: [
        { id: 'm7', title: '7 consecutive days with no screen 45m before bed', completed: true },
        { id: 'm8', title: 'Consistent bedtime window (+/- 30 min)', completed: false },
        { id: 'm9', title: 'Sleep efficiency score above 85% for 14 days', completed: false }
      ]
    }
  ];

  // RESEARCH BASELINE SEED DATA: Adaptive Weekly Schedule
  private adaptivePlan: AdaptivePlanDay[] = [
    {
      id: 'plan-day-1',
      dayOfWeek: 'Monday',
      dayName: 'Monday',
      date: '2026-09-07',
      title: '20-Min Restorative Spinal Mobility & Breathwork',
      plannedSession: '20-Min Restorative Spinal Mobility & Breathwork',
      category: 'recovery',
      durationMinutes: 20,
      intensity: 'low',
      isAdaptiveAdapted: true,
      adaptationReason: 'Adapted from high-intensity intervals due to acute sleep deficit (5.8h) and high fatigue.',
      status: 'scheduled'
    },
    {
      id: 'plan-day-2',
      dayOfWeek: 'Tuesday',
      dayName: 'Tuesday',
      date: '2026-09-08',
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
      date: '2026-09-09',
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
      date: '2026-09-10',
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
      date: '2026-09-11',
      title: 'Threshold Pace Intervals (4 x 4 min)',
      plannedSession: 'Threshold Pace Intervals (4 x 4 min)',
      category: 'workout',
      durationMinutes: 35,
      intensity: 'high',
      isAdaptiveAdapted: true,
      adaptationReason: 'Shifted from Monday to allow full recovery buffer.',
      status: 'scheduled'
    },
    {
      id: 'plan-day-6',
      dayOfWeek: 'Saturday',
      dayName: 'Saturday',
      date: '2026-09-12',
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
      date: '2026-09-13',
      title: 'Deload & Deep Tissue Recovery Flow',
      plannedSession: 'Deload & Deep Tissue Recovery Flow',
      category: 'recovery',
      durationMinutes: 30,
      intensity: 'low',
      isAdaptiveAdapted: false,
      status: 'scheduled'
    }
  ];

  // RESEARCH BASELINE SEED DATA: Recommendation History Audit Trail
  private recommendationHistory: RecommendationHistoryItem[] = [
    {
      id: 'rec-hist-1',
      date: 'Today, 7:15 AM',
      title: 'Restorative Thoracic Mobility & Deep Decompression',
      durationMinutes: 20,
      intensity: 'low',
      environment: 'home',
      predictedAdherence: 88,
      suitability: 94,
      status: 'Decision Issued (Awaiting Outcome)',
      context: 'Sleep 5.8h • Fatigue 7/10 • Home • 30m Available',
      rationale: 'Severe sleep deficit + high fatigue triggered down-regulation from planned HIIT.'
    },
    {
      id: 'rec-hist-2',
      date: 'Yesterday, 6:45 AM',
      title: 'Full Body Functional Strength Tempo',
      durationMinutes: 30,
      intensity: 'moderate',
      environment: 'home',
      predictedAdherence: 82,
      suitability: 85,
      status: 'Completed (30m)',
      context: 'Sleep 7.1h • Fatigue 4/10 • Home • 40m Available',
      rationale: 'Good recovery score enabled progressive dumbbell resistance tempo.'
    },
    {
      id: 'rec-hist-3',
      date: '2 Days Ago, 7:00 AM',
      title: 'Aerobic Zone 2 Baseline Jog',
      durationMinutes: 35,
      intensity: 'moderate',
      environment: 'outdoor',
      predictedAdherence: 78,
      suitability: 80,
      status: 'Completed (35m)',
      context: 'Sleep 7.5h • Fatigue 3/10 • Outdoor • 50m Available',
      rationale: 'Cardiovascular aerobic base development.'
    },
    {
      id: 'rec-hist-4',
      date: '3 Days Ago, 6:30 AM',
      title: 'Max Effort Upper Body Hypertrophy',
      durationMinutes: 45,
      intensity: 'high',
      environment: 'gym',
      predictedAdherence: 52,
      suitability: 60,
      status: 'Partially Completed (20m - No Time)',
      context: 'Sleep 6.2h • Fatigue 6/10 • Gym • 25m Available',
      rationale: 'High time compression led to early truncation; system adjusted subsequent rest.'
    }
  ];

  // What-If Counterfactual Logs
  private whatIfScenarios: WhatIfScenarioRecord[] = [];

  // Repository methods
  public getUserProfile(): UserProfile {
    return { ...this.userProfile };
  }

  public updateUserProfile(updates: Partial<UserProfile>): UserProfile {
    this.userProfile = {
      ...this.userProfile,
      ...updates,
      // Recalculate BMI if height/weight changed
      bmi: Number(((updates.weightKg ?? this.userProfile.weightKg) / Math.pow((updates.heightCm ?? this.userProfile.heightCm) / 100, 2)).toFixed(1))
    };
    return { ...this.userProfile };
  }

  /**
   * Transparent System Estimate: Recovery Readiness Calculation
   * Combines sleep duration sufficiency, sleep quality multiplier, and subjective energy readiness,
   * penalized by acute systemic fatigue, stress, and muscle soreness.
   * NOTE: This is an application-level heuristic system estimate, NOT a medically validated physiological measurement.
   */
  public calculateRecoveryEstimate(ctx: {
    sleepHours: number;
    sleepQuality?: number;
    energyLevel: number;
    fatigueLevel: number;
    stressLevel: number;
    sorenessLevel: number;
  }): { score: number; status: 'good' | 'moderate' | 'low' } {
    const sleepHours = Math.max(0, Math.min(24, ctx.sleepHours));
    const quality = ctx.sleepQuality ?? 6;
    const energy = Math.max(1, Math.min(10, ctx.energyLevel));
    const fatigue = Math.max(1, Math.min(10, ctx.fatigueLevel));
    const stress = Math.max(1, Math.min(10, ctx.stressLevel));
    const soreness = Math.max(1, Math.min(10, ctx.sorenessLevel));

    // Baseline sleep ratio against optimal adult baseline of 8.0 hours (capped at 100)
    const sleepRatio = Math.min(100, (sleepHours / 8.0) * 100);
    // Quality multiplier scaling from 0.70 (very poor) to 1.15 (restorative)
    const qualityMultiplier = 0.70 + (quality / 10) * 0.45;
    const effectiveRest = sleepRatio * qualityMultiplier;

    // Energy readiness score (10 to 100)
    const energyScore = energy * 10;

    // Systemic load penalty from fatigue, stress, and muscular soreness
    const systemicPenalty = (fatigue * 4.2 + stress * 3.4 + soreness * 2.4);

    // Composite heuristic: restorative factors minus acute strain factors
    const rawScore = Math.round(0.42 * effectiveRest + 0.38 * energyScore - 0.25 * systemicPenalty + 10);
    const score = Math.max(12, Math.min(98, rawScore));

    let status: 'good' | 'moderate' | 'low' = 'moderate';
    if (score >= 70) {
      status = 'good';
    } else if (score < 48) {
      status = 'low';
    }

    return { score, status };
  }

  /**
   * Recalculates the Multi-Dimensional Evolving User State
   * Synthesizes:
   * A. Stable profile baseline
   * B. Current daily context
   * C. Behavioral momentum & adherence track
   * D. Recent outcomes
   * E. Current goals and conflict flags
   */
  public recalculateEvolvingState(): EvolvingUserState {
    const ctx = this.dailyContext;
    const outcomes = this.outcomes;
    const goals = this.goals;

    // Dimension 1: Physiological & Recovery Estimates
    const { score: recoveryScore, status: recoveryLevel } = this.calculateRecoveryEstimate({
      sleepHours: ctx.sleepHours,
      sleepQuality: ctx.sleepQuality,
      energyLevel: ctx.energyLevel,
      fatigueLevel: ctx.fatigueLevel,
      stressLevel: ctx.stressLevel,
      sorenessLevel: ctx.sorenessLevel
    });

    const physicalStrainScore = Math.min(100, Math.round(ctx.fatigueLevel * 5.5 + ctx.sorenessLevel * 4.5));

    // Dimension 2: Subjective Energy & Fatigue States
    const energyState: 'high' | 'moderate' | 'low' = ctx.energyLevel >= 7 ? 'high' : ctx.energyLevel <= 4 ? 'low' : 'moderate';
    const fatigueState: 'high' | 'moderate' | 'low' = ctx.fatigueLevel >= 7 ? 'high' : ctx.fatigueLevel <= 3 ? 'low' : 'moderate';

    // Dimension 3: Psychological Stress & Cognitive Demand
    const stressState: 'high' | 'moderate' | 'low' = ctx.stressLevel >= 7 ? 'high' : ctx.stressLevel <= 3 ? 'low' : 'moderate';
    const cognitiveLoad = Math.min(100, Math.round(ctx.stressLevel * 8.5 + (ctx.cognitiveLoad ? ctx.cognitiveLoad * 4 : 12)));

    // Dimension 4: Behavioral History & Momentum from Outcomes
    const recentOutcomes = outcomes.slice(0, 10);
    const completedCount = recentOutcomes.filter(o => o.outcomeStatus === 'completed').length;
    const partialCount = recentOutcomes.filter(o => o.outcomeStatus === 'partially_completed').length;
    const weeklyAdherenceRate = recentOutcomes.length > 0 
      ? Math.round(((completedCount + 0.5 * partialCount) / recentOutcomes.length) * 1000) / 10
      : 78.5;

    let momentum = this.evolvingState?.behavioralMomentum ?? 74;
    if (completedCount >= 4) {
      momentum = Math.min(96, momentum + 2);
    }

    // Adaptation Status
    let adaptationStatus: 'primed' | 'steady' | 'fatigued' | 'overreaching' | 'recovery_needed' = 'steady';
    if (recoveryScore < 48 || ctx.fatigueLevel >= 8) {
      adaptationStatus = 'recovery_needed';
    } else if (recoveryScore < 65 || ctx.fatigueLevel >= 6) {
      adaptationStatus = 'fatigued';
    } else if (recoveryScore >= 75 && ctx.energyLevel >= 7) {
      adaptationStatus = 'primed';
    }

    // Dimension 5: Operational Availability & Environment
    const availableMinutes = ctx.availableMinutes;
    const currentEnvironment = ctx.environment;
    const preferredTimeOfDay = ctx.preferredTime || 'morning';
    const availableEquipmentCount = (ctx.equipmentAvailable || []).length;

    // Dimension 6: Goal Priorities & Goal-Condition Awareness
    const primaryGoal = goals.find(g => g.priority === 'primary') || goals[0];
    const activeConflicts = goals.filter(g => g.activeConflictFlag || g.status === 'needs_adaptation');
    const hasGoalConflict = (recoveryScore < 50 || ctx.fatigueLevel >= 7) && primaryGoal?.category === 'endurance';

    let goalConflictSummary = '';
    if (hasGoalConflict) {
      goalConflictSummary = `Acute physiological fatigue (${ctx.fatigueLevel}/10) and low recovery estimate (${recoveryScore}%) conflict with ${primaryGoal?.title || 'primary endurance goal'}.`;
    }

    const stateExplanation = `Today's recovery readiness is estimated at ${recoveryScore}% (${recoveryLevel.toUpperCase()}) with ${energyState.toUpperCase()} energy and ${stressState.toUpperCase()} stress. With ${availableMinutes} min available at ${currentEnvironment}, the decision model will prioritize ${adaptationStatus === 'recovery_needed' ? 'restorative autonomic down-regulation' : 'consistent habit execution'}.`;

    this.evolvingState = {
      recoveryReadiness: recoveryScore,
      recoveryLevel,
      physicalStrainScore,
      energyState,
      energyLevel: ctx.energyLevel,
      fatigueState,
      fatigueLevel: ctx.fatigueLevel,
      stressState,
      stressLevel: ctx.stressLevel,
      cognitiveLoad,
      behavioralMomentum: momentum,
      weeklyAdherenceRate,
      recentCompletionRatio: `${completedCount}/${recentOutcomes.length} completed`,
      dominantBarrier: this.evolvingState?.dominantBarrier || 'Fatigue & Time Crunch',
      adaptationStatus,
      availableMinutes,
      currentEnvironment,
      preferredTimeOfDay,
      availableEquipmentCount,
      primaryGoalTitle: primaryGoal ? primaryGoal.title : 'Sub-50:00 10K (Endurance)',
      activeGoalConflictsCount: activeConflicts.length,
      hasGoalConflict,
      goalConflictSummary,
      stateExplanation,
      isSystemEstimate: true,
      lastUpdated: new Date().toISOString()
    };

    return { ...this.evolvingState };
  }

  public getDailyContext(): DailyContext {
    return { ...this.dailyContext };
  }

  public getLatestDailyContext(): DailyContext {
    return { ...this.dailyContext };
  }

  public getDailyContextHistory(): DailyContext[] {
    return [...this.dailyContextHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getDailyContextById(id: string): DailyContext | null {
    const item = this.dailyContextHistory.find(c => c.id === id || c._id === id);
    return item ? { ...item } : null;
  }

  public saveDailyContext(data: Partial<DailyContext>): DailyContext {
    const targetDate = data.date || new Date().toISOString().split('T')[0];

    // Compute recovery estimate
    const sleep = data.sleepHours ?? data.sleepDuration ?? this.dailyContext.sleepHours;
    const quality = data.sleepQuality ?? this.dailyContext.sleepQuality ?? 6;
    const energy = data.energyLevel ?? data.energy ?? this.dailyContext.energyLevel;
    const fatigue = data.fatigueLevel ?? data.fatigue ?? this.dailyContext.fatigueLevel;
    const stress = data.stressLevel ?? data.stress ?? this.dailyContext.stressLevel;
    const soreness = data.sorenessLevel ?? data.soreness ?? this.dailyContext.sorenessLevel;

    const { score: recoveryScore, status: recoveryStatus } = this.calculateRecoveryEstimate({
      sleepHours: sleep,
      sleepQuality: quality,
      energyLevel: energy,
      fatigueLevel: fatigue,
      stressLevel: stress,
      sorenessLevel: soreness
    });

    const existingIndex = this.dailyContextHistory.findIndex(c => c.date === targetDate);

    let savedRecord: DailyContext;

    if (existingIndex >= 0) {
      savedRecord = {
        ...this.dailyContextHistory[existingIndex],
        ...data,
        date: targetDate,
        sleepHours: sleep,
        sleepDuration: sleep,
        sleepQuality: quality,
        energyLevel: energy,
        energy,
        fatigueLevel: fatigue,
        fatigue,
        stressLevel: stress,
        stress,
        sorenessLevel: soreness,
        soreness,
        recoveryScore,
        recoveryStatus,
        updatedAt: new Date().toISOString()
      };
      this.dailyContextHistory[existingIndex] = savedRecord;
    } else {
      savedRecord = {
        id: `ctx-${Date.now()}`,
        userId: 'user-001',
        date: targetDate,
        sleepHours: sleep,
        sleepDuration: sleep,
        sleepQuality: quality,
        energyLevel: energy,
        energy,
        fatigueLevel: fatigue,
        fatigue,
        stressLevel: stress,
        stress,
        sorenessLevel: soreness,
        soreness,
        recoveryScore,
        recoveryStatus,
        mood: data.mood || 'good',
        cognitiveLoad: data.cognitiveLoad || 5,
        availableMinutes: data.availableMinutes ?? 30,
        preferredTime: data.preferredTime || 'morning',
        environment: data.environment || 'home',
        equipmentAvailable: data.equipmentAvailable || data.equipment || ['Yoga mat'],
        activityPreference: data.activityPreference || 'Functional Strength',
        currentPreferences: data.currentPreferences || '',
        currentPreferenceNote: data.currentPreferenceNote || '',
        hydrationLiters: data.hydrationLiters ?? 1.5,
        notes: data.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.dailyContextHistory.unshift(savedRecord);
    }

    // If target date is today or latest, update this.dailyContext pointer
    const todayStr = new Date().toISOString().split('T')[0];
    if (targetDate === todayStr || existingIndex === 0 || this.dailyContextHistory[0].id === savedRecord.id) {
      this.dailyContext = savedRecord;
      this.recalculateEvolvingState();
    }

    return { ...savedRecord };
  }

  public updateDailyContext(updates: Partial<DailyContext>): DailyContext {
    return this.saveDailyContext(updates);
  }

  public updateDailyContextById(id: string, updates: Partial<DailyContext>): DailyContext | null {
    const idx = this.dailyContextHistory.findIndex(c => c.id === id || c._id === id);
    if (idx === -1) return null;

    const current = this.dailyContextHistory[idx];
    const sleep = updates.sleepHours ?? updates.sleepDuration ?? current.sleepHours;
    const quality = updates.sleepQuality ?? current.sleepQuality;
    const energy = updates.energyLevel ?? updates.energy ?? current.energyLevel;
    const fatigue = updates.fatigueLevel ?? updates.fatigue ?? current.fatigueLevel;
    const stress = updates.stressLevel ?? updates.stress ?? current.stressLevel;
    const soreness = updates.sorenessLevel ?? updates.soreness ?? current.sorenessLevel;

    const { score: recoveryScore, status: recoveryStatus } = this.calculateRecoveryEstimate({
      sleepHours: sleep,
      sleepQuality: quality,
      energyLevel: energy,
      fatigueLevel: fatigue,
      stressLevel: stress,
      sorenessLevel: soreness
    });

    const updatedRecord: DailyContext = {
      ...current,
      ...updates,
      sleepHours: sleep,
      sleepDuration: sleep,
      sleepQuality: quality,
      energyLevel: energy,
      energy,
      fatigueLevel: fatigue,
      fatigue,
      stressLevel: stress,
      stress,
      sorenessLevel: soreness,
      soreness,
      recoveryScore,
      recoveryStatus,
      updatedAt: new Date().toISOString()
    };

    this.dailyContextHistory[idx] = updatedRecord;

    // If updated record is the current active daily context, sync
    if (this.dailyContext.id === id || this.dailyContext.date === updatedRecord.date) {
      this.dailyContext = updatedRecord;
      this.recalculateEvolvingState();
    }

    return { ...updatedRecord };
  }

  public getEvolvingState(): EvolvingUserState {
    return { ...this.evolvingState };
  }

  public getOutcomes(): RecommendationOutcome[] {
    return [...this.outcomes];
  }

  public addOutcome(outcomeData: Omit<RecommendationOutcome, 'id' | 'timestamp'>): RecommendationOutcome {
    const newOutcome: RecommendationOutcome = {
      ...outcomeData,
      id: `out-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    this.outcomes.unshift(newOutcome);

    // Continuous feedback loop: update prediction ledger actual outcome
    const predMatch = this.predictionRecords.find(p => p.recommendationId === outcomeData.recommendationId)
      || this.predictionRecords.find(p => !p.actualOutcomeStatus);
    if (predMatch) {
      predMatch.actualOutcomeStatus = outcomeData.outcomeStatus;
      predMatch.actualDurationMinutes = outcomeData.actualDurationMinutes;
    }

    // Continuous feedback loop: update state and behavioral momentum
    this.updateStateFromOutcome(newOutcome);

    return newOutcome;
  }

  private updateStateFromOutcome(outcome: RecommendationOutcome) {
    const recent = this.outcomes.slice(0, 10);
    const completedCount = recent.filter(o => o.outcomeStatus === 'completed').length;
    const partialCount = recent.filter(o => o.outcomeStatus === 'partially_completed').length;
    const skippedCount = recent.filter(o => o.outcomeStatus === 'skipped').length;
    const rate = Math.round(((completedCount + 0.5 * partialCount) / recent.length) * 100);

    this.evolvingState.weeklyAdherenceRate = rate;
    this.evolvingState.recentCompletionRatio = `${completedCount} of ${recent.length} completed`;
    
    if (outcome.outcomeStatus === 'completed') {
      this.evolvingState.behavioralMomentum = Math.min(100, this.evolvingState.behavioralMomentum + 4);
    } else if (outcome.outcomeStatus === 'partially_completed') {
      this.evolvingState.behavioralMomentum = Math.max(15, this.evolvingState.behavioralMomentum - 2);
      if (outcome.reasonForSkipOrPartial) {
        this.evolvingState.dominantBarrier = outcome.reasonForSkipOrPartial.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    } else if (outcome.outcomeStatus === 'skipped') {
      this.evolvingState.behavioralMomentum = Math.max(15, this.evolvingState.behavioralMomentum - 6);
      if (outcome.reasonForSkipOrPartial) {
        this.evolvingState.dominantBarrier = outcome.reasonForSkipOrPartial.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    }

    const momentumScore = this.evolvingState.behavioralMomentum;
    if (momentumScore >= 75) {
      this.evolvingState.behavioralMomentumLabel = 'Strong';
      this.evolvingState.behavioralMomentumRationale = `Strong follow-through momentum (${momentumScore}/100) across recent sessions (${completedCount}/${recent.length} completed). Target progressive volume is well tolerated.`;
    } else if (momentumScore >= 45) {
      this.evolvingState.behavioralMomentumLabel = 'Moderate';
      this.evolvingState.behavioralMomentumRationale = `Steady routine momentum (${momentumScore}/100). Periodic schedule compressions or fatigue spikes observed; moderate adaptations preserve consistency.`;
    } else {
      this.evolvingState.behavioralMomentumLabel = 'Low';
      this.evolvingState.behavioralMomentumRationale = `Low adherence momentum (${momentumScore}/100) with recent session skips (${skippedCount} skipped). Shorter duration or lower intensity down-regulation recommended.`;
    }

    // Adaptation status
    if (this.evolvingState.recoveryReadiness < 50 || (this.evolvingState.fatigueLevel ?? 5) >= 7) {
      this.evolvingState.adaptationStatus = 'recovery_needed';
    } else if (momentumScore >= 75 && this.evolvingState.recoveryReadiness >= 75) {
      this.evolvingState.adaptationStatus = 'primed';
    } else {
      this.evolvingState.adaptationStatus = 'steady';
    }

    this.evolvingState.lastUpdated = new Date().toISOString();

    // Feedback Loop: Adapt plan based on empirical evidence
    adaptivePlanEngine.recordOutcomeInPlan(outcome);
    adaptivePlanEngine.evaluateAndAdaptPlan(
      this.evolvingState,
      this.outcomes,
      this.userProfile,
      this.getPersonalBehavioralProfile(),
      this.goals
    );
  }

  // ==========================================
  // ADHERENCE PREDICTION & ML MODEL METHODS
  // ==========================================

  public getPredictionRecords(userId: string = 'user-001'): AdherencePredictionRecord[] {
    return [...this.predictionRecords];
  }

  public addPredictionRecord(
    rec: Omit<AdherencePredictionRecord, 'id' | 'predictionTimestamp'>
  ): AdherencePredictionRecord {
    const newRecord: AdherencePredictionRecord = {
      ...rec,
      id: `pred-${Date.now()}`,
      predictionTimestamp: new Date().toISOString()
    };
    this.predictionRecords.unshift(newRecord);
    return newRecord;
  }

  public getMLModelMetadata(): MLModelMetadata | null {
    return this.activeMLModelMetadata ? { ...this.activeMLModelMetadata } : null;
  }

  public setMLModelMetadata(metadata: MLModelMetadata): void {
    this.activeMLModelMetadata = { ...metadata };
  }

  public getGoals(): GoalStrategyItem[] {
    return [...this.goals];
  }

  public updateGoal(id: string, updates: Partial<GoalStrategyItem>): GoalStrategyItem | null {
    const idx = this.goals.findIndex(g => g.id === id);
    if (idx === -1) return null;
    this.goals[idx] = { ...this.goals[idx], ...updates };
    return { ...this.goals[idx] };
  }

  public getAdaptivePlan(): AdaptivePlanDay[] {
    return adaptivePlanEngine.getDays();
  }

  public getAdaptivePlanPayload(): AdaptivePlanPayload {
    return adaptivePlanEngine.getPlanPayload(this.evolvingState, this.outcomes);
  }

  public rebalanceAdaptivePlan(): AdaptivePlanPayload {
    adaptivePlanEngine.evaluateAndAdaptPlan(
      this.evolvingState,
      this.outcomes,
      this.userProfile,
      this.getPersonalBehavioralProfile(),
      this.goals
    );
    return adaptivePlanEngine.getPlanPayload(this.evolvingState, this.outcomes);
  }

  public resetAdaptivePlan(): AdaptivePlanPayload {
    return adaptivePlanEngine.resetToBaseline();
  }

  public getAdaptationHistory(): PlanAdaptationEvent[] {
    return adaptivePlanEngine.getAdaptationEvents();
  }

  public getRecommendationHistory(): RecommendationHistoryItem[] {
    return [...this.recommendationHistory];
  }

  public recordRecommendationHistory(item: Omit<RecommendationHistoryItem, 'id'>): RecommendationHistoryItem {
    const record: RecommendationHistoryItem = {
      ...item,
      id: `rec-hist-${Date.now()}`
    };
    this.recommendationHistory.unshift(record);
    return record;
  }

  public getWhatIfScenarios(): WhatIfScenarioRecord[] {
    return [...this.whatIfScenarios];
  }

  public recordWhatIfScenario(record: Omit<WhatIfScenarioRecord, 'id' | 'timestamp'>): WhatIfScenarioRecord {
    const scenario: WhatIfScenarioRecord = {
      ...record,
      id: `whatif-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    this.whatIfScenarios.unshift(scenario);
    return scenario;
  }

  /**
   * Empirical Behavioral Pattern Analysis Engine
   * Derives real descriptive statistics, duration ranges, environment rates,
   * condition associations, barrier distributions, and Personal Behavioral Profile.
   * STRICTLY NO HARDCODED OR FAKE INSIGHTS.
   */
  public calculateBehavioralAnalysis(): {
    summary: BehaviorPatternSummary;
    profile: PersonalBehavioralProfile;
    patterns: BehavioralPatternsData;
  } {
    const outcomes = this.outcomes;
    const total = outcomes.length;
    const completed = outcomes.filter(o => o.outcomeStatus === 'completed').length;
    const partial = outcomes.filter(o => o.outcomeStatus === 'partially_completed').length;
    const skipped = outcomes.filter(o => o.outcomeStatus === 'skipped').length;

    const completionRateOverall = total > 0 ? Math.round((completed / total) * 100) : 0;
    const partialRateOverall = total > 0 ? Math.round((partial / total) * 100) : 0;
    const skipRateOverall = total > 0 ? Math.round((skipped / total) * 100) : 0;
    const overallRecentAdherence = total > 0 ? Math.round(((completed + 0.5 * partial) / total) * 100) : 0;

    const completedOrPartial = outcomes.filter(o => o.outcomeStatus === 'completed' || o.outcomeStatus === 'partially_completed');
    const avgCompletedDuration = completedOrPartial.length > 0
      ? Math.round(completedOrPartial.reduce((sum, o) => sum + (o.actualDurationMinutes || 0), 0) / completedOrPartial.length)
      : 0;
    const avgRecommendedDuration = total > 0
      ? Math.round(outcomes.reduce((sum, o) => sum + (o.plannedDurationMinutes || 0), 0) / total)
      : 0;

    // 1. DURATION PATTERNS (0-15m, 16-30m, 31-45m, 46+m)
    const durationBuckets: Array<{ range: string; min: number; max: number }> = [
      { range: '0–15m', min: 0, max: 15 },
      { range: '16–30m', min: 16, max: 30 },
      { range: '31–45m', min: 31, max: 45 },
      { range: '46+m', min: 46, max: 999 }
    ];

    const durationPatterns: DurationRangePattern[] = durationBuckets.map(bucket => {
      const items = outcomes.filter(o => o.plannedDurationMinutes >= bucket.min && o.plannedDurationMinutes <= bucket.max);
      const c = items.filter(o => o.outcomeStatus === 'completed').length;
      const p = items.filter(o => o.outcomeStatus === 'partially_completed').length;
      const s = items.filter(o => o.outcomeStatus === 'skipped').length;
      return {
        range: bucket.range,
        minMinutes: bucket.min,
        maxMinutes: bucket.max === 999 ? 60 : bucket.max,
        total: items.length,
        completed: c,
        partial: p,
        skipped: s,
        completionRate: items.length > 0 ? Math.round((c / items.length) * 100) : 0
      };
    });

    // Determine highest adherence duration range (min 1 sample)
    const activeDurations = durationPatterns.filter(d => d.total > 0);
    const bestDurationBucket = activeDurations.length > 0
      ? [...activeDurations].sort((a, b) => b.completionRate - a.completionRate || b.total - a.total)[0]
      : null;

    // 2. ENVIRONMENT PATTERNS
    const envKeys: Array<{ key: 'home' | 'gym' | 'outdoor' | 'other'; label: string }> = [
      { key: 'home', label: 'Home' },
      { key: 'gym', label: 'Gym' },
      { key: 'outdoor', label: 'Outdoor' },
      { key: 'other', label: 'Other' }
    ];

    const environmentPatterns: EnvironmentPattern[] = envKeys.map(e => {
      const items = outcomes.filter(o => (o.contextSnapshot?.environment || '').toLowerCase() === e.key);
      const c = items.filter(o => o.outcomeStatus === 'completed').length;
      const p = items.filter(o => o.outcomeStatus === 'partially_completed').length;
      const s = items.filter(o => o.outcomeStatus === 'skipped').length;
      return {
        environment: e.key,
        label: e.label,
        total: items.length,
        completed: c,
        partial: p,
        skipped: s,
        completionRate: items.length > 0 ? Math.round((c / items.length) * 100) : 0
      };
    });

    const homePattern = environmentPatterns.find(e => e.environment === 'home');
    const gymPattern = environmentPatterns.find(e => e.environment === 'gym');
    const outdoorPattern = environmentPatterns.find(e => e.environment === 'outdoor');

    const completionRateHome = homePattern ? homePattern.completionRate : 0;
    const completionRateGym = gymPattern ? gymPattern.completionRate : 0;
    const completionRateOutdoor = outdoorPattern ? outdoorPattern.completionRate : 0;

    const activeEnvs = environmentPatterns.filter(e => e.total > 0);
    const bestEnv = activeEnvs.length > 0
      ? [...activeEnvs].sort((a, b) => b.completionRate - a.completionRate || b.total - a.total)[0]
      : null;

    // 3. ACTIVITY TYPE PATTERNS
    const activityMap: Record<string, { total: number; completed: number; partial: number; skipped: number }> = {};
    for (const o of outcomes) {
      let actType = 'Functional Strength';
      const name = (o.recommendedActivity || '').toLowerCase();
      const cat = (o.category || '').toLowerCase();
      if (name.includes('run') || name.includes('jog') || name.includes('zone 2') || cat.includes('cardio')) {
        actType = 'Aerobic Cardio';
      } else if (name.includes('mobility') || name.includes('foam') || name.includes('stretch') || cat.includes('recovery')) {
        actType = 'Mobility & Recovery';
      } else if (name.includes('hiit') || name.includes('interval')) {
        actType = 'HIIT';
      } else if (name.includes('yoga') || name.includes('flow')) {
        actType = 'Yoga & Mobility';
      } else if (name.includes('strength') || name.includes('dumbbell') || name.includes('circuit') || cat.includes('workout')) {
        actType = 'Functional Strength';
      }

      if (!activityMap[actType]) {
        activityMap[actType] = { total: 0, completed: 0, partial: 0, skipped: 0 };
      }
      activityMap[actType].total++;
      if (o.outcomeStatus === 'completed') activityMap[actType].completed++;
      else if (o.outcomeStatus === 'partially_completed') activityMap[actType].partial++;
      else if (o.outcomeStatus === 'skipped') activityMap[actType].skipped++;
    }

    const activityPatterns: ActivityTypePattern[] = Object.entries(activityMap).map(([type, stats]) => ({
      activityType: type,
      total: stats.total,
      completed: stats.completed,
      partial: stats.partial,
      skipped: stats.skipped,
      completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    })).sort((a, b) => b.total - a.total);

    const mostFrequentActivity = activityPatterns[0]?.activityType || 'Functional Strength';
    const highestAdherenceActivity = [...activityPatterns].sort((a, b) => b.completionRate - a.completionRate || b.total - a.total)[0]?.activityType || 'Functional Strength';
    const skippedSorted = [...activityPatterns].filter(a => a.skipped > 0).sort((a, b) => b.skipped - a.skipped);
    const mostSkippedActivity = skippedSorted.length > 0 ? skippedSorted[0].activityType : 'None recorded';

    // 4. TIME OF DAY PATTERNS
    const timeBuckets: Record<'morning' | 'afternoon' | 'evening', { total: number; completed: number }> = {
      morning: { total: 0, completed: 0 },
      afternoon: { total: 0, completed: 0 },
      evening: { total: 0, completed: 0 }
    };

    for (const o of outcomes) {
      const d = new Date(o.timestamp);
      const hr = d.getHours();
      let slot: 'morning' | 'afternoon' | 'evening' = 'morning';
      if (hr >= 12 && hr < 17) slot = 'afternoon';
      else if (hr >= 17 || hr < 5) slot = 'evening';

      timeBuckets[slot].total++;
      if (o.outcomeStatus === 'completed') timeBuckets[slot].completed++;
    }

    const timeOfDayPatterns: TimeOfDayPattern[] = [
      { timeOfDay: 'morning', label: 'Morning (5 AM–12 PM)', total: timeBuckets.morning.total, completed: timeBuckets.morning.completed, completionRate: timeBuckets.morning.total > 0 ? Math.round((timeBuckets.morning.completed / timeBuckets.morning.total) * 100) : 0 },
      { timeOfDay: 'afternoon', label: 'Afternoon (12 PM–5 PM)', total: timeBuckets.afternoon.total, completed: timeBuckets.afternoon.completed, completionRate: timeBuckets.afternoon.total > 0 ? Math.round((timeBuckets.afternoon.completed / timeBuckets.afternoon.total) * 100) : 0 },
      { timeOfDay: 'evening', label: 'Evening (5 PM–10 PM)', total: timeBuckets.evening.total, completed: timeBuckets.evening.completed, completionRate: timeBuckets.evening.total > 0 ? Math.round((timeBuckets.evening.completed / timeBuckets.evening.total) * 100) : 0 }
    ];

    const bestTimeOfDay = [...timeOfDayPatterns].filter(t => t.total > 0).sort((a, b) => b.completionRate - a.completionRate || b.total - a.total)[0]?.label || 'Morning';

    // 5. BARRIER ANALYSIS
    const barrierCounts: Record<string, number> = {};
    for (const o of outcomes) {
      if (o.reasonForSkipOrPartial) {
        barrierCounts[o.reasonForSkipOrPartial] = (barrierCounts[o.reasonForSkipOrPartial] || 0) + 1;
      }
    }
    const nonCompletedCount = partial + skipped;
    const commonBarriers = Object.entries(barrierCounts).map(([reason, count]) => ({
      reason: reason as any,
      label: reason.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count,
      percentage: nonCompletedCount > 0 ? Math.round((count / nonCompletedCount) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    const dominantBarrier = commonBarriers[0]?.label || (total >= 3 ? 'None reported' : 'Collecting data');

    // 6. CONDITION-BASED ASSOCIATIONS (Non-causal empirical comparisons)
    // Energy
    const highEnergy = outcomes.filter(o => (o.contextSnapshot?.energyLevel ?? 5) >= 7);
    const lowEnergy = outcomes.filter(o => (o.contextSnapshot?.energyLevel ?? 5) <= 4);
    const highEnergyRate = highEnergy.length ? Math.round((highEnergy.filter(o => o.outcomeStatus === 'completed').length / highEnergy.length) * 100) : 0;
    const lowEnergyRate = lowEnergy.length ? Math.round((lowEnergy.filter(o => o.outcomeStatus === 'completed').length / lowEnergy.length) * 100) : 0;

    // Fatigue
    const lowFatigue = outcomes.filter(o => (o.contextSnapshot?.fatigueLevel ?? 5) <= 4);
    const highFatigue = outcomes.filter(o => (o.contextSnapshot?.fatigueLevel ?? 5) >= 7);
    const lowFatigueRate = lowFatigue.length ? Math.round((lowFatigue.filter(o => o.outcomeStatus === 'completed').length / lowFatigue.length) * 100) : 0;
    const highFatigueRate = highFatigue.length ? Math.round((highFatigue.filter(o => o.outcomeStatus === 'completed').length / highFatigue.length) * 100) : 0;

    // Sleep
    const goodSleep = outcomes.filter(o => (o.contextSnapshot?.sleepHours ?? 7) >= 7.0);
    const shortSleep = outcomes.filter(o => (o.contextSnapshot?.sleepHours ?? 7) < 6.0);
    const goodSleepRate = goodSleep.length ? Math.round((goodSleep.filter(o => o.outcomeStatus === 'completed').length / goodSleep.length) * 100) : 0;
    const shortSleepRate = shortSleep.length ? Math.round((shortSleep.filter(o => o.outcomeStatus === 'completed').length / shortSleep.length) * 100) : 0;

    // Available Time
    const longTime = outcomes.filter(o => (o.contextSnapshot?.availableMinutes ?? 30) >= 35);
    const shortTime = outcomes.filter(o => (o.contextSnapshot?.availableMinutes ?? 30) < 25);
    const longTimeRate = longTime.length ? Math.round((longTime.filter(o => o.outcomeStatus === 'completed').length / longTime.length) * 100) : 0;
    const shortTimeRate = shortTime.length ? Math.round((shortTime.filter(o => o.outcomeStatus === 'completed').length / shortTime.length) * 100) : 0;

    const conditionAssociations: ConditionAssociationItem[] = [
      {
        dimension: 'energy',
        label: 'Energy Readiness',
        conditionA: { label: 'High Energy (≥7/10)', count: highEnergy.length, completionRate: highEnergyRate },
        conditionB: { label: 'Low Energy (≤4/10)', count: lowEnergy.length, completionRate: lowEnergyRate },
        deltaPercent: highEnergyRate - lowEnergyRate,
        associationText: total >= 3 && highEnergy.length && lowEnergy.length
          ? `High energy readiness (≥7) is associated with an ${highEnergyRate}% completion rate compared to ${lowEnergyRate}% under low energy.`
          : 'Sufficient observations needed across high and low energy states to establish association.'
      },
      {
        dimension: 'fatigue',
        label: 'Physiological Fatigue',
        conditionA: { label: 'Low Fatigue (≤4/10)', count: lowFatigue.length, completionRate: lowFatigueRate },
        conditionB: { label: 'High Fatigue (≥7/10)', count: highFatigue.length, completionRate: highFatigueRate },
        deltaPercent: lowFatigueRate - highFatigueRate,
        associationText: total >= 3 && lowFatigue.length && highFatigue.length
          ? `Low systemic fatigue (≤4) is associated with ${lowFatigueRate}% follow-through, whereas elevated fatigue (≥7) appears to lower completion to ${highFatigueRate}%.`
          : 'Observing follow-through under varying physiological fatigue loads.'
      },
      {
        dimension: 'sleep',
        label: 'Sleep Duration',
        conditionA: { label: 'Restorative Sleep (≥7.0h)', count: goodSleep.length, completionRate: goodSleepRate },
        conditionB: { label: 'Short Sleep (<6.0h)', count: shortSleep.length, completionRate: shortSleepRate },
        deltaPercent: goodSleepRate - shortSleepRate,
        associationText: total >= 3 && goodSleep.length && shortSleep.length
          ? `Sufficient sleep (≥7h) shows an ${goodSleepRate}% completion rate versus ${shortSleepRate}% on days with acute sleep debt (<6h).`
          : 'Gathering outcomes under varied sleep duration baselines.'
      },
      {
        dimension: 'time',
        label: 'Available Schedule Window',
        conditionA: { label: 'Standard Window (≥35m)', count: longTime.length, completionRate: longTimeRate },
        conditionB: { label: 'Compressed Window (<25m)', count: shortTime.length, completionRate: shortTimeRate },
        deltaPercent: longTimeRate - shortTimeRate,
        associationText: total >= 3 && longTime.length
          ? `Schedule windows of 35+ minutes are associated with ${longTimeRate}% completion; sessions shorter than 25m maintain consistency when calibrated to lighter intensities.`
          : 'Analyzing schedule constraints versus planned activity durations.'
      }
    ];

    // 7. DATA SUFFICIENCY & CONFIDENCE
    let dataSufficiency: 'insufficient' | 'preliminary' | 'moderate' | 'high' = 'insufficient';
    let dataSufficiencyText = 'Not enough history yet to establish a reliable pattern. Complete a few activities to unlock personalized behavioral insights.';
    if (total >= 15) {
      dataSufficiency = 'high';
      dataSufficiencyText = `Based on ${total} recorded outcomes (High statistical confidence).`;
    } else if (total >= 7) {
      dataSufficiency = 'moderate';
      dataSufficiencyText = `Based on ${total} recorded outcomes (Moderate statistical confidence).`;
    } else if (total >= 3) {
      dataSufficiency = 'preliminary';
      dataSufficiencyText = `Based on ${total} recorded outcomes (Preliminary evidence). More data will increase pattern reliability.`;
    }

    // 8. LEARNED INSIGHTS & KEY OBSERVATION (Grounded in real metrics)
    const learnedInsights: string[] = [];
    let keyObservation = '';

    if (total < 3) {
      learnedInsights.push('We are still learning your behavior. Complete a few activities to unlock personalized behavioral insights.');
      keyObservation = 'HealthPilot AI is currently gathering baseline outcome data. Log daily outcomes to reveal personalized behavioral patterns.';
    } else {
      // Real Duration Insight
      if (bestDurationBucket && activeDurations.length > 1) {
        const longerBuckets = activeDurations.filter(d => d.minMinutes >= 31);
        const avgLongerRate = longerBuckets.length > 0
          ? Math.round(longerBuckets.reduce((acc, d) => acc + d.completionRate, 0) / longerBuckets.length)
          : null;
        if (avgLongerRate !== null && bestDurationBucket.completionRate > avgLongerRate) {
          learnedInsights.push(`Your completion rate is higher for ${bestDurationBucket.range} sessions (${bestDurationBucket.completionRate}%) than for sessions longer than 30 minutes (${avgLongerRate}%).`);
        } else {
          learnedInsights.push(`Your highest follow-through occurs in the ${bestDurationBucket.range} duration window with a ${bestDurationBucket.completionRate}% completion rate.`);
        }
      }

      // Real Environment Insight
      if (bestEnv && activeEnvs.length > 1) {
        const otherEnv = activeEnvs.find(e => e.environment !== bestEnv.environment);
        if (otherEnv) {
          learnedInsights.push(`Your history indicates higher follow-through for ${bestEnv.label}-based activities (${bestEnv.completionRate}%) compared to ${otherEnv.label} (${otherEnv.completionRate}%).`);
        } else {
          learnedInsights.push(`Your recent completion rate is highest for ${bestEnv.label}-based activities at ${bestEnv.completionRate}%.`);
        }
      }

      // Real Barrier / Condition Insight
      if (commonBarriers.length > 0) {
        learnedInsights.push(`${commonBarriers[0].label} is currently your most frequent reported barrier, accounting for ${commonBarriers[0].percentage}% of non-completed sessions.`);
      }

      // Real Energy / Fatigue Association Insight
      if (highFatigue.length > 0 && highFatigueRate < 50) {
        learnedInsights.push(`When systemic fatigue is high (≥7), session follow-through drops to ${highFatigueRate}%, suggesting adaptive duration down-regulation is indicated.`);
      }

      // Key Observation
      const envText = bestEnv ? `${bestEnv.label.toLowerCase()}` : 'home';
      const durText = bestDurationBucket ? bestDurationBucket.range : '20–30 minute';
      keyObservation = `Your completion rate is highest (${bestDurationBucket ? bestDurationBucket.completionRate : completionRateOverall}%) for ${durText} ${envText} sessions. When fatigue is elevated, shorter restorative sessions preserve behavioral consistency.`;
    }

    // 9. STRONGEST & WEAK ADHERENCE CONDITIONS
    const strongestAdherenceConditions: string[] = [];
    const weakAdherenceConditions: string[] = [];

    if (total < 3) {
      strongestAdherenceConditions.push('Pending baseline activity tracking');
      weakAdherenceConditions.push('Pending baseline activity tracking');
    } else {
      if (bestDurationBucket) {
        strongestAdherenceConditions.push(`Sessions bounded within ${bestDurationBucket.range} (${bestDurationBucket.completionRate}% completion)`);
      }
      if (bestEnv) {
        strongestAdherenceConditions.push(`${bestEnv.label} environment with low logistical friction (${bestEnv.completionRate}% completion)`);
      }
      if (goodSleep.length > 0) {
        strongestAdherenceConditions.push(`Restorative sleep (≥7.0h) with moderate daily energy (${goodSleepRate}% follow-through)`);
      }
      if (timeBuckets.morning.total > 0 && timeBuckets.morning.completed > 0) {
        strongestAdherenceConditions.push('Morning or afternoon windows before late-day cognitive fatigue');
      }

      if (gymPattern && gymPattern.total > 0 && gymPattern.completionRate < 50) {
        weakAdherenceConditions.push(`Gym workouts requiring transit during high fatigue (${gymPattern.completionRate}% completion)`);
      }
      const longSessions = outcomes.filter(o => o.plannedDurationMinutes >= 40);
      if (longSessions.length > 0) {
        const longCompRate = Math.round((longSessions.filter(o => o.outcomeStatus === 'completed').length / longSessions.length) * 100);
        weakAdherenceConditions.push(`Sessions scheduled longer than 40 minutes on high stress days (${longCompRate}% completion)`);
      }
      if (shortSleep.length > 0 && shortSleepRate < 50) {
        weakAdherenceConditions.push(`High intensity prescribed following sub-6 hour sleep debt (${shortSleepRate}% completion)`);
      }
      if (commonBarriers.length > 0) {
        weakAdherenceConditions.push(`Unbuffered schedules where "${commonBarriers[0].label}" precipitates session truncation`);
      }
    }

    const preferredDurationStr = bestDurationBucket ? `${bestDurationBucket.minMinutes}–${bestDurationBucket.maxMinutes} minutes` : '20–30 minutes';
    const preferredEnvStr = bestEnv ? bestEnv.label : 'Home';

    const profile: PersonalBehavioralProfile = {
      userId: 'user-001',
      calculatedAt: new Date().toISOString(),
      observationCount: total,
      dataSufficiency,
      dataSufficiencyText,
      preferredDuration: preferredDurationStr,
      preferredEnvironment: preferredEnvStr,
      preferredActivity: highestAdherenceActivity,
      preferredTime: bestTimeOfDay,
      mostFrequentActivity,
      highestAdherenceActivity,
      mostSkippedActivity,
      dominantBarrier,
      strongestAdherenceConditions,
      weakAdherenceConditions,
      overallRecentAdherence,
      completionRateOverall,
      partialRateOverall,
      skipRateOverall,
      avgCompletedDurationMinutes: avgCompletedDuration,
      avgRecommendedDurationMinutes: avgRecommendedDuration,
      learnedInsights,
      keyObservation
    };

    const patterns: BehavioralPatternsData = {
      durationPatterns,
      environmentPatterns,
      activityPatterns,
      timeOfDayPatterns,
      conditionAssociations
    };

    const summary: BehaviorPatternSummary = {
      completionRateOverall,
      partialRateOverall,
      skipRateOverall,
      completionRateHome,
      completionRateGym,
      completionRateOutdoor,
      preferredDurationMin: bestDurationBucket ? bestDurationBucket.minMinutes : 20,
      preferredDurationMax: bestDurationBucket ? bestDurationBucket.maxMinutes : 30,
      preferredWorkoutType: `${preferredEnvStr} ${highestAdherenceActivity}`,
      avgCompletedDurationMinutes: avgCompletedDuration,
      avgRecommendedDurationMinutes: avgRecommendedDuration,
      observationCount: total,
      dataSufficiency,
      dataSufficiencyText,
      commonBarriers,
      successfulConditions: strongestAdherenceConditions,
      skipConditions: weakAdherenceConditions,
      keyObservation,
      profile,
      patterns
    };

    return { summary, profile, patterns };
  }

  public getBehaviorPatternSummary(): BehaviorPatternSummary {
    return this.calculateBehavioralAnalysis().summary;
  }

  public getPersonalBehavioralProfile(): PersonalBehavioralProfile {
    return this.calculateBehavioralAnalysis().profile;
  }

  public getBehavioralPatterns(): BehavioralPatternsData {
    return this.calculateBehavioralAnalysis().patterns;
  }

  public recalculateBehavioralProfile(): {
    summary: BehaviorPatternSummary;
    profile: PersonalBehavioralProfile;
    patterns: BehavioralPatternsData;
  } {
    const analysis = this.calculateBehavioralAnalysis();
    this.evolvingState.weeklyAdherenceRate = analysis.profile.overallRecentAdherence;
    this.evolvingState.dominantBarrier = analysis.profile.dominantBarrier;
    this.evolvingState.lastUpdated = new Date().toISOString();
    return analysis;
  }
}

export const db = new InMemoryHealthPilotDB();
