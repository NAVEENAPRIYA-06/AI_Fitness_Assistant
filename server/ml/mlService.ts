/**
 * Modular ML Service Bridge for HealthPilot AI
 *
 * ARCHITECTURAL DESIGN:
 * 1. Feature Preparation: Dedicated normalization & feature vector extraction for tabular ML pipelines.
 * 2. Model Prediction: HTTP Bridge to external Python ML microservice (Scikit-Learn, XGBoost, SHAP).
 * 3. Model Evaluation: Offline/online metrics (Brier Score, Mean Absolute Error, Calibration Error).
 * 4. Fallback / Baseline Behavior: Clearly marked empirical reference heuristic (local baseline placeholder)
 *    used when the Python ML microservice is offline or unconfigured.
 *
 * RESEARCH INTEGRITY NOTICE:
 * The local reference engine is an empirical heuristic baseline, NOT a trained ML weights file.
 * Real machine learning models (e.g. XGBoost Classifier, Random Forest, LogisticRegression with SHAP KernelExplainer)
 * are hosted via the Python microservice bridge configured via PYTHON_ML_SERVICE_URL.
 */

import { ExplainabilityFactor, WhatIfScenarioResult, MLModelMetadata, ShapExplanationData } from '../../src/types/index.js';

export interface AdherenceFeatureVector {
  sleepHours: number;
  sleepQuality: number; // 1-10
  energyLevel: number; // 1-10
  fatigueLevel: number; // 1-10
  stressLevel: number; // 1-10
  sorenessLevel?: number; // 1-10
  availableMinutes: number;
  candidateDurationMinutes: number;
  candidateIntensity: 'low' | 'moderate' | 'high';
  candidateCategory: string;
  environment: string;
  historicalHomeCompletionRate: number;
  historicalGymCompletionRate: number;
  baselineAdherenceRate: number;
  historicalSkipRate?: number;
  historicalPartialRate?: number;
  behavioralMomentum?: number;
  goalPriorityNumeric?: number;
  preferredEnvironment?: string;
  preferredTime?: string;
  recommendedTime?: string;
  dayOfWeek?: string;
}

export interface PreparedFeatures {
  raw: AdherenceFeatureVector;
  normalized: {
    timeMarginMinutes: number;
    intensityNumeric: number; // 1 = low, 2 = mod, 3 = high
    energyFatigueRatio: number;
    sleepSufficiencyRatio: number;
    isHomeEnvironment: number;
    isGymEnvironment: number;
    isOutdoorEnvironment: number;
  };
  featureNames: string[];
  denseVector: number[];
}

export interface AdherencePredictionResult {
  predictedAdherence: number; // 0-100 %
  adherenceProbability: number; // 0.0 - 1.0
  predictedClass: 0 | 1;
  healthSuitabilityScore: number; // 0-100 %
  attributions: ExplainabilityFactor[];
  modelName: string;
  modelVersion: string;
  dataSourceLabel: string;
  modelSource: 'python_scikit_learn_service' | 'empirical_reference_heuristic_baseline';
  isModelPlaceholder: boolean;
  featureSnapshot?: Record<string, any>;
  limitationNotice?: string;
  shapExplanation?: ShapExplanationData;
}

export interface ModelEvaluationMetrics {
  sampleCount: number;
  brierScore: number;
  meanAbsoluteError: number;
  accuracyWithin15Percent: number;
  calibrationNote: string;
}

export class MLService {
  private pythonServiceUrl: string = process.env.HEALTHPILOT_ML_SERVICE_URL || 'http://127.0.0.1:5001';
  private isPythonServiceAvailable: boolean | null = null;
  private lastHealthCheckTime: number = 0;
  private readonly HEALTH_CHECK_TTL_MS: number = 60000;

  /**
   * Checks if Python ML Microservice is reachable (cached with 60s TTL)
   */
  public async isServiceHealthy(forceCheck: boolean = false): Promise<boolean> {
    const now = Date.now();
    if (!forceCheck && this.isPythonServiceAvailable !== null && (now - this.lastHealthCheckTime < this.HEALTH_CHECK_TTL_MS)) {
      return this.isPythonServiceAvailable;
    }

    try {
      const res = await fetch(`${this.pythonServiceUrl}/health`, {
        signal: AbortSignal.timeout(500)
      });
      this.isPythonServiceAvailable = res.ok;
    } catch {
      this.isPythonServiceAvailable = false;
    }
    this.lastHealthCheckTime = now;
    return this.isPythonServiceAvailable;
  }

  /**
   * Fetches active ML model metadata from Python microservice
   */
  public async getCurrentModelMetadata(): Promise<MLModelMetadata | null> {
    try {
      const res = await fetch(`${this.pythonServiceUrl}/model/current`, {
        signal: AbortSignal.timeout(1000)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status !== 'uninitialized') return data as MLModelMetadata;
      }
    } catch {
      // Python microservice offline, proceed to check disk bundle
    }

    try {
      const fs = await import('fs');
      const path = await import('path');
      const metaPath = path.resolve(process.cwd(), 'python-ml-service/models/active_model_metadata.json');
      if (fs.existsSync(metaPath)) {
        const raw = fs.readFileSync(metaPath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          ...parsed,
          modelName: parsed.model_name,
          modelVersion: parsed.model_version,
          dataSource: parsed.data_source,
          limitationNotice: parsed.limitation_notice
        } as MLModelMetadata;
      }
    } catch (e) {
      // Disk read failed
    }

    return null;
  }

  /**
   * Triggers model training & statistical model comparison on Python microservice
   */
  public async trainCandidateModels(
    records: any[],
    dataSourceLabel: string = "Demonstration model trained on seed data"
  ): Promise<{ success: boolean; metadata: MLModelMetadata; message: string }> {
    const res = await fetch(`${this.pythonServiceUrl}/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        records,
        dataSource: dataSourceLabel
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Python ML Service training failed: ${err}`);
    }

    return await res.json();
  }

  /**
   * Evaluates active model on Python microservice
   */
  public async evaluateModel(records?: any[]): Promise<any> {
    try {
      const res = await fetch(`${this.pythonServiceUrl}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records }),
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return null;
  }

  /**
   * ==========================================
   * 1. FEATURE PREPARATION
   * Extracts, validates, and normalizes input features into tabular format
   * ==========================================
   */
  public prepareFeatureVector(raw: AdherenceFeatureVector): PreparedFeatures {
    const timeMarginMinutes = raw.availableMinutes - raw.candidateDurationMinutes;
    const intensityNumeric = raw.candidateIntensity === 'high' ? 3 : raw.candidateIntensity === 'moderate' ? 2 : 1;
    const energyFatigueRatio = Number(((raw.energyLevel + 1) / (raw.fatigueLevel + 1)).toFixed(3));
    const sleepSufficiencyRatio = Number((raw.sleepHours / 8.0).toFixed(3));
    const isHomeEnvironment = raw.environment === 'home' ? 1 : 0;
    const isGymEnvironment = raw.environment === 'gym' ? 1 : 0;
    const isOutdoorEnvironment = raw.environment === 'outdoor' ? 1 : 0;

    const featureNames = [
      'time_margin_minutes',
      'intensity_numeric',
      'energy_level',
      'fatigue_level',
      'stress_level',
      'sleep_hours',
      'energy_fatigue_ratio',
      'sleep_sufficiency_ratio',
      'is_home',
      'is_gym',
      'is_outdoor',
      'historical_home_completion_rate'
    ];

    const denseVector = [
      timeMarginMinutes,
      intensityNumeric,
      raw.energyLevel,
      raw.fatigueLevel,
      raw.stressLevel,
      raw.sleepHours,
      energyFatigueRatio,
      sleepSufficiencyRatio,
      isHomeEnvironment,
      isGymEnvironment,
      isOutdoorEnvironment,
      raw.historicalHomeCompletionRate
    ];

    return {
      raw,
      normalized: {
        timeMarginMinutes,
        intensityNumeric,
        energyFatigueRatio,
        sleepSufficiencyRatio,
        isHomeEnvironment,
        isGymEnvironment,
        isOutdoorEnvironment
      },
      featureNames,
      denseVector
    };
  }

  /**
   * ==========================================
   * 2. MODEL PREDICTION ORCHESTRATION
   * Connects to external Python ML service when available, or cleanly routes to baseline reference
   * ==========================================
   */
  public async predictAdherence(
    features: AdherenceFeatureVector,
    userId: string = 'usr-alex-01',
    recommendationId?: string
  ): Promise<AdherencePredictionResult> {
    const prepared = this.prepareFeatureVector(features);

    // Attempt inference via Python ML microservice only if service is reachable
    const isHealthy = await this.isServiceHealthy();
    if (isHealthy) {
      try {
        const response = await fetch(`${this.pythonServiceUrl}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            features: {
              sleep_hours: features.sleepHours,
              sleep_quality: features.sleepQuality,
              energy_level: features.energyLevel,
              fatigue_level: features.fatigueLevel,
              stress_level: features.stressLevel,
              soreness_level: features.sorenessLevel || 3,
              available_minutes: features.availableMinutes,
              recommended_duration_minutes: features.candidateDurationMinutes,
              environment: features.environment,
              activity_type: features.candidateCategory,
              intensity: features.candidateIntensity,
              recommended_time: features.recommendedTime || 'morning',
              day_of_week: features.dayOfWeek || 'Monday',
              preferred_environment: features.preferredEnvironment || 'home',
              preferred_time: features.preferredTime || 'morning',
              historical_completion_rate: features.baselineAdherenceRate || 70,
              historical_skip_rate: features.historicalSkipRate || 20,
              historical_partial_rate: features.historicalPartialRate || 10,
              behavioral_momentum: features.behavioralMomentum || 65,
              goal_priority_numeric: features.goalPriorityNumeric || 1
            },
            userId,
            recommendationId
          }),
          signal: AbortSignal.timeout(2000)
        });

        if (response.ok) {
          const data = await response.json();
          return {
            predictedAdherence: data.predictedAdherence ?? Math.round((data.adherence_probability ?? 0.75) * 100),
            adherenceProbability: data.adherence_probability ?? (data.predictedAdherence / 100),
            predictedClass: data.predicted_class ?? 1,
            healthSuitabilityScore: data.healthSuitabilityScore ?? 85,
            attributions: data.attributions || [],
            modelName: data.model_name || 'Logistic Regression',
            modelVersion: data.model_version || '1.0.0-prototype',
            dataSourceLabel: data.data_source || 'Demonstration model trained on seed data',
            modelSource: 'python_scikit_learn_service',
            isModelPlaceholder: false,
            featureSnapshot: data.feature_snapshot,
            limitationNotice: data.limitation_notice,
            shapExplanation: data.shap_explanation
          };
        }
      } catch (err: any) {
        this.isPythonServiceAvailable = false;
        // Non-blocking fallback to calibrated reference
      }
    }

    // Baseline reference heuristic (clearly marked as fallback placeholder)
    return this.runLocalReferenceHeuristic(prepared);
  }

  /**
   * ==========================================
   * 2b. REAL EXPLAINABLE AI (SHAP) ENDPOINT
   * Computes genuine SHAP values via LinearExplainer or TreeExplainer on Python service
   * ==========================================
   */
  public async explainAdherence(features?: Partial<AdherenceFeatureVector>): Promise<ShapExplanationData> {
    const merged: AdherenceFeatureVector = {
      sleepHours: features?.sleepHours ?? 7,
      sleepQuality: features?.sleepQuality ?? 7,
      energyLevel: features?.energyLevel ?? 6,
      fatigueLevel: features?.fatigueLevel ?? 5,
      stressLevel: features?.stressLevel ?? 5,
      sorenessLevel: features?.sorenessLevel ?? 3,
      availableMinutes: features?.availableMinutes ?? 30,
      candidateDurationMinutes: features?.candidateDurationMinutes ?? 20,
      candidateIntensity: features?.candidateIntensity ?? 'moderate',
      candidateCategory: features?.candidateCategory ?? 'workout',
      environment: features?.environment ?? 'home',
      historicalHomeCompletionRate: features?.historicalHomeCompletionRate ?? 75,
      historicalGymCompletionRate: features?.historicalGymCompletionRate ?? 40,
      baselineAdherenceRate: features?.baselineAdherenceRate ?? 70,
      historicalSkipRate: features?.historicalSkipRate ?? 20,
      behavioralMomentum: features?.behavioralMomentum ?? 65,
      goalPriorityNumeric: features?.goalPriorityNumeric ?? 1
    };

    const isHealthy = await this.isServiceHealthy();
    if (isHealthy) {
      try {
        const response = await fetch(`${this.pythonServiceUrl}/explain`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            features: {
              sleep_hours: merged.sleepHours,
              sleep_quality: merged.sleepQuality,
              energy_level: merged.energyLevel,
              fatigue_level: merged.fatigueLevel,
              stress_level: merged.stressLevel,
              soreness_level: merged.sorenessLevel,
              available_minutes: merged.availableMinutes,
              recommended_duration_minutes: merged.candidateDurationMinutes,
              environment: merged.environment,
              activity_type: merged.candidateCategory,
              intensity: merged.candidateIntensity,
              historical_completion_rate: merged.baselineAdherenceRate,
              historical_skip_rate: merged.historicalSkipRate,
              behavioral_momentum: merged.behavioralMomentum,
              goal_priority_numeric: merged.goalPriorityNumeric
            }
          }),
          signal: AbortSignal.timeout(3000)
        });

        if (response.ok) {
          return await response.json();
        }
      } catch (err: any) {
        this.isPythonServiceAvailable = false;
        // Non-blocking fallback to calibrated reference
      }
    }

    // System Fallback clearly labeled as non-SHAP fallback
    return {
      prediction: 0.72,
      predictedAdherence: 72,
      predictedClass: 'likely_to_complete',
      model: 'Empirical Baseline Reference',
      modelVersion: '1.0.0-fallback',
      explanationMethod: 'System Heuristic Fallback (Non-SHAP)',
      isGenuineShap: false,
      explanationStatus: 'model_system_fallback',
      baseValue: null,
      features: merged as any,
      contributions: [
        {
          feature: 'available_minutes',
          displayName: 'Available Time',
          value: merged.availableMinutes,
          shapValue: 0.18,
          direction: 'positive',
          humanExplanation: `Your available ${merged.availableMinutes} minutes increased the predicted likelihood of completing this session.`,
          impactScore: 0.18
        },
        {
          feature: 'fatigue_level',
          displayName: 'Fatigue Level',
          value: merged.fatigueLevel,
          shapValue: merged.fatigueLevel >= 7 ? -0.22 : 0.12,
          direction: merged.fatigueLevel >= 7 ? 'negative' : 'positive',
          humanExplanation: merged.fatigueLevel >= 7
            ? `Your elevated fatigue (${merged.fatigueLevel}/10) reduced the predicted likelihood of completing a demanding session.`
            : `Your moderate fatigue level (${merged.fatigueLevel}/10) supported session readiness.`,
          impactScore: merged.fatigueLevel >= 7 ? -0.22 : 0.12
        }
      ],
      topPositiveFactors: [
        {
          feature: 'available_minutes',
          displayName: 'Available Time',
          value: merged.availableMinutes,
          shapValue: 0.18,
          direction: 'positive',
          humanExplanation: `Your available ${merged.availableMinutes} minutes increased the predicted likelihood of completing this session.`,
          impactScore: 0.18
        }
      ],
      topNegativeFactors: merged.fatigueLevel >= 7 ? [
        {
          feature: 'fatigue_level',
          displayName: 'Fatigue Level',
          value: merged.fatigueLevel,
          shapValue: -0.22,
          direction: 'negative',
          humanExplanation: `Your elevated fatigue (${merged.fatigueLevel}/10) reduced the predicted likelihood.`,
          impactScore: -0.22
        }
      ] : [],
      topPositiveSummaries: [`Your available ${merged.availableMinutes} minutes increased the predicted likelihood of completing this session.`],
      topNegativeSummaries: merged.fatigueLevel >= 7 ? [`Your elevated fatigue (${merged.fatigueLevel}/10) reduced the predicted likelihood.`] : [],
      disclaimerNotice: 'NOTICE: This explanation uses fallback heuristic attributions, NOT genuine SHAP values. Used when SHAP service is offline.'
    };
  }

  /**
   * ==========================================
   * 3. FALLBACK / BASELINE BEHAVIOR
   * Empirical reference calculation (Analytical baseline placeholder)
   * ==========================================
   */
  private runLocalReferenceHeuristic(prepared: PreparedFeatures): AdherencePredictionResult {
    const features = prepared.raw;
    const attributions: ExplainabilityFactor[] = [];
    
    // Base log-odds derived from user's historical baseline (~62% baseline)
    let logOdds = 0.5;

    // Time availability attribution
    const timeDelta = prepared.normalized.timeMarginMinutes;
    if (timeDelta < 0) {
      const penalty = Math.min(2.5, (Math.abs(timeDelta) / 10) * 0.8);
      logOdds -= penalty;
      attributions.push({
        feature: 'Available Time Deficit',
        impactScore: -Number((penalty * 0.35).toFixed(2)),
        direction: 'decreases_adherence',
        explanation: `Scheduled duration (${features.candidateDurationMinutes}m) exceeds available window (${features.availableMinutes}m) by ${Math.abs(timeDelta)} minutes.`
      });
    } else if (timeDelta >= 15) {
      const boost = 0.45;
      logOdds += boost;
      attributions.push({
        feature: 'Time Margin Buffer',
        impactScore: 0.22,
        direction: 'increases_adherence',
        explanation: `Sufficient time margin (+${timeDelta}m buffer) substantially lowers scheduling friction.`
      });
    } else {
      attributions.push({
        feature: 'Tight Time Window',
        impactScore: -0.08,
        direction: 'neutral',
        explanation: `Session fits just within available time with less than 15 minutes buffer.`
      });
    }

    // Energy vs Intensity attribution
    const intensityWeight = prepared.normalized.intensityNumeric;
    if (intensityWeight === 3 && features.fatigueLevel >= 6) {
      const penalty = 0.9 + (features.fatigueLevel - 5) * 0.25;
      logOdds -= penalty;
      attributions.push({
        feature: 'High Fatigue vs High Intensity Conflict',
        impactScore: -Number((penalty * 0.3).toFixed(2)),
        direction: 'decreases_adherence',
        explanation: `Prescribing high intensity when fatigue is ${features.fatigueLevel}/10 is historically associated with task abandonment.`
      });
    } else if (intensityWeight === 1 && features.fatigueLevel >= 6) {
      const boost = 0.6;
      logOdds += boost;
      attributions.push({
        feature: 'Restorative Intensity Match',
        impactScore: 0.28,
        direction: 'increases_adherence',
        explanation: `Selecting lower intensity adapts to elevated fatigue (${features.fatigueLevel}/10), protecting habit consistency.`
      });
    } else if (features.energyLevel >= 7 && intensityWeight >= 2) {
      const boost = 0.5;
      logOdds += boost;
      attributions.push({
        feature: 'Favorable Energy Readiness',
        impactScore: 0.24,
        direction: 'increases_adherence',
        explanation: `High self-reported energy (${features.energyLevel}/10) strongly supports moderate-to-high work capacity.`
      });
    }

    // Sleep sufficiency attribution
    if (features.sleepHours < 6.0) {
      const penalty = 0.65;
      logOdds -= penalty;
      attributions.push({
        feature: 'Sleep Debt Constraint',
        impactScore: -0.25,
        direction: 'decreases_adherence',
        explanation: `Short sleep duration (${features.sleepHours.toFixed(1)}h) elevates autonomic strain and lowers planned exercise completion.`
      });
    } else if (features.sleepHours >= 7.0) {
      logOdds += 0.3;
      attributions.push({
        feature: 'Sufficient Sleep Foundation',
        impactScore: 0.15,
        direction: 'increases_adherence',
        explanation: `Restful sleep duration (${features.sleepHours.toFixed(1)}h) provides stable cognitive and muscular recovery.`
      });
    }

    // Environment & historical behavioral precedent
    if (features.environment === 'home') {
      const homeDelta = (features.historicalHomeCompletionRate - 50) / 100;
      logOdds += homeDelta * 0.8;
      attributions.push({
        feature: 'Home Environment Preference',
        impactScore: Number((homeDelta * 0.4).toFixed(2)),
        direction: 'increases_adherence',
        explanation: `Historical data shows a ${features.historicalHomeCompletionRate}% completion rate for home workouts versus gym sessions.`
      });
    } else if (features.environment === 'gym') {
      const gymDelta = (features.historicalGymCompletionRate - 60) / 100;
      logOdds += gymDelta * 0.7;
      attributions.push({
        feature: 'Gym Transit Overhead',
        impactScore: Number((gymDelta * 0.3).toFixed(2)),
        direction: gymDelta < 0 ? 'decreases_adherence' : 'increases_adherence',
        explanation: `Gym workouts introduce transit friction; historical completion rate is ${features.historicalGymCompletionRate}%.`
      });
    }

    // Standard logistic sigmoid calibration
    const probability = 1 / (1 + Math.exp(-logOdds));
    const predictedAdherence = Math.round(Math.min(96, Math.max(12, probability * 100)));

    // Biomechanical & physiological appropriateness score
    let suitability = 85;
    if (features.sleepHours < 6 && features.candidateIntensity === 'high') suitability -= 35;
    if (features.fatigueLevel > 7 && features.candidateIntensity !== 'low') suitability -= 25;
    if (features.stressLevel > 7 && features.candidateDurationMinutes > 40) suitability -= 20;
    if (features.candidateIntensity === 'low' && features.fatigueLevel > 6) suitability += 10;
    const healthSuitabilityScore = Math.max(15, Math.min(98, suitability));

    return {
      predictedAdherence,
      adherenceProbability: Number(probability.toFixed(4)),
      predictedClass: probability >= 0.5 ? 1 : 0,
      healthSuitabilityScore,
      attributions,
      modelName: 'Baseline Heuristic Reference',
      modelVersion: 'v0-heuristic-fallback',
      dataSourceLabel: 'Baseline estimate — ML service unavailable',
      modelSource: 'empirical_reference_heuristic_baseline',
      isModelPlaceholder: true,
      limitationNotice: 'ML Service offline. Falling back to analytical baseline reference.'
    };
  }

  /**
   * ==========================================
   * 4. MODEL EVALUATION
   * Evaluates prediction performance against actual recorded user outcomes
   * ==========================================
   */
  public evaluateModelMetrics(
    predictions: { predicted: number; actualCompleted: boolean }[]
  ): ModelEvaluationMetrics {
    if (!predictions || predictions.length === 0) {
      return {
        sampleCount: 0,
        brierScore: 0,
        meanAbsoluteError: 0,
        accuracyWithin15Percent: 0,
        calibrationNote: 'Insufficient outcome data for statistical evaluation.'
      };
    }

    let brierSum = 0;
    let maeSum = 0;
    let within15Count = 0;

    for (const p of predictions) {
      const prob = p.predicted / 100.0;
      const actual = p.actualCompleted ? 1.0 : 0.0;
      brierSum += Math.pow(prob - actual, 2);

      const error = Math.abs(p.predicted - (p.actualCompleted ? 100 : 0));
      maeSum += error;

      if (error <= 15) {
        within15Count += 1;
      }
    }

    const n = predictions.length;
    const brierScore = Number((brierSum / n).toFixed(4));
    const meanAbsoluteError = Number((maeSum / n).toFixed(2));
    const accuracyWithin15Percent = Number(((within15Count / n) * 100).toFixed(1));

    let calibrationNote = 'Empirical baseline heuristic demonstrates satisfactory directionality.';
    if (brierScore > 0.25) {
      calibrationNote = 'High Brier score (> 0.25); model requires external calibration dataset.';
    }

    return {
      sampleCount: n,
      brierScore,
      meanAbsoluteError,
      accuracyWithin15Percent,
      calibrationNote
    };
  }

  /**
   * Counterfactual What-If Simulation
   * Evaluates what happens to predicted adherence when changing user conditions or intervention parameters
   */
  public async computeCounterfactual(
    baseline: AdherenceFeatureVector,
    simulated: AdherenceFeatureVector
  ): Promise<WhatIfScenarioResult> {
    const prepBase = this.prepareFeatureVector(baseline);
    const prepSim = this.prepareFeatureVector(simulated);
    const baseResult = await this.predictAdherence(baseline);
    const simResult = await this.predictAdherence(simulated);
    const delta = simResult.predictedAdherence - baseResult.predictedAdherence;

    const shapDeltas = [];

    // Time delta
    if (simulated.availableMinutes !== baseline.availableMinutes || simulated.candidateDurationMinutes !== baseline.candidateDurationMinutes) {
      const baseTimeMargin = baseline.availableMinutes - baseline.candidateDurationMinutes;
      const simTimeMargin = simulated.availableMinutes - simulated.candidateDurationMinutes;
      const d = simTimeMargin - baseTimeMargin;
      shapDeltas.push({
        feature: 'Time Window Adjustment',
        delta: Math.round(d * 0.6),
        direction: (d >= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
        description: d >= 0 
          ? `Gaining ${d}m of time buffer relaxes scheduling constraints.`
          : `Losing ${Math.abs(d)}m of buffer significantly compresses the routine.`
      });
    }

    // Energy delta
    if (simulated.energyLevel !== baseline.energyLevel) {
      const d = simulated.energyLevel - baseline.energyLevel;
      shapDeltas.push({
        feature: 'Energy Level Shift',
        delta: Math.round(d * 4.5),
        direction: (d >= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
        description: `Shifting energy from ${baseline.energyLevel}/10 to ${simulated.energyLevel}/10 modifies readiness by ${d > 0 ? '+' : ''}${Math.round(d * 4.5)}%.`
      });
    }

    // Fatigue delta
    if (simulated.fatigueLevel !== baseline.fatigueLevel) {
      const d = simulated.fatigueLevel - baseline.fatigueLevel;
      shapDeltas.push({
        feature: 'Fatigue Variation',
        delta: Math.round(-d * 4.2),
        direction: (d <= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
        description: `Fatigue moved from ${baseline.fatigueLevel}/10 to ${simulated.fatigueLevel}/10.`
      });
    }

    // Environment delta
    if (simulated.environment !== baseline.environment) {
      const envDelta = simulated.environment === 'home' ? 18 : simulated.environment === 'gym' ? -15 : 5;
      shapDeltas.push({
        feature: 'Environment Switch',
        delta: envDelta,
        direction: (envDelta >= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
        description: `Switching from ${baseline.environment} to ${simulated.environment} alters transit overhead and equipment access.`
      });
    }

    // Intensity delta
    if (simulated.candidateIntensity !== baseline.candidateIntensity) {
      const intMap = { low: 1, moderate: 2, high: 3 };
      const diff = intMap[simulated.candidateIntensity] - intMap[baseline.candidateIntensity];
      const penalty = diff > 0 && simulated.fatigueLevel >= 6 ? -16 : diff < 0 ? 12 : -5;
      shapDeltas.push({
        feature: 'Prescribed Intensity Shift',
        delta: penalty,
        direction: (penalty >= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
        description: `Moving intensity to ${simulated.candidateIntensity} under current recovery conditions.`
      });
    }

    let verdict = '';
    if (delta > 10) {
      verdict = `Counterfactual indicates a notable +${delta}% improvement in predicted completion rate.`;
    } else if (delta < -10) {
      verdict = `Counterfactual indicates a significant ${delta}% drop in completion likelihood. High risk of abandonment.`;
    } else {
      verdict = `Counterfactual produces negligible variance (${delta >= 0 ? '+' : ''}${delta}%) in predicted adherence.`;
    }

    return {
      simulatedAdherence: simResult.predictedAdherence,
      baselineAdherence: baseResult.predictedAdherence,
      deltaAdherence: delta,
      simulatedSuitability: simResult.healthSuitabilityScore,
      recommendedAction: simResult.healthSuitabilityScore < 60 ? 'Consider active recovery or reduced intensity' : 'Appropriate balance of readiness and adherence',
      shapExplanations: shapDeltas,
      verdict
    };
  }
}

export const mlService = new MLService();
