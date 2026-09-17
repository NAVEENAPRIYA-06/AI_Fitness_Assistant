import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
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
import { getWeekDates, isPast, isToday } from '../../src/utils/dateUtils.js';
import { connectMongoDB, isMongoDBConnected } from './mongoConnect.js';
import { getMongoModels } from './models.js';
import mongoose from 'mongoose';

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'research_participant' | 'user' | 'admin';
  timezone: string;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PersistedStoreData {
  users: Record<string, UserAccount>;
  userProfiles: Record<string, UserProfile>;
  dailyContextHistories: Record<string, DailyContext[]>;
  evolvingStates: Record<string, EvolvingUserState>;
  goals: Record<string, GoalStrategyItem[]>;
  outcomes: Record<string, RecommendationOutcome[]>;
  adaptivePlans: Record<string, AdaptivePlanPayload>;
  recommendationHistories: Record<string, RecommendationHistoryItem[]>;
  predictionRecords: Record<string, AdherencePredictionRecord[]>;
  whatIfScenarios: Record<string, WhatIfScenarioRecord[]>;
  activeMLModelMetadata: MLModelMetadata | null;
}

/**
 * HealthPilot AI Persistent Multi-User Database Repository
 * Features:
 * - Real multi-user data isolation (each user has their own profile, context, goals, outcomes, plan, history)
 * - Persistent disk document store in .data/healthpilot_db.json surviving server restarts and page reloads
 * - Seamless Mongoose / MongoDB integration when MONGODB_URI is provided
 * - Real password hashing with bcryptjs and JWT session integration
 * - Preserves all research algorithms (Recovery Score calculation, Multi-Dimensional Evolving State,
 *   Behavioral Analysis, Adaptive Plan engine, Feedback Loop, and Evaluation Benchmark)
 */
export class PersistentHealthPilotDB {
  private users: Record<string, UserAccount> = {};
  private userProfiles: Record<string, UserProfile> = {};
  private dailyContextHistories: Record<string, DailyContext[]> = {};
  private evolvingStates: Record<string, EvolvingUserState> = {};
  private goals: Record<string, GoalStrategyItem[]> = {};
  private outcomes: Record<string, RecommendationOutcome[]> = {};
  private adaptivePlans: Record<string, AdaptivePlanPayload> = {};
  private recommendationHistories: Record<string, RecommendationHistoryItem[]> = {};
  private predictionRecords: Record<string, AdherencePredictionRecord[]> = {};
  private whatIfScenarios: Record<string, WhatIfScenarioRecord[]> = {};
  private activeMLModelMetadata: MLModelMetadata | null = null;

  private readonly dataDir: string;
  private readonly dbFilePath: string;

  constructor() {
    this.dataDir = path.resolve(process.cwd(), '.data');
    this.dbFilePath = path.join(this.dataDir, 'healthpilot_db.json');

    // Ensure .data directory exists
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
    } catch (err) {
      console.warn('[DB] Could not verify or create .data directory:', err);
    }

    // Load persisted data or seed benchmark dataset
    this.initStore();

    // Connect to MongoDB if MONGODB_URI is set
    connectMongoDB().then(connected => {
      if (connected) {
        this.loadFromMongoDB().catch(err => {
          console.warn('[DB] Initial MongoDB load failed:', err?.message);
        });
      }
    }).catch(err => {
      console.warn('[DB] Background MongoDB connection check:', err?.message);
    });
  }

  /**
   * Initializes store: reads from disk, or seeds the benchmark research participant if file does not exist.
   */
  private initStore(): void {
    if (fs.existsSync(this.dbFilePath)) {
      try {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        const data: PersistedStoreData = JSON.parse(raw);
        this.users = data.users || {};
        this.userProfiles = data.userProfiles || {};
        this.dailyContextHistories = data.dailyContextHistories || {};
        this.evolvingStates = data.evolvingStates || {};
        this.goals = data.goals || {};
        this.outcomes = data.outcomes || {};
        this.adaptivePlans = data.adaptivePlans || {};
        this.recommendationHistories = data.recommendationHistories || {};
        this.predictionRecords = data.predictionRecords || {};
        this.whatIfScenarios = data.whatIfScenarios || {};
        this.activeMLModelMetadata = data.activeMLModelMetadata || null;

        console.log(`[DB] Successfully loaded persistent store from disk. Total users: ${Object.keys(this.users).length}.`);
        return;
      } catch (err: any) {
        console.error('[DB] Error parsing existing db file. Will reinitialize safely:', err?.message);
      }
    }

    // Initialize with research participant user-001 (Alex Vance)
    console.log('[DB] Initializing new persistent store with research benchmark baseline...');
    this.seedBenchmarkData();
    this.persist();
  }

  /**
   * Synchronously persists all data to disk and asynchronously syncs to MongoDB if connected
   */
  public persist(): void {
    const data: PersistedStoreData = {
      users: this.users,
      userProfiles: this.userProfiles,
      dailyContextHistories: this.dailyContextHistories,
      evolvingStates: this.evolvingStates,
      goals: this.goals,
      outcomes: this.outcomes,
      adaptivePlans: this.adaptivePlans,
      recommendationHistories: this.recommendationHistories,
      predictionRecords: this.predictionRecords,
      whatIfScenarios: this.whatIfScenarios,
      activeMLModelMetadata: this.activeMLModelMetadata
    };

    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      const tmpPath = `${this.dbFilePath}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpPath, this.dbFilePath);
    } catch (err: any) {
      console.error('[DB] Failed to persist data to disk:', err?.message);
    }

    // Sync to MongoDB in background if connected
    if (isMongoDBConnected()) {
      this.syncToMongoDB(data).catch(err => {
        console.warn('[MongoDB] Sync error:', err?.message);
      });
    }
  }

  private async syncToMongoDB(data: PersistedStoreData): Promise<void> {
    try {
      const models = getMongoModels();
      for (const [userId, profile] of Object.entries(data.userProfiles)) {
        await models.UserProfile.findOneAndUpdate(
          { userId },
          { ...profile, userId },
          { upsert: true }
        ).catch(() => {});
      }
      for (const [userId, user] of Object.entries(data.users)) {
        await models.User.findOneAndUpdate(
          { email: user.email.toLowerCase().trim() },
          {
            email: user.email.toLowerCase().trim(),
            passwordHash: user.passwordHash,
            password: user.passwordHash,
            name: user.name,
            fullName: user.name,
            role: user.role,
            timezone: user.timezone,
            onboardingComplete: user.onboardingComplete
          },
          { upsert: true }
        ).catch(() => {});
      }
    } catch {
      // Non-blocking sync
    }
  }

  /**
   * Reconciles and loads existing MongoDB users, health profiles, workouts, waters, diets, and goals
   */
  public async loadFromMongoDB(): Promise<void> {
    if (!isMongoDBConnected() || !mongoose.connection.db) {
      return;
    }

    try {
      const db = mongoose.connection.db;
      console.log('[MongoDB] Synchronizing existing database records into HealthPilot store...');

      // 1. Load users
      const rawUsers = await db.collection('users').find({}).toArray();
      let importedUsersCount = 0;

      for (const u of rawUsers) {
        const id = String(u._id);
        const email = (u.email || '').toLowerCase().trim();
        if (!email) continue;

        const name = u.fullName || u.name || 'User';
        const passwordHash = u.password || u.passwordHash || '';

        // Match existing user by email
        const existing = Object.values(this.users).find(item => item.email.toLowerCase() === email);
        const targetId = existing ? existing.id : id;

        if (!this.users[targetId]) {
          this.users[targetId] = {
            id: targetId,
            email,
            passwordHash,
            name,
            role: (u.role as any) || 'user',
            timezone: u.timezone || 'UTC',
            onboardingComplete: false,
            createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: u.updatedAt ? new Date(u.updatedAt).toISOString() : new Date().toISOString()
          };
          importedUsersCount++;
        } else {
          if (passwordHash && !this.users[targetId].passwordHash) {
            this.users[targetId].passwordHash = passwordHash;
          }
          if (name && (!this.users[targetId].name || this.users[targetId].name === 'User')) {
            this.users[targetId].name = name;
          }
        }
      }

      // 2. Load health profiles
      const rawHps = await db.collection('healthprofiles').find({}).toArray();
      for (const hp of rawHps) {
        const uidStr = String(hp.user);
        const matchedUser = this.users[uidStr] || Object.values(this.users).find(u => u.id === uidStr);
        if (!matchedUser) continue;

        matchedUser.onboardingComplete = true;

        const age = Number(hp.age) || 25;
        const heightCm = Number(hp.height) || 170;
        const weightKg = Number(hp.weight) || 65;
        const bmi = Number(hp.bmi) || +(weightKg / Math.pow(heightCm / 100, 2)).toFixed(1);

        const activityLevelStr = (hp.activityLevel || '').toLowerCase();
        const fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | 'athlete' =
          activityLevelStr.includes('very active') || activityLevelStr.includes('athlete')
            ? 'advanced'
            : activityLevelStr.includes('moderately') || activityLevelStr.includes('moderate')
            ? 'intermediate'
            : 'beginner';

        const goalStr = hp.goal || 'Gain Muscle';

        if (!this.userProfiles[matchedUser.id]) {
          this.userProfiles[matchedUser.id] = {
            id: matchedUser.id,
            name: matchedUser.name,
            age,
            gender: hp.gender || 'Not specified',
            heightCm,
            weightKg,
            bmi,
            fitnessLevel,
            healthConditions: hp.healthConditions || [],
            fitnessGoals: [goalStr, 'Consistent Physical Readiness'],
            nutritionGoals: [
              goalStr.toLowerCase().includes('gain') ? 'Hypertrophy Protein Distribution (~1.8g/kg)' : 'Balanced Nutrition',
              'Consistent Daily Hydration'
            ],
            activityPreferences: [hp.activityLevel || 'General Fitness', 'Strength Training', 'Cardio Intervals'],
            preferredWorkoutTypes: ['Functional Strength', 'Cardio Intervals', 'Bodyweight HIIT'],
            preferredEnvironment: 'flexible',
            availableEquipment: ['Bodyweight', 'Dumbbells', 'Resistance Bands']
          };
        }
      }

      // Also check if any existing user has a UserProfile in mongo models
      const models = getMongoModels();
      const mongoUserProfiles = await models.UserProfile.find({}).lean().catch(() => []);
      for (const mup of mongoUserProfiles as any[]) {
        if (mup.userId && !this.userProfiles[mup.userId]) {
          this.userProfiles[mup.userId] = {
            id: mup.userId,
            name: mup.name || 'User',
            age: mup.age || 28,
            gender: mup.gender || 'Not specified',
            heightCm: mup.heightCm || 172,
            weightKg: mup.weightKg || 68,
            bmi: mup.bmi || 23.0,
            fitnessLevel: mup.fitnessLevel || 'intermediate',
            healthConditions: mup.healthConditions || [],
            fitnessGoals: mup.fitnessGoals || ['General Health & Longevity'],
            nutritionGoals: mup.nutritionGoals || ['Consistent Hydration'],
            activityPreferences: mup.activityPreferences || ['Functional Fitness'],
            preferredWorkoutTypes: mup.preferredWorkoutTypes || ['Strength', 'Cardio'],
            preferredEnvironment: mup.preferredEnvironment || 'flexible',
            availableEquipment: mup.availableEquipment || ['Bodyweight']
          };
          if (this.users[mup.userId]) {
            this.users[mup.userId].onboardingComplete = true;
          }
        }
      }

      // 3. Load workouts, waters, diets, and goals
      for (const u of Object.values(this.users)) {
        if (u.id === 'user-001') continue; // Preserve Alex Vance benchmark participant

        if (!this.dailyContextHistories[u.id] || this.dailyContextHistories[u.id].length === 0) {
          let userObjId: any = null;
          try {
            userObjId = new mongoose.Types.ObjectId(u.id);
          } catch {
            // Not ObjectId format
          }

          const query = userObjId ? { $or: [{ user: userObjId }, { user: u.id }] } : { user: u.id };
          const userWorkouts = await db.collection('workouts').find(query).toArray().catch(() => []);
          const userWaters = await db.collection('waters').find(query).toArray().catch(() => []);
          const userDiets = await db.collection('diets').find(query).toArray().catch(() => []);
          const userGoals = await db.collection('dailygoals').find(query).toArray().catch(() => []);

          const contexts: DailyContext[] = [];
          const datesMap = new Map<string, { duration: number; waterMl: number; hr?: number; cal?: number }>();

          for (const w of userWorkouts) {
            const dStr = w.createdAt ? new Date(w.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            const prev = datesMap.get(dStr) || { duration: 0, waterMl: 0 };
            prev.duration += Number(w.duration) || 30;
            if (w.heartRate) prev.hr = Number(w.heartRate);
            if (w.caloriesBurned) prev.cal = (prev.cal || 0) + Number(w.caloriesBurned);
            datesMap.set(dStr, prev);
          }

          for (const wat of userWaters) {
            const dStr = wat.dateKey || (wat.createdAt ? new Date(wat.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
            const prev = datesMap.get(dStr) || { duration: 0, waterMl: 0 };
            prev.waterMl += Number(wat.totalIntakeMl) || 0;
            datesMap.set(dStr, prev);
          }

          const todayStr = new Date().toISOString().split('T')[0];
          if (!datesMap.has(todayStr)) {
            datesMap.set(todayStr, { duration: 45, waterMl: 2200 });
          }

          let dayIndex = 0;
          for (const [dateStr, info] of datesMap.entries()) {
            const recScore = Math.min(95, Math.max(55, Math.round(75 + (info.waterMl > 2000 ? 5 : -5) + (info.duration > 30 ? 5 : 0))));
            contexts.push({
              id: `ctx-${u.id}-${dayIndex++}`,
              userId: u.id,
              date: dateStr,
              sleepHours: 7.2,
              sleepDuration: 7.2,
              sleepQuality: 7,
              energyLevel: 7,
              energy: 7,
              fatigueLevel: 4,
              fatigue: 4,
              sorenessLevel: 3,
              soreness: 3,
              recoveryScore: recScore,
              recoveryStatus: recScore >= 75 ? 'good' : 'moderate',
              stressLevel: 4,
              stress: 4,
              mood: 'good',
              cognitiveLoad: 4,
              availableMinutes: Math.max(30, info.duration || 45),
              preferredTime: 'evening',
              environment: 'home',
              equipmentAvailable: ['Dumbbells', 'Bodyweight'],
              hydrationLiters: +(info.waterMl / 1000).toFixed(2),
              notes: userDiets.length > 0 ? `Diet Plan: ${userDiets[0].goal || 'Balanced'}` : 'Consistent baseline wellness logged.',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }

          this.dailyContextHistories[u.id] = contexts.sort((a, b) => a.date.localeCompare(b.date));

          if (userGoals.length > 0 && (!this.goals[u.id] || this.goals[u.id].length === 0)) {
            const dg = userGoals[0];
            this.goals[u.id] = [
              {
                id: `goal-${u.id}-1`,
                title: `Daily Workout Target (${dg.dailyWorkoutTarget || 1} session/day)`,
                category: 'consistency',
                targetDate: '2026-12-31',
                currentProgress: 80,
                status: 'on_track',
                priority: 'primary',
                conflictStatus: 'none',
                strategyAdjustment: 'Maintain current cadence'
              },
              {
                id: `goal-${u.id}-2`,
                title: `Daily Calorie Target (${dg.dailyCalorieTarget || 400} kcal active burn)`,
                category: 'metabolic',
                targetDate: '2026-12-31',
                currentProgress: 75,
                status: 'on_track',
                priority: 'secondary',
                conflictStatus: 'none',
                strategyAdjustment: 'Fuel appropriately pre-workout'
              },
              {
                id: `goal-${u.id}-3`,
                title: `Hydration Target (${((dg.dailyWaterTarget || 3000) / 1000).toFixed(1)}L / day)`,
                category: 'sleep',
                targetDate: '2026-12-31',
                currentProgress: 85,
                status: 'on_track',
                priority: 'supporting',
                conflictStatus: 'none',
                strategyAdjustment: 'Distribute fluid intake across daylight hours'
              }
            ];
          }

          this.recalculateEvolvingState(u.id);
          this.rebalanceAdaptivePlan(u.id);
        }
      }

      console.log(`[MongoDB] Synchronization complete. Store users count: ${Object.keys(this.users).length}.`);
      this.persist();
    } catch (err: any) {
      console.error('[MongoDB] Error during loadFromMongoDB:', err?.message || err);
    }
  }

  // ==========================================
  // AUTH & USER ACCOUNT MANAGEMENT
  // ==========================================

  public createUser(userData: {
    email: string;
    passwordHash: string;
    name: string;
    role?: 'research_participant' | 'user' | 'admin';
    onboardingComplete?: boolean;
  }): UserAccount {
    const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const user: UserAccount = {
      id,
      email: userData.email.toLowerCase().trim(),
      passwordHash: userData.passwordHash,
      name: userData.name.trim(),
      role: userData.role || 'user',
      timezone: 'UTC',
      onboardingComplete: userData.onboardingComplete ?? false,
      createdAt: now,
      updatedAt: now
    };

    this.users[id] = user;

    // Initialize user profile
    this.userProfiles[id] = {
      id,
      name: user.name,
      age: 30,
      gender: 'Not specified',
      heightCm: 175,
      weightKg: 70,
      bmi: 22.9,
      fitnessLevel: 'intermediate',
      healthConditions: [],
      fitnessGoals: ['Build daily exercise consistency', 'Improve overall cardiovascular stamina'],
      nutritionGoals: ['Consistent hydration (min 2.0L/day)'],
      activityPreferences: ['Zone 2 Running', 'Bodyweight HIIT', 'Mobility & Stretching'],
      preferredWorkoutTypes: ['Home functional fitness', 'Low-impact active recovery'],
      preferredEnvironment: 'home',
      availableEquipment: ['Yoga mat', 'Adjustable dumbbells']
    };

    // Initialize daily context
    const todayDate = new Date().toISOString().split('T')[0];
    const initialCtx: DailyContext = {
      id: `ctx-${id}-today`,
      userId: id,
      date: todayDate,
      sleepHours: 7.0,
      sleepDuration: 7.0,
      sleepQuality: 7,
      energyLevel: 6,
      energy: 6,
      fatigueLevel: 5,
      fatigue: 5,
      stressLevel: 4,
      stress: 4,
      sorenessLevel: 2,
      soreness: 2,
      recoveryScore: 72,
      recoveryStatus: 'good',
      mood: 'good',
      cognitiveLoad: 4,
      availableMinutes: 30,
      preferredTime: 'morning',
      environment: 'home',
      equipmentAvailable: ['Yoga mat', 'Adjustable dumbbells'],
      activityPreference: 'Mobility & Stretching',
      currentPreferences: 'Starting my personalized health habit with HealthPilot AI.',
      hydrationLiters: 1.8,
      notes: 'Initial profile setup'
    };

    this.dailyContextHistories[id] = [initialCtx];

    // Initialize goals (new users start with no goals until personalized during onboarding)
    this.goals[id] = [];

    this.outcomes[id] = [];
    this.recommendationHistories[id] = [];
    this.predictionRecords[id] = [];
    this.whatIfScenarios[id] = [];

    // Initialize adaptive plan
    this.adaptivePlans[id] = this.createInitialPlanPayload(id);

    // Calculate evolving state
    this.recalculateEvolvingState(id);

    this.persist();
    return user;
  }

  public findUserByEmail(email: string): UserAccount | null {
    const normalized = email.toLowerCase().trim();
    for (const u of Object.values(this.users)) {
      if (u.email.toLowerCase() === normalized) {
        return { ...u };
      }
    }
    return null;
  }

  public async findUserByEmailAsync(email: string): Promise<UserAccount | null> {
    const existing = this.findUserByEmail(email);
    if (existing) return existing;

    // If not found in memory, query directly from MongoDB if connected
    if (isMongoDBConnected() && mongoose.connection.db) {
      try {
        const normalized = email.toLowerCase().trim();
        const rawUser = await mongoose.connection.db.collection('users').findOne({
          email: { $regex: new RegExp(`^${normalized}$`, 'i') }
        });
        if (rawUser) {
          const id = String(rawUser._id);
          const user: UserAccount = {
            id,
            email: (rawUser.email || '').toLowerCase().trim(),
            passwordHash: rawUser.password || rawUser.passwordHash || '',
            name: rawUser.fullName || rawUser.name || 'User',
            role: (rawUser.role as any) || 'user',
            timezone: rawUser.timezone || 'UTC',
            onboardingComplete: false,
            createdAt: rawUser.createdAt ? new Date(rawUser.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: rawUser.updatedAt ? new Date(rawUser.updatedAt).toISOString() : new Date().toISOString()
          };
          this.users[id] = user;

          // Check if healthprofile exists
          const hp = await mongoose.connection.db.collection('healthprofiles').findOne({ user: rawUser._id });
          if (hp) {
            user.onboardingComplete = true;
            this.userProfiles[id] = {
              id,
              name: user.name,
              age: Number(hp.age) || 25,
              gender: hp.gender || 'Not specified',
              heightCm: Number(hp.height) || 170,
              weightKg: Number(hp.weight) || 65,
              bmi: Number(hp.bmi) || +(Number(hp.weight) / Math.pow(Number(hp.height) / 100, 2)).toFixed(1),
              fitnessLevel: (hp.activityLevel || '').toLowerCase().includes('very') ? 'advanced' : 'intermediate',
              healthConditions: [],
              fitnessGoals: [hp.goal || 'Gain Muscle'],
              nutritionGoals: ['Adequate protein', 'Optimal hydration'],
              activityPreferences: [hp.activityLevel || 'General Fitness'],
              preferredWorkoutTypes: ['Strength', 'Functional Fitness'],
              preferredEnvironment: 'flexible',
              availableEquipment: ['Bodyweight', 'Dumbbells']
            };
          }

          this.recalculateEvolvingState(id);
          this.rebalanceAdaptivePlan(id);
          this.persist();
          return { ...user };
        }
      } catch (err: any) {
        console.warn('[DB] Error querying user directly from MongoDB:', err?.message);
      }
    }

    return null;
  }

  public findUserById(id: string): UserAccount | null {
    if (this.users[id]) {
      return { ...this.users[id] };
    }
    return null;
  }

  public async findUserByIdAsync(id: string): Promise<UserAccount | null> {
    const existing = this.findUserById(id);
    if (existing) return existing;

    if (isMongoDBConnected() && mongoose.connection.db) {
      try {
        let query: any = { _id: id };
        if (mongoose.Types.ObjectId.isValid(id)) {
          query = { $or: [{ _id: new mongoose.Types.ObjectId(id) }, { _id: id }] };
        }
        const rawUser = await mongoose.connection.db.collection('users').findOne(query);
        if (rawUser) {
          const userId = String(rawUser._id);
          const user: UserAccount = {
            id: userId,
            email: (rawUser.email || '').toLowerCase().trim(),
            passwordHash: rawUser.password || rawUser.passwordHash || '',
            name: rawUser.fullName || rawUser.name || 'User',
            role: (rawUser.role as any) || 'user',
            timezone: rawUser.timezone || 'UTC',
            onboardingComplete: !!rawUser.onboardingComplete,
            createdAt: rawUser.createdAt ? new Date(rawUser.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: rawUser.updatedAt ? new Date(rawUser.updatedAt).toISOString() : new Date().toISOString()
          };
          this.users[userId] = user;
          return { ...user };
        }
      } catch (err: any) {
        console.warn('[DB] Error querying user by ID from MongoDB:', err?.message);
      }
    }

    return null;
  }

  public updateUser(id: string, updates: Partial<UserAccount>): UserAccount | null {
    if (!this.users[id]) return null;
    this.users[id] = {
      ...this.users[id],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    if (updates.name && this.userProfiles[id]) {
      this.userProfiles[id].name = updates.name;
    }
    this.persist();
    return { ...this.users[id] };
  }

  // ==========================================
  // USER PROFILE
  // ==========================================

  public getUserProfile(userId: string = 'user-001'): UserProfile {
    if (!this.userProfiles[userId]) {
      // Fallback: If user exists, create standard profile
      const user = this.users[userId];
      this.userProfiles[userId] = {
        id: userId,
        name: user ? user.name : 'HealthPilot User',
        age: 30,
        gender: 'Not specified',
        heightCm: 175,
        weightKg: 70,
        bmi: 22.9,
        fitnessLevel: 'intermediate',
        healthConditions: [],
        fitnessGoals: ['Consistency', 'Cardiovascular endurance'],
        nutritionGoals: ['Hydration (2L/day)'],
        activityPreferences: ['Zone 2 Running', 'Mobility yoga'],
        preferredWorkoutTypes: ['Home functional fitness'],
        preferredEnvironment: 'home',
        availableEquipment: ['Yoga mat']
      };
      this.persist();
    }
    return { ...this.userProfiles[userId] };
  }

  public updateUserProfile(arg1: string | Partial<UserProfile> = 'user-001', arg2?: Partial<UserProfile>): UserProfile {
    const userId = typeof arg1 === 'string' ? arg1 : ((arg1 as any)?.id || 'user-001');
    const updates = (typeof arg1 === 'string' ? arg2 : arg1) || {};
    const current = this.getUserProfile(userId);
    const weight = updates.weightKg ?? current.weightKg;
    const height = updates.heightCm ?? current.heightCm;
    const bmi = Number((weight / Math.pow(height / 100, 2)).toFixed(1));

    const updated: UserProfile = {
      ...current,
      ...updates,
      bmi
    };

    this.userProfiles[userId] = updated;

    if (updates.name && this.users[userId]) {
      this.users[userId].name = updates.name;
      this.users[userId].updatedAt = new Date().toISOString();
    }

    if (updates.primaryGoal && this.goals[userId]) {
      const primaryGoalItem = this.goals[userId].find(g => g.priority === 'primary');
      if (primaryGoalItem) {
        primaryGoalItem.title = updates.primaryGoal;
      }
    }

    this.persist();
    return { ...updated };
  }

  // ==========================================
  // RECOVERY & PHYSIOLOGICAL SYSTEM ESTIMATE
  // ==========================================

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

    const sleepRatio = Math.min(100, (sleepHours / 8.0) * 100);
    const qualityMultiplier = 0.70 + (quality / 10) * 0.45;
    const effectiveRest = sleepRatio * qualityMultiplier;
    const energyScore = energy * 10;
    const systemicPenalty = (fatigue * 4.2 + stress * 3.4 + soreness * 2.4);

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

  // ==========================================
  // DAILY CONTEXT
  // ==========================================

  public getLatestDailyContext(userId: string = 'user-001'): DailyContext {
    const history = this.getDailyContextHistory(userId);
    if (history.length > 0) {
      return { ...history[0] };
    }
    // Fallback if empty
    const today = new Date().toISOString().split('T')[0];
    const fallback: DailyContext = {
      id: `ctx-${userId}-today`,
      userId,
      date: today,
      sleepHours: 7.0,
      sleepQuality: 7,
      energyLevel: 6,
      fatigueLevel: 5,
      stressLevel: 4,
      sorenessLevel: 2,
      recoveryScore: 70,
      recoveryStatus: 'good',
      mood: 'balanced',
      cognitiveLoad: 4,
      availableMinutes: 30,
      preferredTime: 'morning',
      environment: 'home',
      equipmentAvailable: ['Yoga mat'],
      activityPreference: 'Mobility & Stretching',
      hydrationLiters: 2.0,
      notes: ''
    };
    this.dailyContextHistories[userId] = [fallback];
    this.persist();
    return fallback;
  }

  public getDailyContext(): DailyContext {
    return this.getLatestDailyContext('user-001');
  }

  public getDailyContextHistory(userId: string = 'user-001'): DailyContext[] {
    if (!this.dailyContextHistories[userId]) {
      this.dailyContextHistories[userId] = [];
    }
    return [...this.dailyContextHistories[userId]];
  }

  public getDailyContextById(userId: string = 'user-001', id: string): DailyContext | null {
    const history = this.getDailyContextHistory(userId);
    const item = history.find(c => c.id === id || (c as any)._id === id);
    return item ? { ...item } : null;
  }

  public saveDailyContext(arg1: string | Partial<DailyContext> = 'user-001', arg2?: Partial<DailyContext>): DailyContext {
    const userId = typeof arg1 === 'string' ? arg1 : ((arg1 as any)?.userId || 'user-001');
    const data = (typeof arg1 === 'string' ? arg2 : arg1) || {};
    const todayDate = data.date || new Date().toISOString().split('T')[0];
    const history = this.getDailyContextHistory(userId);
    const existingIndex = history.findIndex(h => h.date === todayDate);

    const baseRecord: DailyContext = existingIndex >= 0
      ? history[existingIndex]
      : (history[0] || {
          id: `ctx-${userId}-${todayDate}`,
          userId,
          date: todayDate,
          sleepHours: 7.0,
          sleepQuality: 7,
          energyLevel: 6,
          fatigueLevel: 5,
          stressLevel: 5,
          sorenessLevel: 3,
          recoveryScore: 68,
          availableMinutes: 30,
          environment: 'home',
          equipmentAvailable: ['Yoga mat']
        });

    const sleepVal = Number(data.sleepHours ?? data.sleepDuration ?? baseRecord.sleepHours);
    const qualityVal = Number(data.sleepQuality ?? baseRecord.sleepQuality ?? 6);
    const energyVal = Number(data.energyLevel ?? data.energy ?? baseRecord.energyLevel);
    const fatigueVal = Number(data.fatigueLevel ?? data.fatigue ?? baseRecord.fatigueLevel);
    const stressVal = Number(data.stressLevel ?? data.stress ?? baseRecord.stressLevel);
    const sorenessVal = Number(data.sorenessLevel ?? data.soreness ?? baseRecord.sorenessLevel);

    const { score, status } = this.calculateRecoveryEstimate({
      sleepHours: sleepVal,
      sleepQuality: qualityVal,
      energyLevel: energyVal,
      fatigueLevel: fatigueVal,
      stressLevel: stressVal,
      sorenessLevel: sorenessVal
    });

    const savedRecord: DailyContext = {
      ...baseRecord,
      ...data,
      id: baseRecord.id,
      userId,
      date: todayDate,
      sleepHours: sleepVal,
      sleepDuration: sleepVal,
      sleepQuality: qualityVal,
      energyLevel: energyVal,
      energy: energyVal,
      fatigueLevel: fatigueVal,
      fatigue: fatigueVal,
      stressLevel: stressVal,
      stress: stressVal,
      sorenessLevel: sorenessVal,
      soreness: sorenessVal,
      recoveryScore: score,
      recoveryStatus: status,
      availableMinutes: Number(data.availableMinutes ?? baseRecord.availableMinutes),
      environment: data.environment ?? baseRecord.environment,
      equipmentAvailable: data.equipmentAvailable ?? data.equipment ?? baseRecord.equipmentAvailable,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      history[existingIndex] = savedRecord;
    } else {
      history.unshift(savedRecord);
    }

    this.dailyContextHistories[userId] = history;
    this.recalculateEvolvingState(userId);
    this.persist();

    return { ...savedRecord };
  }

  public updateDailyContext(arg1: string | Partial<DailyContext> = 'user-001', arg2?: Partial<DailyContext>): DailyContext {
    return this.saveDailyContext(arg1, arg2);
  }

  public updateDailyContextById(arg1: string, arg2: string | Partial<DailyContext>, arg3?: Partial<DailyContext>): DailyContext | null {
    let userId = 'user-001';
    let id = arg1;
    let updates: Partial<DailyContext> = {};

    if (typeof arg2 === 'string') {
      userId = arg1;
      id = arg2;
      updates = arg3 || {};
    } else {
      userId = 'user-001';
      id = arg1;
      updates = arg2 || {};
    }

    const history = this.getDailyContextHistory(userId);
    const idx = history.findIndex(h => h.id === id);
    if (idx === -1) return null;

    const base = history[idx];
    const saved = this.saveDailyContext(userId, { ...base, ...updates });
    return saved;
  }

  // ==========================================
  // RECALCULATE EVOLVING USER STATE
  // ==========================================

  public recalculateEvolvingState(userId: string = 'user-001'): EvolvingUserState {
    const ctx = this.getLatestDailyContext(userId);
    const outcomes = this.getOutcomes(userId);
    const goals = this.getGoals(userId);

    const { score: recoveryScore, status: recoveryLevel } = this.calculateRecoveryEstimate({
      sleepHours: ctx.sleepHours,
      sleepQuality: ctx.sleepQuality,
      energyLevel: ctx.energyLevel,
      fatigueLevel: ctx.fatigueLevel,
      stressLevel: ctx.stressLevel,
      sorenessLevel: ctx.sorenessLevel
    });

    const physicalStrainScore = Math.min(100, Math.round(ctx.fatigueLevel * 5.5 + ctx.sorenessLevel * 4.5));
    const energyState: 'high' | 'moderate' | 'low' = ctx.energyLevel >= 7 ? 'high' : ctx.energyLevel <= 4 ? 'low' : 'moderate';
    const fatigueState: 'high' | 'moderate' | 'low' = ctx.fatigueLevel >= 7 ? 'high' : ctx.fatigueLevel <= 3 ? 'low' : 'moderate';
    const stressState: 'high' | 'moderate' | 'low' = ctx.stressLevel >= 7 ? 'high' : ctx.stressLevel <= 3 ? 'low' : 'moderate';
    const cognitiveLoad = Math.min(100, Math.round(ctx.stressLevel * 8.5 + (ctx.cognitiveLoad ? ctx.cognitiveLoad * 4 : 12)));

    // Behavioral momentum from outcomes
    const recent = outcomes.slice(0, 10);
    const completedCount = recent.filter(o => o.outcomeStatus === 'completed').length;
    const partialCount = recent.filter(o => o.outcomeStatus === 'partially_completed').length;
    const skippedCount = recent.filter(o => o.outcomeStatus === 'skipped').length;
    const adherenceRate = recent.length > 0 ? Math.round(((completedCount + 0.5 * partialCount) / recent.length) * 100) : 75;

    let momentumScore = 65;
    if (recent.length > 0) {
      momentumScore = Math.max(15, Math.min(95, Math.round(adherenceRate * 0.8 + (10 - ctx.fatigueLevel) * 2)));
    }

    let momentumLabel: 'Strong' | 'Moderate' | 'Low' = 'Moderate';
    let momentumRationale = `Routine momentum (${momentumScore}/100) based on ${completedCount}/${recent.length} recent completions.`;
    if (momentumScore >= 75) {
      momentumLabel = 'Strong';
      momentumRationale = `Strong follow-through momentum (${momentumScore}/100) across recent sessions.`;
    } else if (momentumScore < 45) {
      momentumLabel = 'Low';
      momentumRationale = `Low adherence momentum (${momentumScore}/100) with recent skips.`;
    }

    let adaptationStatus: 'primed' | 'steady' | 'fatigued' | 'overreaching' | 'recovery_needed' = 'steady';
    if (recoveryScore < 48 || ctx.fatigueLevel >= 7) {
      adaptationStatus = 'recovery_needed';
    } else if (momentumScore >= 75 && recoveryScore >= 75) {
      adaptationStatus = 'primed';
    }

    const primaryGoal = goals.find(g => g.priority === 'primary') || goals[0];
    const hasGoalConflict = recoveryScore < 50 && primaryGoal?.category === 'endurance';

    const newState: EvolvingUserState = {
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
      behavioralMomentum: momentumScore,
      behavioralMomentumLabel: momentumLabel,
      behavioralMomentumRationale: momentumRationale,
      weeklyAdherenceRate: adherenceRate,
      recentCompletionRatio: `${completedCount}/${recent.length || 0} completed`,
      dominantBarrier: skippedCount > 0 ? 'Schedule crunch & fatigue' : 'None reported',
      adaptationStatus,
      availableMinutes: ctx.availableMinutes,
      currentEnvironment: ctx.environment,
      preferredTimeOfDay: ctx.preferredTime || 'morning',
      availableEquipmentCount: ctx.equipmentAvailable?.length || 1,
      primaryGoalTitle: primaryGoal?.title || 'Habit Consistency',
      activeGoalConflictsCount: hasGoalConflict ? 1 : 0,
      hasGoalConflict,
      goalConflictSummary: hasGoalConflict
        ? `Recovery readiness (${recoveryScore}%) conflicts with target intensity for ${primaryGoal?.title}.`
        : undefined,
      stateExplanation: `Recovery readiness is estimated at ${recoveryScore}% (${recoveryLevel?.toUpperCase()}) with ${ctx.availableMinutes}m available at ${ctx.environment}.`,
      isSystemEstimate: true,
      lastUpdated: new Date().toISOString()
    };

    this.evolvingStates[userId] = newState;
    return { ...newState };
  }

  public getEvolvingState(userId: string = 'user-001'): EvolvingUserState {
    if (!this.evolvingStates[userId]) {
      return this.recalculateEvolvingState(userId);
    }
    return { ...this.evolvingStates[userId] };
  }

  // ==========================================
  // OUTCOME JOURNAL & FEEDBACK LOOP
  // ==========================================

  public getOutcomes(userId: string = 'user-001'): RecommendationOutcome[] {
    if (!this.outcomes[userId]) {
      this.outcomes[userId] = [];
    }
    return [...this.outcomes[userId]];
  }

  public addOutcome(arg1: string | Omit<RecommendationOutcome, 'id' | 'timestamp'>, arg2?: Omit<RecommendationOutcome, 'id' | 'timestamp'>): RecommendationOutcome {
    const userId = typeof arg1 === 'string' ? arg1 : 'user-001';
    const outcomeData = (typeof arg1 === 'string' ? arg2 : arg1) as Omit<RecommendationOutcome, 'id' | 'timestamp'>;

    const newOutcome: RecommendationOutcome = {
      ...outcomeData,
      id: `out-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    if (!this.outcomes[userId]) this.outcomes[userId] = [];
    this.outcomes[userId].unshift(newOutcome);

    // Update prediction records if matching
    const preds = this.getPredictionRecords(userId);
    const predMatch = preds.find(p => p.recommendationId === outcomeData.recommendationId) || preds.find(p => !p.actualOutcomeStatus);
    if (predMatch) {
      predMatch.actualOutcomeStatus = outcomeData.outcomeStatus;
      predMatch.actualDurationMinutes = outcomeData.actualDurationMinutes;
    }

    // Feedback Loop: Adapt plan based on empirical evidence
    this.recalculateEvolvingState(userId);

    // Adapt plan in adaptivePlanEngine
    adaptivePlanEngine.recordOutcomeInPlan(newOutcome);
    adaptivePlanEngine.evaluateAndAdaptPlan(
      this.getEvolvingState(userId),
      this.getOutcomes(userId),
      this.getUserProfile(userId),
      this.getPersonalBehavioralProfile(userId),
      this.getGoals(userId)
    );
    const updatedPlan = adaptivePlanEngine.getPlanPayload(
      this.getEvolvingState(userId),
      this.getOutcomes(userId)
    );
    this.adaptivePlans[userId] = updatedPlan;

    this.persist();
    return newOutcome;
  }

  // ==========================================
  // GOALS & STRATEGY
  // ==========================================

  public getGoals(userId: string = 'user-001'): GoalStrategyItem[] {
    if (!this.goals[userId]) {
      this.goals[userId] = [];
    }
    return [...this.goals[userId]];
  }

  public updateGoal(arg1: string, arg2: string | Partial<GoalStrategyItem>, arg3?: Partial<GoalStrategyItem>): GoalStrategyItem | null {
    let userId = 'user-001';
    let id = arg1;
    let updates: Partial<GoalStrategyItem> = {};

    if (typeof arg2 === 'string') {
      userId = arg1;
      id = arg2;
      updates = arg3 || {};
    } else {
      userId = 'user-001';
      id = arg1;
      updates = arg2 || {};
    }

    const goals = this.getGoals(userId);
    const idx = goals.findIndex(g => g.id === id);
    if (idx === -1) return null;

    goals[idx] = { ...goals[idx], ...updates };
    this.goals[userId] = goals;
    this.persist();
    return { ...goals[idx] };
  }

  // ==========================================
  // ADAPTIVE PLAN
  // ==========================================

  public getAdaptivePlan(userId: string = 'user-001'): AdaptivePlanDay[] {
    return this.getAdaptivePlanPayload(userId).days;
  }

  public getAdaptivePlanPayload(userId: string = 'user-001'): AdaptivePlanPayload {
    const currentWeek = getWeekDates(new Date());
    const currentWeekStart = currentWeek[0].date;

    const existing = this.adaptivePlans[userId];
    const needsRefresh = !existing || 
      !existing.days || 
      existing.days.length === 0 || 
      !existing.days[0]?.date ||
      existing.days[0]?.date === 'Today' ||
      existing.days[0]?.date !== currentWeekStart;

    if (needsRefresh) {
      this.adaptivePlans[userId] = this.createInitialPlanPayload(userId);
      this.persist();
    }
    return { ...this.adaptivePlans[userId] };
  }

  public rebalanceAdaptivePlan(userId: string = 'user-001'): AdaptivePlanPayload {
    adaptivePlanEngine.evaluateAndAdaptPlan(
      this.getEvolvingState(userId),
      this.getOutcomes(userId),
      this.getUserProfile(userId),
      this.getPersonalBehavioralProfile(userId),
      this.getGoals(userId)
    );
    const adapted = adaptivePlanEngine.getPlanPayload(
      this.getEvolvingState(userId),
      this.getOutcomes(userId)
    );
    this.adaptivePlans[userId] = adapted;
    this.persist();
    return adapted;
  }

  public resetAdaptivePlan(userId: string = 'user-001'): AdaptivePlanPayload {
    adaptivePlanEngine.resetToBaseline();
    const reset = adaptivePlanEngine.getPlanPayload(
      this.getEvolvingState(userId),
      this.getOutcomes(userId)
    );
    this.adaptivePlans[userId] = reset;
    this.persist();
    return reset;
  }

  public getAdaptationHistory(userId: string = 'user-001'): PlanAdaptationEvent[] {
    return this.getAdaptivePlanPayload(userId).adaptationEvents || [];
  }

  private createInitialPlanPayload(userId: string): AdaptivePlanPayload {
    const weekDates = getWeekDates(new Date());
    const templateDays = [
      {
        title: '20-Min Restorative Spinal Mobility & Breathwork',
        category: 'recovery' as const,
        durationMinutes: 20,
        intensity: 'low' as const
      },
      {
        title: '25-Min Home Dumbbell Functional Strength',
        category: 'workout' as const,
        durationMinutes: 25,
        intensity: 'moderate' as const
      },
      {
        title: '30-Min Aerobic Zone 2 Cardio Flow',
        category: 'workout' as const,
        durationMinutes: 30,
        intensity: 'moderate' as const
      },
      {
        title: 'Active Rest & Parasympathetic Walk',
        category: 'active_rest' as const,
        durationMinutes: 25,
        intensity: 'low' as const
      },
      {
        title: 'Threshold Interval Circuit (HIIT)',
        category: 'workout' as const,
        durationMinutes: 30,
        intensity: 'high' as const
      },
      {
        title: 'Full Body Functional Mobility & Core',
        category: 'workout' as const,
        durationMinutes: 30,
        intensity: 'moderate' as const
      },
      {
        title: 'Deload & Deep Tissue Recovery Flow',
        category: 'recovery' as const,
        durationMinutes: 30,
        intensity: 'low' as const
      }
    ];

    const days: AdaptivePlanDay[] = weekDates.map((w, idx) => {
      const t = templateDays[idx % templateDays.length];
      return {
        id: `plan-${userId}-${idx + 1}`,
        dayOfWeek: w.dayOfWeek,
        dayName: w.dayOfWeek,
        date: w.date,
        title: t.title,
        plannedSession: t.title,
        category: t.category,
        durationMinutes: t.durationMinutes,
        intensity: t.intensity,
        isAdaptiveAdapted: false,
        status: isPast(w.date) ? 'completed' : 'scheduled'
      };
    });

    return {
      days,
      baselineDays: [...days],
      activeAdaptationsCount: 0,
      lastRebalancedAt: new Date().toISOString(),
      momentumStatus: 'Moderate',
      momentumScore: 65,
      adaptationEvents: [],
      dataSufficiency: 'moderate',
      dataSufficiencyNotice: 'Active calendar plan aligned to current week.'
    };
  }

  // ==========================================
  // RECOMMENDATION HISTORY
  // ==========================================

  public getRecommendationHistory(userId: string = 'user-001'): RecommendationHistoryItem[] {
    if (!this.recommendationHistories[userId]) {
      this.recommendationHistories[userId] = [];
    }
    return [...this.recommendationHistories[userId]];
  }

  public recordRecommendationHistory(arg1: string | Omit<RecommendationHistoryItem, 'id'> = 'user-001', arg2?: Omit<RecommendationHistoryItem, 'id'>): RecommendationHistoryItem {
    const userId = typeof arg1 === 'string' ? arg1 : ((arg1 as any)?.userId || 'user-001');
    const item = (typeof arg1 === 'string' ? arg2 : arg1) as Omit<RecommendationHistoryItem, 'id'>;

    const record: RecommendationHistoryItem = {
      ...item,
      id: `rec-hist-${Date.now()}`
    };
    if (!this.recommendationHistories[userId]) this.recommendationHistories[userId] = [];
    this.recommendationHistories[userId].unshift(record);
    this.persist();
    return record;
  }

  // ==========================================
  // WHAT-IF SCENARIOS
  // ==========================================

  public getWhatIfScenarios(userId: string = 'user-001'): WhatIfScenarioRecord[] {
    if (!this.whatIfScenarios[userId]) {
      this.whatIfScenarios[userId] = [];
    }
    return [...this.whatIfScenarios[userId]];
  }

  public recordWhatIfScenario(arg1: string | Omit<WhatIfScenarioRecord, 'id' | 'timestamp'> = 'user-001', arg2?: Omit<WhatIfScenarioRecord, 'id' | 'timestamp'>): WhatIfScenarioRecord {
    const userId = typeof arg1 === 'string' ? arg1 : ((arg1 as any)?.userId || 'user-001');
    const record = (typeof arg1 === 'string' ? arg2 : arg1) as Omit<WhatIfScenarioRecord, 'id' | 'timestamp'>;

    const scenario: WhatIfScenarioRecord = {
      ...record,
      id: `whatif-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    if (!this.whatIfScenarios[userId]) this.whatIfScenarios[userId] = [];
    this.whatIfScenarios[userId].unshift(scenario);
    this.persist();
    return scenario;
  }

  // ==========================================
  // PREDICTIONS & ML METADATA
  // ==========================================

  public getPredictionRecords(userId: string = 'user-001'): AdherencePredictionRecord[] {
    if (!this.predictionRecords[userId]) {
      this.predictionRecords[userId] = [];
    }
    return [...this.predictionRecords[userId]];
  }

  public addPredictionRecord(arg1: string | Omit<AdherencePredictionRecord, 'id' | 'predictionTimestamp'> = 'user-001', arg2?: Omit<AdherencePredictionRecord, 'id' | 'predictionTimestamp'>): AdherencePredictionRecord {
    const userId = typeof arg1 === 'string' ? arg1 : ((arg1 as any)?.userId || 'user-001');
    const rec = (typeof arg1 === 'string' ? arg2 : arg1) as Omit<AdherencePredictionRecord, 'id' | 'predictionTimestamp'>;

    const newRecord: AdherencePredictionRecord = {
      ...rec,
      id: `pred-${Date.now()}`,
      predictionTimestamp: new Date().toISOString()
    };
    if (!this.predictionRecords[userId]) this.predictionRecords[userId] = [];
    this.predictionRecords[userId].unshift(newRecord);
    this.persist();
    return newRecord;
  }

  public getMLModelMetadata(): MLModelMetadata | null {
    return this.activeMLModelMetadata ? { ...this.activeMLModelMetadata } : null;
  }

  public setMLModelMetadata(metadata: MLModelMetadata): void {
    this.activeMLModelMetadata = { ...metadata };
    this.persist();
  }

  // ==========================================
  // BEHAVIORAL PATTERN ANALYSIS ENGINE
  // ==========================================

  public calculateBehavioralAnalysis(userId: string = 'user-001'): {
    summary: BehaviorPatternSummary;
    profile: PersonalBehavioralProfile;
    patterns: BehavioralPatternsData;
  } {
    const outcomes = this.getOutcomes(userId);
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

    // Duration buckets
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

    const activeDurations = durationPatterns.filter(d => d.total > 0);
    const bestDurationBucket = activeDurations.length > 0
      ? [...activeDurations].sort((a, b) => b.completionRate - a.completionRate || b.total - a.total)[0]
      : null;

    // Environment patterns
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

    // Activity types
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

    // Time of day
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

    // Barriers
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

    // Conditions
    const highEnergy = outcomes.filter(o => (o.contextSnapshot?.energyLevel ?? 5) >= 7);
    const lowEnergy = outcomes.filter(o => (o.contextSnapshot?.energyLevel ?? 5) <= 4);
    const highEnergyRate = highEnergy.length ? Math.round((highEnergy.filter(o => o.outcomeStatus === 'completed').length / highEnergy.length) * 100) : 0;
    const lowEnergyRate = lowEnergy.length ? Math.round((lowEnergy.filter(o => o.outcomeStatus === 'completed').length / lowEnergy.length) * 100) : 0;

    const lowFatigue = outcomes.filter(o => (o.contextSnapshot?.fatigueLevel ?? 5) <= 4);
    const highFatigue = outcomes.filter(o => (o.contextSnapshot?.fatigueLevel ?? 5) >= 7);
    const lowFatigueRate = lowFatigue.length ? Math.round((lowFatigue.filter(o => o.outcomeStatus === 'completed').length / lowFatigue.length) * 100) : 0;
    const highFatigueRate = highFatigue.length ? Math.round((highFatigue.filter(o => o.outcomeStatus === 'completed').length / highFatigue.length) * 100) : 0;

    const goodSleep = outcomes.filter(o => (o.contextSnapshot?.sleepHours ?? 7) >= 7.0);
    const shortSleep = outcomes.filter(o => (o.contextSnapshot?.sleepHours ?? 7) < 6.0);
    const goodSleepRate = goodSleep.length ? Math.round((goodSleep.filter(o => o.outcomeStatus === 'completed').length / goodSleep.length) * 100) : 0;
    const shortSleepRate = shortSleep.length ? Math.round((shortSleep.filter(o => o.outcomeStatus === 'completed').length / shortSleep.length) * 100) : 0;

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

    const learnedInsights: string[] = [];
    let keyObservation = '';

    if (total < 3) {
      learnedInsights.push('We are still learning your behavior. Complete a few activities to unlock personalized behavioral insights.');
      keyObservation = 'HealthPilot AI is currently gathering baseline outcome data. Log daily outcomes to reveal personalized behavioral patterns.';
    } else {
      if (bestDurationBucket && activeDurations.length > 1) {
        learnedInsights.push(`Highest follow-through occurs in the ${bestDurationBucket.range} duration window with a ${bestDurationBucket.completionRate}% completion rate.`);
      }
      if (bestEnv) {
        learnedInsights.push(`Completion rate is highest for ${bestEnv.label}-based activities at ${bestEnv.completionRate}%.`);
      }
      if (commonBarriers.length > 0) {
        learnedInsights.push(`${commonBarriers[0].label} is currently your most frequent reported barrier (${commonBarriers[0].percentage}% of non-completed sessions).`);
      }
      keyObservation = `Your completion rate is highest (${bestDurationBucket ? bestDurationBucket.completionRate : completionRateOverall}%) for ${bestDurationBucket ? bestDurationBucket.range : '20–30 minute'} sessions.`;
    }

    const strongestAdherenceConditions: string[] = [];
    const weakAdherenceConditions: string[] = [];

    if (total >= 3) {
      if (completionRateHome >= 75) strongestAdherenceConditions.push(`Home environment (${completionRateHome}% completion)`);
      if (goodSleepRate >= 75) strongestAdherenceConditions.push(`Restorative sleep (≥7.0h: ${goodSleepRate}% completion)`);
      if (highEnergyRate >= 75) strongestAdherenceConditions.push(`High energy readiness (${highEnergyRate}% completion)`);

      if (highFatigueRate > 0 && highFatigueRate < 50) weakAdherenceConditions.push(`High acute fatigue (≥7: ${highFatigueRate}% completion)`);
      if (shortSleepRate > 0 && shortSleepRate < 50) weakAdherenceConditions.push(`Short sleep (<6.0h: ${shortSleepRate}% completion)`);
      if (completionRateGym > 0 && completionRateGym < 60) weakAdherenceConditions.push(`Gym workouts (${completionRateGym}% completion)`);
    }

    const preferredEnvStr = bestEnv ? bestEnv.label : 'Home';

    const profile: PersonalBehavioralProfile = {
      userId,
      calculatedAt: new Date().toISOString(),
      observationCount: total,
      dataSufficiency,
      dataSufficiencyText,
      preferredDuration: bestDurationBucket ? bestDurationBucket.range : '20–30 min',
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

  public getBehaviorPatternSummary(userId: string = 'user-001'): BehaviorPatternSummary {
    return this.calculateBehavioralAnalysis(userId).summary;
  }

  public getPersonalBehavioralProfile(userId: string = 'user-001'): PersonalBehavioralProfile {
    return this.calculateBehavioralAnalysis(userId).profile;
  }

  public getBehavioralPatterns(userId: string = 'user-001'): BehavioralPatternsData {
    return this.calculateBehavioralAnalysis(userId).patterns;
  }

  public recalculateBehavioralProfile(userId: string = 'user-001') {
    const analysis = this.calculateBehavioralAnalysis(userId);
    const state = this.getEvolvingState(userId);
    state.weeklyAdherenceRate = analysis.profile.overallRecentAdherence;
    state.dominantBarrier = analysis.profile.dominantBarrier;
    state.lastUpdated = new Date().toISOString();
    this.evolvingStates[userId] = state;
    this.persist();
    return analysis;
  }

  // ==========================================
  // BENCHMARK SEED DATA INITIALIZER (RESEARCH INTEGRITY)
  // ==========================================

  private seedBenchmarkData(): void {
    const defaultPasswordHash = bcrypt.hashSync('password123', 10);

    // Seed research user: Alex Vance
    this.users['user-001'] = {
      id: 'user-001',
      email: 'alex.vance@example.com',
      passwordHash: defaultPasswordHash,
      name: 'Alex Vance',
      role: 'research_participant',
      timezone: 'UTC',
      onboardingComplete: true,
      createdAt: '2026-09-01T08:00:00.000Z',
      updatedAt: '2026-09-01T08:00:00.000Z'
    };

    this.userProfiles['user-001'] = {
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

    // 14 Dated context records for Alex Vance
    this.dailyContextHistories['user-001'] = [
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
        sleepHours: 7.5,
        sleepDuration: 7.5,
        sleepQuality: 8,
        energyLevel: 8,
        energy: 8,
        fatigueLevel: 3,
        fatigue: 3,
        stressLevel: 3,
        stress: 3,
        sorenessLevel: 2,
        soreness: 2,
        recoveryScore: 84,
        recoveryStatus: 'good',
        mood: 'great',
        cognitiveLoad: 3,
        availableMinutes: 50,
        preferredTime: 'morning',
        environment: 'outdoor',
        equipmentAvailable: ['Running shoes', 'Foam roller'],
        activityPreference: 'Aerobic Cardio',
        currentPreferences: 'Clear head, comfortable morning air.',
        hydrationLiters: 2.6,
        notes: 'Steady aerobic tempo.',
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
        energyLevel: 5,
        energy: 5,
        fatigueLevel: 6,
        fatigue: 6,
        stressLevel: 7,
        stress: 7,
        sorenessLevel: 5,
        soreness: 5,
        recoveryScore: 56,
        recoveryStatus: 'moderate',
        mood: 'fatigued',
        cognitiveLoad: 7,
        availableMinutes: 25,
        preferredTime: 'evening',
        environment: 'gym',
        equipmentAvailable: ['Full commercial gym'],
        activityPreference: 'Functional Strength',
        currentPreferences: 'High work pressure, tight timebox.',
        hydrationLiters: 1.8,
        notes: 'Felt pressed for time.',
        createdAt: '2026-09-04T18:30:00.000Z',
        updatedAt: '2026-09-04T18:30:00.000Z'
      },
      {
        id: 'ctx-d4',
        userId: 'user-001',
        date: '2026-09-03',
        sleepHours: 7.0,
        sleepDuration: 7.0,
        sleepQuality: 7,
        energyLevel: 6,
        energy: 6,
        fatigueLevel: 5,
        fatigue: 5,
        stressLevel: 5,
        stress: 5,
        sorenessLevel: 4,
        soreness: 4,
        recoveryScore: 71,
        recoveryStatus: 'good',
        mood: 'balanced',
        cognitiveLoad: 5,
        availableMinutes: 35,
        preferredTime: 'morning',
        environment: 'home',
        equipmentAvailable: ['Adjustable dumbbells', 'Yoga mat'],
        activityPreference: 'Mobility & Stretching',
        currentPreferences: 'Slight hamstring tightness.',
        hydrationLiters: 2.2,
        notes: 'Good home session.',
        createdAt: '2026-09-03T07:00:00.000Z',
        updatedAt: '2026-09-03T07:00:00.000Z'
      }
    ];

    // Seed goals for Alex Vance
    this.goals['user-001'] = [
      {
        id: 'goal-1',
        title: 'Cardiovascular Aerobic Base (10K sub-50 min)',
        category: 'endurance',
        targetDate: '2026-11-15',
        timeframe: '8 Weeks Remaining',
        targetValue: 'Sub-50:00 10K',
        currentValue: '54:20 Pace',
        currentProgress: 68,
        priority: 'primary',
        status: 'on_track',
        conflictStatus: 'transient_conflict',
        activeConflictFlag: true,
        conflictNote: 'Scheduled threshold intervals conflict with acute fatigue (7/10) and low sleep (5.8h).',
        strategyAdjustment: 'Down-regulate to 20-min gentle mobility today; move threshold intervals to Wednesday when recovery score recovers ≥70%.',
        milestones: [
          { id: 'm1', title: 'Complete 3 weekly Zone 2 aerobic sessions', completed: true },
          { id: 'm2', title: 'Achieve 8km continuous run at <145 bpm', completed: true },
          { id: 'm3', title: 'Break 25:00 in 5K time trial benchmark', completed: false }
        ]
      },
      {
        id: 'goal-2',
        title: 'Posterior Chain & Core Stability',
        category: 'strength',
        targetDate: '2026-12-01',
        timeframe: '10 Weeks Remaining',
        targetValue: '3x10 RDL @ 40kg with neutral spine',
        currentValue: '3x10 @ 32kg',
        currentProgress: 75,
        priority: 'secondary',
        status: 'on_track',
        conflictStatus: 'none',
        activeConflictFlag: false,
        strategyAdjustment: 'Maintain progressive dumbbell loading during high recovery days (Recovery Score ≥ 70%).'
      },
      {
        id: 'goal-3',
        title: 'Sleep Architecture & Autonomic Balance',
        category: 'sleep',
        targetDate: '2026-10-30',
        timeframe: '6 Weeks Remaining',
        targetValue: 'Average 7.5h sleep with >80% recovery score',
        currentValue: '6.8h avg (7-day)',
        currentProgress: 52,
        priority: 'supporting',
        status: 'on_track',
        conflictStatus: 'none',
        activeConflictFlag: false,
        strategyAdjustment: 'Prioritize evening parasympathetic breathwork and wind-down mobility on work-compressed days.'
      }
    ];

    // Benchmark 14 Outcomes for Alex Vance
    this.outcomes['user-001'] = [
      { id: 'out-14', recommendationId: 'rec-14', recommendedActivity: '30-Min Zone 2 Jog', category: 'workout', plannedDurationMinutes: 30, intensity: 'moderate', contextSnapshot: { sleepHours: 7.2, energyLevel: 7, fatigueLevel: 3, stressLevel: 4, availableMinutes: 45, environment: 'outdoor' }, outcomeStatus: 'completed', actualDurationMinutes: 32, userFeedback: 'Felt very smooth, breathing stayed steady.', perceivedEffort: 5, timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
      { id: 'out-13', recommendationId: 'rec-13', recommendedActivity: '45-Min Heavy Gym Strength', category: 'workout', plannedDurationMinutes: 45, intensity: 'high', contextSnapshot: { sleepHours: 5.5, energyLevel: 4, fatigueLevel: 8, stressLevel: 7, availableMinutes: 50, environment: 'gym' }, outcomeStatus: 'skipped', actualDurationMinutes: 0, reasonForSkipOrPartial: 'too_tired', userFeedback: 'Zero energy after poor sleep, went straight to sleep.', perceivedEffort: 0, timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 'out-12', recommendationId: 'rec-12', recommendedActivity: '20-Min Home Mobility Flow', category: 'recovery', plannedDurationMinutes: 20, intensity: 'low', contextSnapshot: { sleepHours: 6.0, energyLevel: 5, fatigueLevel: 7, stressLevel: 6, availableMinutes: 30, environment: 'home' }, outcomeStatus: 'completed', actualDurationMinutes: 20, userFeedback: 'Great relief on hips and lower back.', perceivedEffort: 3, timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
      { id: 'out-11', recommendationId: 'rec-11', recommendedActivity: '35-Min Home Dumbbell Strength', category: 'workout', plannedDurationMinutes: 35, intensity: 'moderate', contextSnapshot: { sleepHours: 7.5, energyLevel: 8, fatigueLevel: 3, stressLevel: 3, availableMinutes: 45, environment: 'home' }, outcomeStatus: 'completed', actualDurationMinutes: 35, userFeedback: 'Solid session, weights felt manageable.', perceivedEffort: 6, timestamp: new Date(Date.now() - 86400000 * 4).toISOString() },
      { id: 'out-10', recommendationId: 'rec-10', recommendedActivity: '25-Min HIIT Interval Sprints', category: 'workout', plannedDurationMinutes: 25, intensity: 'high', contextSnapshot: { sleepHours: 6.5, energyLevel: 6, fatigueLevel: 5, stressLevel: 8, availableMinutes: 30, environment: 'home' }, outcomeStatus: 'partially_completed', actualDurationMinutes: 15, reasonForSkipOrPartial: 'no_time', userFeedback: 'Cut short by incoming meeting call.', perceivedEffort: 7, timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: 'out-9', recommendationId: 'rec-9', recommendedActivity: '40-Min Outdoor Trail Run', category: 'workout', plannedDurationMinutes: 40, intensity: 'moderate', contextSnapshot: { sleepHours: 8.0, energyLevel: 9, fatigueLevel: 2, stressLevel: 2, availableMinutes: 60, environment: 'outdoor' }, outcomeStatus: 'completed', actualDurationMinutes: 42, userFeedback: 'Excellent pace, sunny morning.', perceivedEffort: 6, timestamp: new Date(Date.now() - 86400000 * 6).toISOString() },
      { id: 'out-8', recommendationId: 'rec-8', recommendedActivity: '30-Min Gym Machine Circuit', category: 'workout', plannedDurationMinutes: 30, intensity: 'moderate', contextSnapshot: { sleepHours: 6.8, energyLevel: 6, fatigueLevel: 5, stressLevel: 5, availableMinutes: 40, environment: 'gym' }, outcomeStatus: 'completed', actualDurationMinutes: 30, userFeedback: 'Crowded gym but got it done.', perceivedEffort: 5, timestamp: new Date(Date.now() - 86400000 * 7).toISOString() },
      { id: 'out-7', recommendationId: 'rec-7', recommendedActivity: '15-Min Thoracic & Foam Rolling', category: 'recovery', plannedDurationMinutes: 15, intensity: 'low', contextSnapshot: { sleepHours: 5.8, energyLevel: 4, fatigueLevel: 7, stressLevel: 7, availableMinutes: 20, environment: 'home' }, outcomeStatus: 'completed', actualDurationMinutes: 18, userFeedback: 'Felt looser afterward.', perceivedEffort: 2, timestamp: new Date(Date.now() - 86400000 * 8).toISOString() },
      { id: 'out-6', recommendationId: 'rec-6', recommendedActivity: '45-Min Heavy Lower Body Gym', category: 'workout', plannedDurationMinutes: 45, intensity: 'high', contextSnapshot: { sleepHours: 6.2, energyLevel: 5, fatigueLevel: 6, stressLevel: 6, availableMinutes: 35, environment: 'gym' }, outcomeStatus: 'partially_completed', actualDurationMinutes: 25, reasonForSkipOrPartial: 'no_time', userFeedback: 'No time for cooldown, had to rush.', perceivedEffort: 8, timestamp: new Date(Date.now() - 86400000 * 9).toISOString() },
      { id: 'out-5', recommendationId: 'rec-5', recommendedActivity: '30-Min Kettlebell Home Circuit', category: 'workout', plannedDurationMinutes: 30, intensity: 'moderate', contextSnapshot: { sleepHours: 7.4, energyLevel: 7, fatigueLevel: 4, stressLevel: 4, availableMinutes: 40, environment: 'home' }, outcomeStatus: 'completed', actualDurationMinutes: 30, userFeedback: 'Clean rhythm and good sweating.', perceivedEffort: 6, timestamp: new Date(Date.now() - 86400000 * 10).toISOString() },
      { id: 'out-4', recommendationId: 'rec-4', recommendedActivity: '45-Min Outdoor Tempo Run', category: 'workout', plannedDurationMinutes: 45, intensity: 'high', contextSnapshot: { sleepHours: 5.2, energyLevel: 3, fatigueLevel: 8, stressLevel: 7, availableMinutes: 60, environment: 'outdoor' }, outcomeStatus: 'skipped', actualDurationMinutes: 0, reasonForSkipOrPartial: 'too_tired', userFeedback: 'Severe fatigue, felt lightheaded, rested instead.', perceivedEffort: 0, timestamp: new Date(Date.now() - 86400000 * 11).toISOString() },
      { id: 'out-3', recommendationId: 'rec-3', recommendedActivity: '20-Min Bedtime Yin Yoga', category: 'recovery', plannedDurationMinutes: 20, intensity: 'low', contextSnapshot: { sleepHours: 6.5, energyLevel: 5, fatigueLevel: 6, stressLevel: 6, availableMinutes: 25, environment: 'home' }, outcomeStatus: 'completed', actualDurationMinutes: 22, userFeedback: 'Helped slow racing thoughts before bed.', perceivedEffort: 2, timestamp: new Date(Date.now() - 86400000 * 12).toISOString() },
      { id: 'out-2', recommendationId: 'rec-2', recommendedActivity: '35-Min Bodyweight HIIT Flow', category: 'workout', plannedDurationMinutes: 35, intensity: 'high', contextSnapshot: { sleepHours: 7.6, energyLevel: 8, fatigueLevel: 3, stressLevel: 3, availableMinutes: 45, environment: 'home' }, outcomeStatus: 'completed', actualDurationMinutes: 35, userFeedback: 'Heart rate spiked well, felt energized after.', perceivedEffort: 7, timestamp: new Date(Date.now() - 86400000 * 13).toISOString() },
      { id: 'out-1', recommendationId: 'rec-1', recommendedActivity: '25-Min Posture Alignment Walk', category: 'recovery', plannedDurationMinutes: 25, intensity: 'low', contextSnapshot: { sleepHours: 6.9, energyLevel: 6, fatigueLevel: 5, stressLevel: 5, availableMinutes: 30, environment: 'outdoor' }, outcomeStatus: 'completed', actualDurationMinutes: 25, userFeedback: 'Easy walking in afternoon sun.', perceivedEffort: 3, timestamp: new Date(Date.now() - 86400000 * 14).toISOString() }
    ];

    // Seed prediction records for Alex Vance
    this.predictionRecords['user-001'] = [
      { id: 'pred-14', userId: 'user-001', recommendationId: 'rec-14', recommendationTitle: '30-Min Zone 2 Jog', predictionProbability: 0.88, predictedAdherence: 88, predictedClass: 1, modelName: 'Logistic Regression', modelVersion: '1.0.0-prototype', isBaselineFallback: false, dataSourceLabel: 'Seed / Demonstration Data', featureSnapshot: { sleepHours: 7.2, energyLevel: 7, fatigueLevel: 3, stressLevel: 4, availableMinutes: 45, environment: 'outdoor' }, predictionTimestamp: new Date(Date.now() - 86400000 * 1).toISOString(), actualOutcomeStatus: 'completed', actualDurationMinutes: 32 },
      { id: 'pred-13', userId: 'user-001', recommendationId: 'rec-13', recommendationTitle: '45-Min Heavy Gym Strength', predictionProbability: 0.35, predictedAdherence: 35, predictedClass: 0, modelName: 'Logistic Regression', modelVersion: '1.0.0-prototype', isBaselineFallback: false, dataSourceLabel: 'Seed / Demonstration Data', featureSnapshot: { sleepHours: 5.5, energyLevel: 4, fatigueLevel: 8, stressLevel: 7, availableMinutes: 50, environment: 'gym' }, predictionTimestamp: new Date(Date.now() - 86400000 * 2).toISOString(), actualOutcomeStatus: 'skipped', actualDurationMinutes: 0 },
      { id: 'pred-12', userId: 'user-001', recommendationId: 'rec-12', recommendationTitle: '20-Min Home Mobility Flow', predictionProbability: 0.92, predictedAdherence: 92, predictedClass: 1, modelName: 'Logistic Regression', modelVersion: '1.0.0-prototype', isBaselineFallback: false, dataSourceLabel: 'Seed / Demonstration Data', featureSnapshot: { sleepHours: 6.0, energyLevel: 5, fatigueLevel: 7, stressLevel: 6, availableMinutes: 30, environment: 'home' }, predictionTimestamp: new Date(Date.now() - 86400000 * 3).toISOString(), actualOutcomeStatus: 'completed', actualDurationMinutes: 20 },
      { id: 'pred-11', userId: 'user-001', recommendationId: 'rec-11', recommendationTitle: '35-Min Home Dumbbell Strength', predictionProbability: 0.85, predictedAdherence: 85, predictedClass: 1, modelName: 'Logistic Regression', modelVersion: '1.0.0-prototype', isBaselineFallback: false, dataSourceLabel: 'Seed / Demonstration Data', featureSnapshot: { sleepHours: 7.5, energyLevel: 8, fatigueLevel: 3, stressLevel: 3, availableMinutes: 45, environment: 'home' }, predictionTimestamp: new Date(Date.now() - 86400000 * 4).toISOString(), actualOutcomeStatus: 'completed', actualDurationMinutes: 35 },
      { id: 'pred-10', userId: 'user-001', recommendationId: 'rec-10', recommendationTitle: '25-Min HIIT Interval Sprints', predictionProbability: 0.62, predictedAdherence: 62, predictedClass: 1, modelName: 'Logistic Regression', modelVersion: '1.0.0-prototype', isBaselineFallback: false, dataSourceLabel: 'Seed / Demonstration Data', featureSnapshot: { sleepHours: 6.5, energyLevel: 6, fatigueLevel: 5, stressLevel: 8, availableMinutes: 30, environment: 'home' }, predictionTimestamp: new Date(Date.now() - 86400000 * 5).toISOString(), actualOutcomeStatus: 'partially_completed', actualDurationMinutes: 15 },
      { id: 'pred-9', userId: 'user-001', recommendationId: 'rec-9', recommendationTitle: '40-Min Outdoor Trail Run', predictionProbability: 0.90, predictedAdherence: 90, predictedClass: 1, modelName: 'Logistic Regression', modelVersion: '1.0.0-prototype', isBaselineFallback: false, dataSourceLabel: 'Seed / Demonstration Data', featureSnapshot: { sleepHours: 8.0, energyLevel: 9, fatigueLevel: 2, stressLevel: 2, availableMinutes: 60, environment: 'outdoor' }, predictionTimestamp: new Date(Date.now() - 86400000 * 6).toISOString(), actualOutcomeStatus: 'completed', actualDurationMinutes: 42 },
      { id: 'pred-8', userId: 'user-001', recommendationId: 'rec-8', recommendationTitle: '30-Min Gym Machine Circuit', predictionProbability: 0.74, predictedAdherence: 74, predictedClass: 1, modelName: 'Logistic Regression', modelVersion: '1.0.0-prototype', isBaselineFallback: false, dataSourceLabel: 'Seed / Demonstration Data', featureSnapshot: { sleepHours: 6.8, energyLevel: 6, fatigueLevel: 5, stressLevel: 5, availableMinutes: 40, environment: 'gym' }, predictionTimestamp: new Date(Date.now() - 86400000 * 7).toISOString(), actualOutcomeStatus: 'completed', actualDurationMinutes: 30 },
      { id: 'pred-7', userId: 'user-001', recommendationId: 'rec-7', recommendationTitle: '15-Min Thoracic & Foam Rolling', predictionProbability: 0.88, predictedAdherence: 88, predictedClass: 1, modelName: 'Logistic Regression', modelVersion: '1.0.0-prototype', isBaselineFallback: false, dataSourceLabel: 'Seed / Demonstration Data', featureSnapshot: { sleepHours: 5.8, energyLevel: 4, fatigueLevel: 7, stressLevel: 7, availableMinutes: 20, environment: 'home' }, predictionTimestamp: new Date(Date.now() - 86400000 * 8).toISOString(), actualOutcomeStatus: 'completed', actualDurationMinutes: 18 },
      { id: 'pred-6', userId: 'user-001', recommendationId: 'rec-6', recommendationTitle: '45-Min Heavy Lower Body Gym', predictionProbability: 0.52, predictedAdherence: 52, predictedClass: 1, modelName: 'Logistic Regression', modelVersion: '1.0.0-prototype', isBaselineFallback: false, dataSourceLabel: 'Seed / Demonstration Data', featureSnapshot: { sleepHours: 6.2, energyLevel: 5, fatigueLevel: 6, stressLevel: 6, availableMinutes: 35, environment: 'gym' }, predictionTimestamp: new Date(Date.now() - 86400000 * 9).toISOString(), actualOutcomeStatus: 'partially_completed', actualDurationMinutes: 25 },
      { id: 'pred-5', userId: 'user-001', recommendationId: 'rec-5', recommendationTitle: '30-Min Kettlebell Home Circuit', predictionProbability: 0.82, predictedAdherence: 82, predictedClass: 1, modelName: 'Logistic Regression', modelVersion: '1.0.0-prototype', isBaselineFallback: false, dataSourceLabel: 'Seed / Demonstration Data', featureSnapshot: { sleepHours: 7.4, energyLevel: 7, fatigueLevel: 4, stressLevel: 4, availableMinutes: 40, environment: 'home' }, predictionTimestamp: new Date(Date.now() - 86400000 * 10).toISOString(), actualOutcomeStatus: 'completed', actualDurationMinutes: 30 },
      { id: 'pred-4', userId: 'user-001', recommendationId: 'rec-4', recommendationTitle: '45-Min Outdoor Tempo Run', predictionProbability: 0.40, predictedAdherence: 40, predictedClass: 0, modelName: 'Logistic Regression', modelVersion: '1.0.0-prototype', isBaselineFallback: false, dataSourceLabel: 'Seed / Demonstration Data', featureSnapshot: { sleepHours: 5.2, energyLevel: 3, fatigueLevel: 8, stressLevel: 7, availableMinutes: 60, environment: 'outdoor' }, predictionTimestamp: new Date(Date.now() - 86400000 * 11).toISOString(), actualOutcomeStatus: 'skipped', actualDurationMinutes: 0 },
      { id: 'pred-3', userId: 'user-001', recommendationId: 'rec-3', recommendationTitle: '20-Min Bedtime Yin Yoga', predictionProbability: 0.94, predictedAdherence: 94, predictedClass: 1, modelName: 'Logistic Regression', modelVersion: '1.0.0-prototype', isBaselineFallback: false, dataSourceLabel: 'Seed / Demonstration Data', featureSnapshot: { sleepHours: 6.5, energyLevel: 5, fatigueLevel: 6, stressLevel: 6, availableMinutes: 25, environment: 'home' }, predictionTimestamp: new Date(Date.now() - 86400000 * 12).toISOString(), actualOutcomeStatus: 'completed', actualDurationMinutes: 22 },
      { id: 'pred-2', userId: 'user-001', recommendationId: 'rec-2', recommendationTitle: '35-Min Bodyweight HIIT Flow', predictionProbability: 0.86, predictedAdherence: 86, predictedClass: 1, modelName: 'Logistic Regression', modelVersion: '1.0.0-prototype', isBaselineFallback: false, dataSourceLabel: 'Seed / Demonstration Data', featureSnapshot: { sleepHours: 7.6, energyLevel: 8, fatigueLevel: 3, stressLevel: 3, availableMinutes: 45, environment: 'home' }, predictionTimestamp: new Date(Date.now() - 86400000 * 13).toISOString(), actualOutcomeStatus: 'completed', actualDurationMinutes: 35 },
      { id: 'pred-1', userId: 'user-001', recommendationId: 'rec-1', recommendationTitle: '25-Min Posture Alignment Walk', predictionProbability: 0.91, predictedAdherence: 91, predictedClass: 1, modelName: 'Logistic Regression', modelVersion: '1.0.0-prototype', isBaselineFallback: false, dataSourceLabel: 'Seed / Demonstration Data', featureSnapshot: { sleepHours: 6.9, energyLevel: 6, fatigueLevel: 5, stressLevel: 5, availableMinutes: 30, environment: 'outdoor' }, predictionTimestamp: new Date(Date.now() - 86400000 * 14).toISOString(), actualOutcomeStatus: 'completed', actualDurationMinutes: 25 }
    ];

    // Seed recommendation history for Alex Vance
    this.recommendationHistories['user-001'] = [
      { id: 'rec-hist-1', userId: 'user-001', recommendationId: 'rec-14', title: '30-Min Zone 2 Jog', category: 'workout', durationMinutes: 30, intensity: 'moderate', environment: 'outdoor', contextSnapshot: { sleepHours: 7.2, energyLevel: 7, fatigueLevel: 3, stressLevel: 4, availableMinutes: 45, environment: 'outdoor' }, predictedAdherence: 88, suitabilityScore: 84, status: 'Completed (32m)', whyRecommended: 'Cardiovascular aerobic base development in sunny weather.', outcome: { outcomeStatus: 'completed', actualDurationMinutes: 32, userFeedback: 'Felt very smooth, breathing stayed steady.' }, timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
      { id: 'rec-hist-2', userId: 'user-001', recommendationId: 'rec-13', title: '45-Min Heavy Gym Strength', category: 'workout', durationMinutes: 45, intensity: 'high', environment: 'gym', contextSnapshot: { sleepHours: 5.5, energyLevel: 4, fatigueLevel: 8, stressLevel: 7, availableMinutes: 50, environment: 'gym' }, predictedAdherence: 35, suitabilityScore: 40, status: 'Skipped (Too Tired)', whyRecommended: 'Original hypertrophy day before sleep deficit occurred.', outcome: { outcomeStatus: 'skipped', actualDurationMinutes: 0, userFeedback: 'Zero energy after poor sleep, went straight to sleep.' }, adaptationApplied: 'Shifted high-intensity stimulus to next week.', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() }
    ];

    // Seed adaptive plan for Alex Vance
    this.adaptivePlans['user-001'] = this.createInitialPlanPayload('user-001');

    // Recalculate evolving state
    this.recalculateEvolvingState('user-001');
  }
}

export const db = new PersistentHealthPilotDB();
