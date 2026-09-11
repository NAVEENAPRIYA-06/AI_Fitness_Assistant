import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Mongoose Schemas for HealthPilot AI MongoDB Integration
 */

// 1. User Account
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: 'research_participant' | 'user' | 'admin';
  timezone: string;
  onboardingComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ['research_participant', 'user', 'admin'], default: 'user' },
  timezone: { type: String, default: 'UTC' },
  onboardingComplete: { type: Boolean, default: false }
}, { timestamps: true });

// 2. User Profile
export interface IUserProfile extends Document {
  userId: string;
  name: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | 'athlete';
  restingHeartRate?: number;
  healthConditions: string[];
  fitnessGoals: string[];
  nutritionGoals: string[];
  activityPreferences: string[];
  preferredWorkoutTypes: string[];
  preferredEnvironment: 'home' | 'gym' | 'outdoor' | 'flexible';
  availableEquipment: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>({
  userId: { type: String, required: true, unique: true, index: true },
  name: { type: String, default: 'HealthPilot User' },
  age: { type: Number, default: 30 },
  gender: { type: String, default: 'Not specified' },
  heightCm: { type: Number, default: 175 },
  weightKg: { type: Number, default: 70 },
  bmi: { type: Number, default: 22.9 },
  fitnessLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'athlete'], default: 'intermediate' },
  restingHeartRate: { type: Number, default: 62 },
  healthConditions: [{ type: String }],
  fitnessGoals: [{ type: String }],
  nutritionGoals: [{ type: String }],
  activityPreferences: [{ type: String }],
  preferredWorkoutTypes: [{ type: String }],
  preferredEnvironment: { type: String, enum: ['home', 'gym', 'outdoor', 'flexible'], default: 'home' },
  availableEquipment: [{ type: String }]
}, { timestamps: true });

// 3. Daily Context
export interface IDailyContext extends Document {
  userId: string;
  date: string; // YYYY-MM-DD
  sleepHours: number;
  sleepDuration?: number;
  sleepQuality: number;
  energyLevel: number;
  fatigueLevel: number;
  stressLevel: number;
  sorenessLevel: number;
  recoveryScore: number;
  recoveryStatus?: 'good' | 'moderate' | 'low';
  mood?: string;
  cognitiveLoad?: number;
  availableMinutes: number;
  preferredTime?: 'morning' | 'afternoon' | 'evening';
  environment: 'home' | 'gym' | 'outdoor' | 'travel' | 'other';
  equipmentAvailable: string[];
  activityPreference?: string;
  currentPreferences?: string;
  currentPreferenceNote?: string;
  hydrationLiters?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DailyContextSchema = new Schema<IDailyContext>({
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true },
  sleepHours: { type: Number, default: 7.0 },
  sleepDuration: { type: Number },
  sleepQuality: { type: Number, default: 7 },
  energyLevel: { type: Number, default: 6 },
  fatigueLevel: { type: Number, default: 5 },
  stressLevel: { type: Number, default: 5 },
  sorenessLevel: { type: Number, default: 3 },
  recoveryScore: { type: Number, default: 70 },
  recoveryStatus: { type: String, enum: ['good', 'moderate', 'low'], default: 'moderate' },
  mood: { type: String, default: 'balanced' },
  cognitiveLoad: { type: Number, default: 5 },
  availableMinutes: { type: Number, default: 30 },
  preferredTime: { type: String, enum: ['morning', 'afternoon', 'evening'], default: 'morning' },
  environment: { type: String, enum: ['home', 'gym', 'outdoor', 'travel', 'other'], default: 'home' },
  equipmentAvailable: [{ type: String }],
  activityPreference: { type: String },
  currentPreferences: { type: String },
  currentPreferenceNote: { type: String },
  hydrationLiters: { type: Number, default: 2.0 },
  notes: { type: String, default: '' }
}, { timestamps: true });

DailyContextSchema.index({ userId: 1, date: -1 });

// 4. Goals
export interface IGoal extends Document {
  userId: string;
  title: string;
  category: 'endurance' | 'strength' | 'metabolic' | 'sleep' | 'consistency';
  targetMetric?: string;
  targetValue?: string;
  currentValue?: string;
  timeframe?: string;
  currentProgress: number;
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
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  category: { type: String, enum: ['endurance', 'strength', 'metabolic', 'sleep', 'consistency'], required: true },
  targetMetric: { type: String },
  targetValue: { type: String },
  currentValue: { type: String },
  timeframe: { type: String },
  currentProgress: { type: Number, default: 0 },
  targetDate: { type: String },
  priority: { type: String, enum: ['primary', 'secondary', 'supporting'], default: 'secondary' },
  status: { type: String, enum: ['active', 'paused', 'achieved'], default: 'active' },
  currentConflict: { type: Boolean, default: false },
  conflictDetails: { type: String },
  strategyAdjustment: { type: String },
  milestones: [{
    id: { type: String },
    title: { type: String },
    completed: { type: Boolean, default: false }
  }]
}, { timestamps: true });

// 5. Recommendation Outcomes (Outcome Journal)
export interface IRecommendationOutcome extends Document {
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
  timestamp: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationOutcomeSchema = new Schema<IRecommendationOutcome>({
  userId: { type: String, required: true, index: true },
  recommendationId: { type: String, required: true },
  recommendedActivity: { type: String, required: true },
  category: { type: String, required: true },
  plannedDurationMinutes: { type: Number, required: true },
  intensity: { type: String, enum: ['low', 'moderate', 'high'], required: true },
  contextSnapshot: {
    sleepHours: Number,
    energyLevel: Number,
    fatigueLevel: Number,
    stressLevel: Number,
    availableMinutes: Number,
    environment: String
  },
  outcomeStatus: { type: String, enum: ['completed', 'partially_completed', 'skipped'], required: true },
  actualDurationMinutes: { type: Number, required: true },
  reasonForSkipOrPartial: { type: String },
  userFeedback: { type: String, default: '' },
  perceivedEffort: { type: Number },
  timestamp: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

RecommendationOutcomeSchema.index({ userId: 1, timestamp: -1 });

// 6. Recommendation History
export interface IRecommendationHistory extends Document {
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
  timestamp: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationHistorySchema = new Schema<IRecommendationHistory>({
  userId: { type: String, required: true, index: true },
  recommendationId: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  intensity: { type: String, required: true },
  environment: { type: String, required: true },
  contextSnapshot: {
    sleepHours: Number,
    energyLevel: Number,
    fatigueLevel: Number,
    stressLevel: Number,
    availableMinutes: Number,
    environment: String
  },
  predictedAdherence: { type: Number, required: true },
  suitabilityScore: { type: Number, required: true },
  status: { type: String, default: 'active' },
  whyRecommended: { type: String, default: '' },
  outcome: {
    outcomeStatus: String,
    actualDurationMinutes: Number,
    userFeedback: String
  },
  adaptationApplied: { type: String },
  timestamp: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

RecommendationHistorySchema.index({ userId: 1, timestamp: -1 });

// 7. Adaptive Plan State
export interface IAdaptivePlan extends Document {
  userId: string;
  currentPhase: string;
  days: any[];
  baselineDays: any[];
  adaptationEvents: any[];
  lastRebalanced: string;
  momentumStatus: string;
  momentumScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdaptivePlanSchema = new Schema<IAdaptivePlan>({
  userId: { type: String, required: true, unique: true, index: true },
  currentPhase: { type: String, default: 'Phase 1: Foundation & Baseline' },
  days: { type: [Schema.Types.Mixed] as any, default: [] },
  baselineDays: { type: [Schema.Types.Mixed] as any, default: [] },
  adaptationEvents: { type: [Schema.Types.Mixed] as any, default: [] },
  lastRebalanced: { type: String, default: () => new Date().toISOString() },
  momentumStatus: { type: String, default: 'Moderate' },
  momentumScore: { type: Number, default: 65 }
}, { timestamps: true });

// 8. Adherence Prediction Record
export interface IAdherencePrediction extends Document {
  userId: string;
  recommendationId: string;
  recommendationTitle: string;
  predictionProbability: number;
  predictedAdherence: number;
  predictedClass: number;
  modelName: string;
  modelVersion: string;
  isBaselineFallback: boolean;
  dataSourceLabel: string;
  featureSnapshot: Record<string, any>;
  predictionTimestamp: string;
  actualOutcomeStatus?: string;
  actualDurationMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AdherencePredictionSchema = new Schema<IAdherencePrediction>({
  userId: { type: String, required: true, index: true },
  recommendationId: { type: String, required: true },
  recommendationTitle: { type: String, required: true },
  predictionProbability: { type: Number, required: true },
  predictedAdherence: { type: Number, required: true },
  predictedClass: { type: Number, required: true },
  modelName: { type: String, default: 'Logistic Regression' },
  modelVersion: { type: String, default: '1.0.0-prototype' },
  isBaselineFallback: { type: Boolean, default: false },
  dataSourceLabel: { type: String, default: 'Seed / Demonstration Data' },
  featureSnapshot: { type: Object, default: {} },
  predictionTimestamp: { type: String, default: () => new Date().toISOString() },
  actualOutcomeStatus: { type: String },
  actualDurationMinutes: { type: Number }
}, { timestamps: true });

AdherencePredictionSchema.index({ userId: 1, predictionTimestamp: -1 });

// Helper to register or retrieve models
export function getMongoModels() {
  const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
  const UserProfile: Model<IUserProfile> = mongoose.models.UserProfile || mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);
  const DailyContext: Model<IDailyContext> = mongoose.models.DailyContext || mongoose.model<IDailyContext>('DailyContext', DailyContextSchema);
  const Goal: Model<IGoal> = mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);
  const RecommendationOutcome: Model<IRecommendationOutcome> = mongoose.models.RecommendationOutcome || mongoose.model<IRecommendationOutcome>('RecommendationOutcome', RecommendationOutcomeSchema);
  const RecommendationHistory: Model<IRecommendationHistory> = mongoose.models.RecommendationHistory || mongoose.model<IRecommendationHistory>('RecommendationHistory', RecommendationHistorySchema);
  const AdaptivePlan: Model<IAdaptivePlan> = mongoose.models.AdaptivePlan || mongoose.model<IAdaptivePlan>('AdaptivePlan', AdaptivePlanSchema);
  const AdherencePrediction: Model<IAdherencePrediction> = mongoose.models.AdherencePrediction || mongoose.model<IAdherencePrediction>('AdherencePrediction', AdherencePredictionSchema);

  return {
    User,
    UserProfile,
    DailyContext,
    Goal,
    RecommendationOutcome,
    RecommendationHistory,
    AdaptivePlan,
    AdherencePrediction
  };
}
