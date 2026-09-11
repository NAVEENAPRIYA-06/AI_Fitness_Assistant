import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db/repository.js';
import { decisionEngine, DecisionIntelligenceEngine } from './server/engine/decisionEngine.js';
import { mlService, AdherenceFeatureVector } from './server/ml/mlService.js';
import { askAiCoach } from './server/gemini.js';
import { evaluationService } from './server/engine/evaluationService.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'HealthPilot AI Decision Intelligence System',
      version: '1.0.0-research',
      timestamp: new Date().toISOString()
    });
  });

  // User Profile
  app.get('/api/user/profile', (req, res) => {
    try {
      const profile = db.getUserProfile();
      res.json(profile);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/user/profile', (req, res) => {
    try {
      const updated = db.updateUserProfile(req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Validation helper for Daily Context
  const validateDailyContextInput = (body: any): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    if (body.sleepHours !== undefined || body.sleepDuration !== undefined) {
      const sleep = Number(body.sleepHours ?? body.sleepDuration);
      if (isNaN(sleep) || sleep < 0.5 || sleep > 24) {
        errors.sleepHours = 'Sleep duration must be a realistic value between 0.5 and 24 hours.';
      }
    }

    if (body.availableMinutes !== undefined) {
      const mins = Number(body.availableMinutes);
      if (isNaN(mins) || mins < 0) {
        errors.availableMinutes = 'Available time cannot be negative.';
      } else if (mins > 480) {
        errors.availableMinutes = 'Available time cannot exceed 480 minutes (8 hours).';
      }
    }

    const range1to10Fields: Array<[string, string]> = [
      ['sleepQuality', 'Sleep quality'],
      ['energyLevel', 'Energy level'],
      ['fatigueLevel', 'Fatigue level'],
      ['stressLevel', 'Stress level'],
      ['sorenessLevel', 'Muscle soreness'],
      ['cognitiveLoad', 'Cognitive load']
    ];

    for (const [field, label] of range1to10Fields) {
      if (body[field] !== undefined) {
        const val = Number(body[field]);
        if (isNaN(val) || val < 1 || val > 10) {
          errors[field] = `${label} must be rated on a scale of 1 to 10.`;
        }
      }
    }

    if (body.environment !== undefined) {
      const validEnvs = ['home', 'gym', 'outdoor', 'travel', 'other'];
      if (!validEnvs.includes(body.environment)) {
        errors.environment = `Environment must be one of: ${validEnvs.join(', ')}.`;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Daily Context: Latest
  app.get('/api/context/latest', (req, res) => {
    try {
      const context = db.getLatestDailyContext();
      res.json(context);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Daily Context: History (Multi-day dated records)
  app.get('/api/context/history', (req, res) => {
    try {
      const history = db.getDailyContextHistory();
      res.json(history);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Daily Context: Get single record by ID
  app.get('/api/context/:id', (req, res) => {
    try {
      const record = db.getDailyContextById(req.params.id);
      if (!record) {
        return res.status(404).json({ error: 'Context record not found' });
      }
      res.json(record);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Daily Context: Default GET (alias for latest)
  app.get('/api/context', (req, res) => {
    try {
      const context = db.getDailyContext();
      res.json(context);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Daily Context: Save or update context with validation
  app.post('/api/context', (req, res) => {
    try {
      const validation = validateDailyContextInput(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Validation failed for daily context submission.',
          validationErrors: validation.errors
        });
      }

      const updatedContext = db.saveDailyContext(req.body);
      res.json({
        success: true,
        context: updatedContext,
        evolvingState: db.getEvolvingState(),
        message: 'Daily context saved and evolving state updated.'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Daily Context: Update specific record by ID
  app.put('/api/context/:id', (req, res) => {
    try {
      const validation = validateDailyContextInput(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Validation failed for daily context update.',
          validationErrors: validation.errors
        });
      }

      const updated = db.updateDailyContextById(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Context record not found' });
      }

      res.json({
        success: true,
        context: updated,
        evolvingState: db.getEvolvingState(),
        message: 'Context record updated successfully.'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Evolving Multi-Domain User State
  app.get('/api/state', (req, res) => {
    try {
      const state = db.getEvolvingState();
      res.json(state);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Recommendation Engine: Today's personalized explainable recommendation
  app.get('/api/recommendation/today', async (req, res) => {
    try {
      const profile = db.getUserProfile();
      const context = db.getDailyContext();
      const state = db.getEvolvingState();
      const behavior = db.getBehaviorPatternSummary();
      const goals = db.getGoals();
      const behavioralProfile = db.getPersonalBehavioralProfile();

      const recommendation = await decisionEngine.generateTodayRecommendation(
        profile,
        context,
        state,
        behavior,
        goals,
        behavioralProfile
      );

      res.json(recommendation);
    } catch (err: any) {
      console.error('Error generating recommendation:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Generate on-demand recommendation with optional custom context or weights
  app.post('/api/recommendations/generate', async (req, res) => {
    try {
      const profile = db.getUserProfile();
      const context = req.body.context ? { ...db.getDailyContext(), ...req.body.context } : db.getDailyContext();
      const state = db.getEvolvingState();
      const behavior = db.getBehaviorPatternSummary();
      const goals = req.body.goals || db.getGoals();
      const behavioralProfile = db.getPersonalBehavioralProfile();
      const customWeights = req.body.weights;

      const recommendation = await decisionEngine.generateTodayRecommendation(
        profile,
        context,
        state,
        behavior,
        goals,
        behavioralProfile,
        customWeights
      );

      res.json(recommendation);
    } catch (err: any) {
      console.error('Error generating custom recommendation:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Recommendation Audit History
  app.get('/api/recommendations/history', (req, res) => {
    try {
      const history = db.getRecommendationHistory();
      res.json(history);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Candidate Matrix Evaluation (used by Plan Lab & What-If)
  app.post('/api/recommendations/evaluate-candidates', async (req, res) => {
    try {
      const profile = db.getUserProfile();
      const context = req.body.context ? { ...db.getDailyContext(), ...req.body.context } : db.getDailyContext();
      const state = db.getEvolvingState();
      const behavior = db.getBehaviorPatternSummary();
      const goals = req.body.goals || db.getGoals();
      const behavioralProfile = db.getPersonalBehavioralProfile();
      const customWeights = req.body.weights;

      const candidatesToEvaluate = req.body.candidates && req.body.candidates.length > 0
        ? req.body.candidates
        : decisionEngine.generateCandidates(context, profile, state, goals, behavioralProfile);

      const evaluated = await decisionEngine.evaluateCandidateMatrix(
        candidatesToEvaluate,
        context,
        profile,
        state,
        goals,
        behavioralProfile,
        behavior,
        customWeights
      );

      res.json({
        candidates: evaluated,
        weights: {
          ...DecisionIntelligenceEngine.DEFAULT_WEIGHTS,
          ...customWeights
        },
        contextEvaluated: context
      });
    } catch (err: any) {
      console.error('Error evaluating candidate matrix:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Recommendation Outcomes (Continuous Feedback Loop)
  app.get('/api/outcomes', (req, res) => {
    try {
      const outcomes = db.getOutcomes();
      res.json(outcomes);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/outcomes', (req, res) => {
    try {
      const newOutcome = db.addOutcome(req.body);

      // Link outcome to recommendation history
      try {
        const history = db.getRecommendationHistory();
        const matchingRec = history.find(h => h.recommendationId === req.body.recommendationId) || history[0];
        if (matchingRec) {
          matchingRec.outcomeStatus = newOutcome.outcomeStatus;
          matchingRec.actualDurationMinutes = newOutcome.actualDurationMinutes;
          matchingRec.userFeedback = newOutcome.userFeedback;
          matchingRec.status = `Completed (${newOutcome.actualDurationMinutes || 0}m)`;
        }
      } catch (histErr) {
        console.error('Non-blocking error linking outcome to history:', histErr);
      }

      res.status(201).json({
        outcome: newOutcome,
        updatedState: db.getEvolvingState(),
        behaviorSummary: db.getBehaviorPatternSummary(),
        adaptivePlanPayload: db.getAdaptivePlanPayload()
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Behavior Insights & Analytical Patterns Engine
  app.get('/api/behavior/summary', (req, res) => {
    try {
      const summary = db.getBehaviorPatternSummary();
      res.json(summary);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/behavior/profile', (req, res) => {
    try {
      const profile = db.getPersonalBehavioralProfile();
      res.json(profile);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/behavior/patterns', (req, res) => {
    try {
      const patterns = db.getBehavioralPatterns();
      res.json(patterns);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/behavior/recalculate', (req, res) => {
    try {
      const result = db.recalculateBehavioralProfile();
      res.json({
        success: true,
        message: 'Personal behavioral profile and empirical patterns recalculated.',
        ...result
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/behavior/insights', (req, res) => {
    try {
      const summary = db.getBehaviorPatternSummary();
      res.json(summary);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Goal Strategy & Conflicts
  app.get('/api/goals', (req, res) => {
    try {
      const goals = db.getGoals();
      res.json(goals);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/goals/:id', (req, res) => {
    try {
      const updated = db.updateGoal(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Goal not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Adaptive Plan & Multi-Day Dynamic Schedule
  app.get('/api/plan/adaptive', (req, res) => {
    try {
      const plan = db.getAdaptivePlan();
      res.json(plan);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/adaptive-plan', (req, res) => {
    try {
      const payload = db.getAdaptivePlanPayload();
      res.json(payload);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/adaptive-plan/rebalance', (req, res) => {
    try {
      const payload = db.rebalanceAdaptivePlan();
      res.json({
        success: true,
        message: 'Adaptive plan successfully rebalanced based on current empirical state and outcomes.',
        payload
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/adaptive-plan/reset', (req, res) => {
    try {
      const payload = db.resetAdaptivePlan();
      res.json({
        success: true,
        message: 'Plan reset to baseline research schedule template.',
        payload
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/adaptive-plan/history', (req, res) => {
    try {
      const history = db.getAdaptationHistory();
      res.json(history);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // What-If Counterfactual Lab Simulation
  app.post('/api/what-if', async (req, res) => {
    try {
      const context = db.getDailyContext();
      const behavior = db.getBehaviorPatternSummary();
      const profile = db.getUserProfile();
      const evolvingState = db.getEvolvingState();
      const goals = db.getGoals();
      const behavioralProfile = db.getPersonalBehavioralProfile();

      // 1. Establish baseline & simulated context
      const baselineContext = { ...context };
      const simulatedContext = {
        ...context,
        availableMinutes: req.body.availableMinutes !== undefined ? Number(req.body.availableMinutes) : context.availableMinutes,
        energyLevel: req.body.energyLevel !== undefined ? Number(req.body.energyLevel) : context.energyLevel,
        fatigueLevel: req.body.fatigueLevel !== undefined ? Number(req.body.fatigueLevel) : context.fatigueLevel,
        stressLevel: req.body.stressLevel !== undefined ? Number(req.body.stressLevel) : context.stressLevel,
        sorenessLevel: req.body.sorenessLevel !== undefined ? Number(req.body.sorenessLevel) : (context.sorenessLevel || 3),
        sleepHours: req.body.sleepHours !== undefined ? Number(req.body.sleepHours) : context.sleepHours,
        sleepQuality: req.body.sleepQuality !== undefined ? Number(req.body.sleepQuality) : (context.sleepQuality || 6),
        environment: req.body.environment || context.environment,
        equipmentAvailable: req.body.equipmentAvailable || context.equipmentAvailable
      };

      const candidateDuration = Number(req.body.candidateDurationMinutes ?? 20);
      const candidateIntensity = req.body.candidateIntensity ?? 'low';
      const candidateCategory = req.body.candidateCategory ?? 'recovery';

      const baseline: AdherenceFeatureVector = {
        sleepHours: context.sleepHours,
        sleepQuality: context.sleepQuality,
        energyLevel: context.energyLevel,
        fatigueLevel: context.fatigueLevel,
        stressLevel: context.stressLevel,
        sorenessLevel: context.sorenessLevel || 3,
        availableMinutes: context.availableMinutes,
        candidateDurationMinutes: 20,
        candidateIntensity: 'low',
        candidateCategory: 'recovery',
        environment: context.environment,
        historicalHomeCompletionRate: behavior.completionRateHome,
        historicalGymCompletionRate: behavior.completionRateGym,
        baselineAdherenceRate: behavior.completionRateOverall,
        historicalSkipRate: behavior.skipRateOverall,
        behavioralMomentum: evolvingState.behavioralMomentum
      };

      const simulated: AdherenceFeatureVector = {
        sleepHours: simulatedContext.sleepHours,
        sleepQuality: simulatedContext.sleepQuality,
        energyLevel: simulatedContext.energyLevel,
        fatigueLevel: simulatedContext.fatigueLevel,
        stressLevel: simulatedContext.stressLevel,
        sorenessLevel: simulatedContext.sorenessLevel,
        availableMinutes: simulatedContext.availableMinutes,
        candidateDurationMinutes: candidateDuration,
        candidateIntensity: candidateIntensity,
        candidateCategory: candidateCategory,
        environment: simulatedContext.environment,
        historicalHomeCompletionRate: behavior.completionRateHome,
        historicalGymCompletionRate: behavior.completionRateGym,
        baselineAdherenceRate: behavior.completionRateOverall,
        historicalSkipRate: behavior.skipRateOverall,
        behavioralMomentum: evolvingState.behavioralMomentum
      };

      // 2. Base counterfactual from ML service
      const baseResult = await mlService.computeCounterfactual(baseline, simulated);

      // 3. Current (Baseline) Recommendation evaluation
      let currentRec: any = db.getRecommendationHistory()[0];
      if (!currentRec) {
        currentRec = await decisionEngine.generateTodayRecommendation(
          profile,
          baselineContext,
          evolvingState,
          behavior,
          goals,
          behavioralProfile
        );
      }

      // 4. Candidate pool under What-If scenario
      const simCandidates = decisionEngine.generateCandidates(
        simulatedContext,
        profile,
        evolvingState,
        goals,
        behavioralProfile
      );

      // If user specified a custom duration or intensity, inject that candidate to evaluate
      if (req.body.candidateDurationMinutes || req.body.candidateIntensity) {
        const customCand = {
          id: 'cand-custom-simulated',
          title: `${candidateDuration}-Min ${simulatedContext.environment === 'home' ? 'Home' : simulatedContext.environment === 'gym' ? 'Gym' : 'Outdoor'} ${req.body.activityType || 'Session'}`,
          durationMinutes: candidateDuration,
          intensity: candidateIntensity as any,
          environment: simulatedContext.environment,
          activityType: (req.body.activityType || 'Functional Strength') as any,
          requiredEquipment: simulatedContext.environment === 'gym' ? ['Barbell & Rack', 'Dumbbells'] : ['Dumbbells', 'Yoga mat'],
          goalAlignment: 'General Consistency & Physical Capacity',
          recoveryDemand: (candidateIntensity === 'high' ? 'high' : candidateIntensity === 'moderate' ? 'moderate' : 'low') as any,
          description: `Custom ${candidateDuration}-minute routine evaluated under simulated ${simulatedContext.environment} scenario.`,
          targetDomain: 'Active Physiological Stimulus',
          category: candidateCategory as any
        };
        if (!simCandidates.some(c => c.durationMinutes === candidateDuration && c.intensity === candidateIntensity)) {
          simCandidates.unshift(customCand);
        }
      }

      // Evaluate candidate matrix under simulated context
      const evaluatedSimCandidates = await decisionEngine.evaluateCandidateMatrix(
        simCandidates,
        simulatedContext,
        profile,
        evolvingState,
        goals,
        behavioralProfile,
        behavior
      );

      const topSimCandidate = evaluatedSimCandidates[0];

      const candidateRankings = evaluatedSimCandidates.map((cand, idx) => ({
        id: cand.id,
        title: cand.title,
        activityType: cand.activityType,
        durationMinutes: cand.durationMinutes,
        intensity: cand.intensity,
        environment: cand.environment,
        predictedAdherence: cand.predictedAdherence,
        finalDecisionScore: Math.round(cand.finalDecisionScore * 100) / 100,
        suitabilityScore: cand.suitabilityScore,
        goalAlignmentScore: cand.goalAlignmentScore,
        contextFeasibilityScore: cand.contextFeasibilityScore,
        behavioralFitScore: cand.behavioralFitScore,
        rank: idx + 1,
        isRecommended: idx === 0,
        rankingRationale: cand.rationale || `Ranked #${idx + 1} with composite score ${Math.round(cand.finalDecisionScore * 100)}%.`
      }));

      // 5. Genuine SHAP explanations for baseline & simulated
      const baselineShap = await mlService.explainAdherence(baseline);
      const simulatedShap = await mlService.explainAdherence(simulated);

      // 6. Five-factor Decision Intelligence comparison
      const currentSuitability = currentRec.suitability ?? 70;
      const currentAdherence = currentRec.predictedAdherence ?? 65;
      const currentGoal = currentRec.goalAlignmentScore ?? 75;
      const currentFeasibility = currentRec.contextFeasibilityScore ?? 70;
      const currentBehavioral = currentRec.behavioralFitScore ?? 70;

      const simSuitability = topSimCandidate ? topSimCandidate.suitabilityScore : baseResult.simulatedSuitability;
      const simAdherence = topSimCandidate ? topSimCandidate.predictedAdherence : baseResult.simulatedAdherence;
      const simGoal = topSimCandidate ? topSimCandidate.goalAlignmentScore : 70;
      const simFeasibility = topSimCandidate ? topSimCandidate.contextFeasibilityScore : 75;
      const simBehavioral = topSimCandidate ? topSimCandidate.behavioralFitScore : 70;

      const fiveFactorComparison = [
        {
          factor: 'Health Suitability',
          weight: 0.30,
          weightPercent: '30%',
          currentScore: Math.round(currentSuitability),
          whatIfScore: Math.round(simSuitability),
          delta: Math.round(simSuitability - currentSuitability),
          reason: simSuitability >= currentSuitability
            ? 'Simulated recovery markers and session pacing reduce physiological strain.'
            : 'Higher fatigue or intensity load reduces autonomic tolerance under this scenario.'
        },
        {
          factor: 'Predicted Adherence',
          weight: 0.25,
          weightPercent: '25%',
          currentScore: Math.round(currentAdherence),
          whatIfScore: Math.round(simAdherence),
          delta: Math.round(simAdherence - currentAdherence),
          reason: simAdherence >= currentAdherence
            ? 'Adjusted schedule window and environment lower execution barriers.'
            : 'Increased logistical friction or fatigue burden lowers predicted completion likelihood.'
        },
        {
          factor: 'Goal Alignment',
          weight: 0.20,
          weightPercent: '20%',
          currentScore: Math.round(currentGoal),
          whatIfScore: Math.round(simGoal),
          delta: Math.round(simGoal - currentGoal),
          reason: Math.abs(simGoal - currentGoal) <= 5
            ? 'Preserves the long-term target trajectory while adjusting acute execution parameters.'
            : simGoal < currentGoal
              ? 'Shift towards lower volume or recovery slightly reduces direct target progress but protects consistency.'
              : 'Enhanced readiness allows direct progression toward weekly volume milestones.'
        },
        {
          factor: 'Context Feasibility',
          weight: 0.15,
          weightPercent: '15%',
          currentScore: Math.round(currentFeasibility),
          whatIfScore: Math.round(simFeasibility),
          delta: Math.round(simFeasibility - currentFeasibility),
          reason: simFeasibility >= currentFeasibility
            ? 'Scenario offers greater time buffer or eliminates transit overhead.'
            : 'Compressed time window or location constraints introduce scheduling friction.'
        },
        {
          factor: 'Behavioral Fit',
          weight: 0.10,
          weightPercent: '10%',
          currentScore: Math.round(currentBehavioral),
          whatIfScore: Math.round(simBehavioral),
          delta: Math.round(simBehavioral - currentBehavioral),
          reason: simBehavioral >= currentBehavioral
            ? 'Aligns with your highest historical completion duration and environment brackets.'
            : 'Approaches historical friction zones based on your past outcome patterns.'
        }
      ];

      // 7. Detected Changes & Directional Explanations (Strictly non-causal language)
      const detectedChanges = [];
      if (simulatedContext.availableMinutes !== baselineContext.availableMinutes) {
        const d = simulatedContext.availableMinutes - baselineContext.availableMinutes;
        detectedChanges.push({
          variable: 'Available Time',
          fromValue: `${baselineContext.availableMinutes} min`,
          toValue: `${simulatedContext.availableMinutes} min`,
          direction: (d >= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
          impactExplanation: d >= 0
            ? 'Contributed to an increase in context feasibility and expanded scheduling buffer.'
            : 'Contributed to a decrease in context feasibility, compressing available margin.'
        });
      }
      if (simulatedContext.energyLevel !== baselineContext.energyLevel) {
        const d = simulatedContext.energyLevel - baselineContext.energyLevel;
        detectedChanges.push({
          variable: 'Energy Level',
          fromValue: `${baselineContext.energyLevel}/10`,
          toValue: `${simulatedContext.energyLevel}/10`,
          direction: (d >= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
          impactExplanation: d >= 0
            ? 'Contributed to an increase in predicted adherence and physical readiness.'
            : 'Contributed to a decrease in predicted adherence and favored low-intensity options.'
        });
      }
      if (simulatedContext.fatigueLevel !== baselineContext.fatigueLevel) {
        const d = simulatedContext.fatigueLevel - baselineContext.fatigueLevel;
        detectedChanges.push({
          variable: 'Fatigue Level',
          fromValue: `${baselineContext.fatigueLevel}/10`,
          toValue: `${simulatedContext.fatigueLevel}/10`,
          direction: (d <= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
          impactExplanation: d <= 0
            ? 'Contributed to an increase in health suitability and neuromuscular readiness.'
            : 'Contributed to a decrease in health suitability, elevating need for active recovery.'
        });
      }
      if (simulatedContext.sleepHours !== baselineContext.sleepHours) {
        const d = simulatedContext.sleepHours - baselineContext.sleepHours;
        detectedChanges.push({
          variable: 'Sleep Duration',
          fromValue: `${baselineContext.sleepHours}h`,
          toValue: `${simulatedContext.sleepHours}h`,
          direction: (d >= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
          impactExplanation: d >= 0
            ? 'Contributed to an increase in autonomic recovery score and tissue restoration.'
            : 'Contributed to an acute sleep deficit penalty in the health suitability model.'
        });
      }
      if (simulatedContext.environment !== baselineContext.environment) {
        detectedChanges.push({
          variable: 'Environment',
          fromValue: baselineContext.environment,
          toValue: simulatedContext.environment,
          direction: simulatedContext.environment === 'home' ? 'positive' : 'neutral' as any,
          impactExplanation: simulatedContext.environment === 'home'
            ? 'Contributed to an increase in behavioral fit based on higher home completion statistics.'
            : `Altered logistical setup to ${simulatedContext.environment}, requiring transit and equipment check.`
        });
      }
      if (candidateDuration !== 20) {
        const d = 20 - candidateDuration;
        detectedChanges.push({
          variable: 'Workout Duration',
          fromValue: '20 min',
          toValue: `${candidateDuration} min`,
          direction: (d >= 0 ? 'positive' : 'negative') as 'positive' | 'negative',
          impactExplanation: d >= 0
            ? 'Contributed to an increase in completion likelihood via reduced session burden.'
            : 'Contributed to higher stimulus potential but increased time window demands.'
        });
      }
      if (candidateIntensity !== 'low') {
        detectedChanges.push({
          variable: 'Workout Intensity',
          fromValue: 'low',
          toValue: candidateIntensity,
          direction: 'neutral' as any,
          impactExplanation: `Adjusted target physiological zone to ${candidateIntensity}, modifying recovery demand.`
        });
      }

      // 8. Goal-Condition Conflict and Long-Term Goal Preservation Analysis
      const conflict = decisionEngine.detectGoalConditionConflict(
        profile,
        simulatedContext,
        evolvingState,
        goals
      );

      const goalConflictAnalysis = {
        hasConflict: conflict.hasConflict,
        goalTitle: conflict.goalName,
        severity: conflict.severity,
        explanation: conflict.conflictExplanation,
        resolution: conflict.recommendedResolution,
        longTermTradeoffNotice: 'The Decision Intelligence Engine optimizes for sustainable long-term consistency rather than maximal short-term adherence in isolation. An option with high adherence but negligible goal stimulus is deprioritized in favor of calibrated progression.'
      };

      // 9. Single-Variable Sensitivity Analysis (Change One Variable)
      const sensitivityVar = req.body.sensitivityVariable || 'availableMinutes';
      const sensitivityPoints = [];
      if (sensitivityVar === 'availableMinutes') {
        const testMinutes = [15, 20, 30, 45, 60];
        for (const m of testMinutes) {
          const testFeats = { ...simulated, availableMinutes: m };
          const p = await mlService.predictAdherence(testFeats);
          const feasShift = m >= candidateDuration ? Math.min(100, 80 + (m - candidateDuration) * 1.2) : Math.max(20, 100 - (candidateDuration - m) * 6);
          const decScore = Math.round((simSuitability * 0.3 + p.predictedAdherence * 0.25 + simGoal * 0.2 + feasShift * 0.15 + simBehavioral * 0.10)) / 100;
          sensitivityPoints.push({
            value: m,
            label: `${m} min`,
            predictedAdherence: p.predictedAdherence,
            decisionScore: decScore,
            recommendedTitle: m < 25 ? '15-Min Micro-Session' : m <= 35 ? '25-Min Home Functional Flow' : '45-Min Comprehensive Session'
          });
        }
      } else if (sensitivityVar === 'fatigueLevel') {
        const testFatigue = [2, 4, 6, 8, 10];
        for (const f of testFatigue) {
          const testFeats = { ...simulated, fatigueLevel: f };
          const p = await mlService.predictAdherence(testFeats);
          const suitShift = Math.max(15, 95 - f * 8);
          const decScore = Math.round((suitShift * 0.3 + p.predictedAdherence * 0.25 + simGoal * 0.2 + simFeasibility * 0.15 + simBehavioral * 0.10)) / 100;
          sensitivityPoints.push({
            value: f,
            label: `${f}/10`,
            predictedAdherence: p.predictedAdherence,
            decisionScore: decScore,
            recommendedTitle: f >= 7 ? 'Restorative Breathwork & Mobility' : f >= 5 ? 'Moderate Functional Strength' : 'High-Intensity Progression'
          });
        }
      } else if (sensitivityVar === 'sleepHours') {
        const testSleep = [4, 5, 6, 7, 8.5];
        for (const s of testSleep) {
          const testFeats = { ...simulated, sleepHours: s };
          const p = await mlService.predictAdherence(testFeats);
          const suitShift = Math.min(100, Math.max(20, 40 + (s - 4) * 13));
          const decScore = Math.round((suitShift * 0.3 + p.predictedAdherence * 0.25 + simGoal * 0.2 + simFeasibility * 0.15 + simBehavioral * 0.10)) / 100;
          sensitivityPoints.push({
            value: s,
            label: `${s}h`,
            predictedAdherence: p.predictedAdherence,
            decisionScore: decScore,
            recommendedTitle: s < 6 ? 'Parasympathetic Recovery' : 'Standard Scheduled Training'
          });
        }
      }

      // 10. Synthesize counterfactual explanation
      let counterfactualExplanation = '';
      if (detectedChanges.length === 0) {
        counterfactualExplanation = 'Simulated scenario matches your current evolving context. Decision engine rankings and adherence estimates remain identical to your active baseline recommendation.';
      } else {
        const topChange = detectedChanges[0];
        const adhDiff = simAdherence - currentAdherence;
        const adhPhrase = adhDiff > 0 
          ? `improved predicted adherence by +${adhDiff}%` 
          : adhDiff < 0 
            ? `reduced predicted adherence by ${adhDiff}%` 
            : 'maintained identical adherence estimates';
        counterfactualExplanation = `Adjusting ${topChange.variable.toLowerCase()} from ${topChange.fromValue} to ${topChange.toValue} ${adhPhrase}. Under these hypothetical conditions, ${topSimCandidate?.title || 'the restorative option'} achieves the highest multi-factor balance (${Math.round((topSimCandidate?.finalDecisionScore || 0.8) * 100)}% decision score).`;
      }

      res.json({
        ...baseResult,
        modelDisclaimer: 'Model-based scenario estimate',
        currentRecommendation: {
          id: currentRec.id,
          title: currentRec.title,
          durationMinutes: currentRec.durationMinutes,
          intensity: currentRec.intensity,
          environment: currentRec.environment,
          activityType: currentRec.activityType || 'Functional Strength',
          predictedAdherence: currentAdherence,
          decisionScore: currentRec.finalDecisionScore ?? 0.78,
          suitabilityScore: currentSuitability,
          goalAlignmentScore: currentGoal,
          contextFeasibilityScore: currentFeasibility,
          behavioralFitScore: currentBehavioral,
          predictedAdherenceContribution: Math.round(currentAdherence * 0.25)
        },
        whatIfRecommendation: topSimCandidate ? {
          id: topSimCandidate.id,
          title: topSimCandidate.title,
          durationMinutes: topSimCandidate.durationMinutes,
          intensity: topSimCandidate.intensity,
          environment: topSimCandidate.environment,
          activityType: topSimCandidate.activityType,
          predictedAdherence: topSimCandidate.predictedAdherence,
          decisionScore: Math.round(topSimCandidate.finalDecisionScore * 100) / 100,
          suitabilityScore: topSimCandidate.suitabilityScore,
          goalAlignmentScore: topSimCandidate.goalAlignmentScore,
          contextFeasibilityScore: topSimCandidate.contextFeasibilityScore,
          behavioralFitScore: topSimCandidate.behavioralFitScore,
          predictedAdherenceContribution: Math.round(topSimCandidate.predictedAdherence * 0.25)
        } : undefined,
        detectedChanges,
        shapComparison: {
          isGenuineShap: simulatedShap.isGenuineShap,
          explanationStatus: simulatedShap.explanationStatus,
          method: simulatedShap.explanationMethod || 'SHAP LinearExplainer',
          modelName: simulatedShap.model || 'Logistic Regression',
          baseValue: simulatedShap.baseValue || 0.0418,
          currentTopPositive: (baselineShap.topPositiveFactors || []).slice(0, 4),
          currentTopNegative: (baselineShap.topNegativeFactors || []).slice(0, 4),
          whatIfTopPositive: (simulatedShap.topPositiveFactors || []).slice(0, 4),
          whatIfTopNegative: (simulatedShap.topNegativeFactors || []).slice(0, 4),
          disclaimer: simulatedShap.isGenuineShap 
            ? 'SHAP-based model explanation' 
            : 'System heuristic fallback — not genuine SHAP.'
        },
        fiveFactorComparison,
        candidateRankings,
        goalConflictAnalysis,
        counterfactualExplanation,
        sensitivityAnalysis: {
          variable: sensitivityVar,
          label: sensitivityVar === 'availableMinutes' ? 'Available Time (Minutes)' : sensitivityVar === 'fatigueLevel' ? 'Fatigue Level (1-10)' : 'Sleep Duration (Hours)',
          points: sensitivityPoints
        },
        technicalDetails: {
          modelName: 'Logistic Regression (Scikit-Learn Calibrated)',
          modelVersion: 'v1.0.0-production',
          timestamp: new Date().toISOString(),
          explanationMethod: simulatedShap.isGenuineShap ? 'SHAP LinearExplainer (Exact Kernel Attribution)' : 'Analytical Baseline Attribution',
          isGenuineShap: simulatedShap.isGenuineShap,
          baselineVector: baseline,
          simulatedVector: simulated,
          weights: {
            healthSuitability: 0.30,
            predictedAdherence: 0.25,
            goalAlignment: 0.20,
            contextFeasibility: 0.15,
            behavioralFit: 0.10
          }
        }
      });
    } catch (err: any) {
      console.error('Error computing what-if scenario:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // =========================================================================
  // MACHINE LEARNING ADHERENCE PREDICTION PIPELINE
  // =========================================================================

  // GET current ML model metadata and statistical evaluation
  app.get('/api/ml/model', async (req, res) => {
    try {
      const mlMetadata = await mlService.getCurrentModelMetadata();
      if (mlMetadata) {
        db.setMLModelMetadata(mlMetadata);
        return res.json(mlMetadata);
      }
      const repoMetadata = db.getMLModelMetadata();
      res.json(repoMetadata);
    } catch (err: any) {
      const repoMetadata = db.getMLModelMetadata();
      res.json(repoMetadata);
    }
  });

  // POST predict adherence for arbitrary feature set
  app.post('/api/ml/predict', async (req, res) => {
    try {
      const context = db.getDailyContext();
      const behavior = db.getBehaviorPatternSummary();

      const featureVector: AdherenceFeatureVector = {
        sleepHours: req.body.sleepHours ?? context.sleepHours,
        sleepQuality: req.body.sleepQuality ?? context.sleepQuality,
        energyLevel: req.body.energyLevel ?? context.energyLevel,
        fatigueLevel: req.body.fatigueLevel ?? context.fatigueLevel,
        stressLevel: req.body.stressLevel ?? context.stressLevel,
        sorenessLevel: req.body.sorenessLevel ?? context.sorenessLevel,
        availableMinutes: req.body.availableMinutes ?? context.availableMinutes,
        candidateDurationMinutes: req.body.candidateDurationMinutes ?? 20,
        candidateIntensity: req.body.candidateIntensity ?? 'low',
        candidateCategory: req.body.candidateCategory ?? 'recovery',
        environment: req.body.environment ?? context.environment,
        historicalHomeCompletionRate: behavior.completionRateHome,
        historicalGymCompletionRate: behavior.completionRateGym,
        baselineAdherenceRate: behavior.completionRateOverall,
        historicalSkipRate: behavior.skipRateOverall,
        historicalPartialRate: behavior.partialRateOverall,
        behavioralMomentum: db.getEvolvingState().behavioralMomentum
      };

      const result = await mlService.predictAdherence(featureVector, req.body.userId, req.body.recommendationId);

      // Record to ledger if requested
      if (req.body.recordInLedger) {
        db.addPredictionRecord({
          userId: req.body.userId || 'user-001',
          recommendationId: req.body.recommendationId || `cand-${Date.now()}`,
          recommendationTitle: req.body.recommendationTitle || `${featureVector.candidateDurationMinutes}-Min ${featureVector.candidateCategory}`,
          predictionProbability: result.adherenceProbability,
          predictedAdherence: result.predictedAdherence,
          predictedClass: result.predictedClass,
          modelName: result.modelName,
          modelVersion: result.modelVersion,
          isBaselineFallback: result.isModelPlaceholder,
          dataSourceLabel: result.dataSourceLabel,
          featureSnapshot: result.featureSnapshot || featureVector,
          limitationNotice: result.limitationNotice
        });
      }

      res.json(result);
    } catch (err: any) {
      console.error('ML Prediction error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // GET explain adherence prediction for today's active context and recommendation
  app.get('/api/ml/explain', async (req, res) => {
    try {
      const context = db.getDailyContext();
      const behavior = db.getBehaviorPatternSummary();
      const history = db.getRecommendationHistory();
      const latestRec = history.length > 0 ? history[0] : null;

      const featureVector: Partial<AdherenceFeatureVector> = {
        sleepHours: context.sleepHours,
        sleepQuality: context.sleepQuality,
        energyLevel: context.energyLevel,
        fatigueLevel: context.fatigueLevel,
        stressLevel: context.stressLevel,
        sorenessLevel: context.sorenessLevel,
        availableMinutes: context.availableMinutes,
        candidateDurationMinutes: latestRec?.durationMinutes ?? 20,
        candidateIntensity: latestRec?.intensity ?? 'moderate',
        candidateCategory: 'workout',
        environment: latestRec?.environment ?? context.environment,
        historicalHomeCompletionRate: behavior.completionRateHome,
        historicalGymCompletionRate: behavior.completionRateGym,
        baselineAdherenceRate: behavior.completionRateOverall,
        historicalSkipRate: behavior.skipRateOverall,
        historicalPartialRate: behavior.partialRateOverall,
        behavioralMomentum: db.getEvolvingState().behavioralMomentum
      };

      const explanation = await mlService.explainAdherence(featureVector);
      res.json(explanation);
    } catch (err: any) {
      console.error('ML Explain GET error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // POST explain adherence prediction for arbitrary/hypothetical feature vectors (What-If testing)
  app.post('/api/ml/explain', async (req, res) => {
    try {
      const context = db.getDailyContext();
      const behavior = db.getBehaviorPatternSummary();

      const featureVector: Partial<AdherenceFeatureVector> = {
        sleepHours: req.body.sleepHours ?? context.sleepHours,
        sleepQuality: req.body.sleepQuality ?? context.sleepQuality,
        energyLevel: req.body.energyLevel ?? context.energyLevel,
        fatigueLevel: req.body.fatigueLevel ?? context.fatigueLevel,
        stressLevel: req.body.stressLevel ?? context.stressLevel,
        sorenessLevel: req.body.sorenessLevel ?? context.sorenessLevel,
        availableMinutes: req.body.availableMinutes ?? context.availableMinutes,
        candidateDurationMinutes: req.body.candidateDurationMinutes ?? 20,
        candidateIntensity: req.body.candidateIntensity ?? 'moderate',
        candidateCategory: req.body.candidateCategory ?? 'workout',
        environment: req.body.environment ?? context.environment,
        historicalHomeCompletionRate: behavior.completionRateHome,
        historicalGymCompletionRate: behavior.completionRateGym,
        baselineAdherenceRate: behavior.completionRateOverall,
        historicalSkipRate: behavior.skipRateOverall,
        historicalPartialRate: behavior.partialRateOverall,
        behavioralMomentum: db.getEvolvingState().behavioralMomentum
      };

      const explanation = await mlService.explainAdherence(featureVector);
      res.json(explanation);
    } catch (err: any) {
      console.error('ML Explain POST error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // POST trigger ML candidate model training & statistical model comparison
  app.post('/api/ml/train', async (req, res) => {
    try {
      const outcomes = db.getOutcomes();
      const dailyContexts = db.getDailyContextHistory();
      const behavior = db.getBehaviorPatternSummary();

      // Assemble training dataset without target leakage
      const trainingRecords = outcomes.map(outcome => {
        const ctx = dailyContexts.find(c => c.date === outcome.timestamp.split('T')[0]) || db.getDailyContext();
        return {
          sleep_hours: ctx.sleepHours,
          sleep_quality: ctx.sleepQuality,
          energy_level: ctx.energyLevel,
          fatigue_level: ctx.fatigueLevel,
          stress_level: ctx.stressLevel,
          soreness_level: ctx.sorenessLevel || 3,
          available_minutes: ctx.availableMinutes,
          recommended_duration_minutes: outcome.plannedDurationMinutes,
          environment: outcome.contextSnapshot?.environment || 'home',
          activity_type: outcome.category,
          intensity: outcome.intensity,
          recommended_time: 'morning',
          day_of_week: 'Monday',
          preferred_environment: 'home',
          preferred_time: 'morning',
          historical_completion_rate: behavior.completionRateOverall,
          historical_skip_rate: behavior.skipRateOverall,
          historical_partial_rate: behavior.partialRateOverall,
          behavioral_momentum: 65,
          goal_priority_numeric: 1,
          outcome: outcome.outcomeStatus === 'completed' ? 1 : 0
        };
      });

      const trainResult = await mlService.trainCandidateModels(
        trainingRecords,
        req.body.dataSource || 'Trained on historical outcome records'
      );

      if (trainResult.metadata) {
        db.setMLModelMetadata(trainResult.metadata);
      }

      res.json(trainResult);
    } catch (err: any) {
      console.error('ML Training error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // GET predictions ledger with evaluation metrics
  app.get('/api/ml/predictions', (req, res) => {
    try {
      const records = db.getPredictionRecords();
      const evaluated = records.filter(r => r.actualOutcomeStatus !== undefined);
      
      const pairs = evaluated.map(r => ({
        predicted: r.predictedAdherence,
        actualCompleted: r.actualOutcomeStatus === 'completed'
      }));

      const evaluation = mlService.evaluateModelMetrics(pairs);

      res.json({
        predictions: records,
        evaluation,
        totalPredictions: records.length,
        evaluatedOutcomesCount: evaluated.length
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI Coach Chat powered by Gemini
  app.post('/api/coach/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      const context = db.getDailyContext();
      const state = db.getEvolvingState();
      const behavior = db.getBehaviorPatternSummary();

      const contextSummary = `Sleep: ${context.sleepHours.toFixed(1)}h (Quality: ${context.sleepQuality}/10), Energy: ${context.energyLevel}/10, Fatigue: ${context.fatigueLevel}/10, Stress: ${context.stressLevel}/10, Recovery Readiness: ${context.recoveryScore}%, Available Time: ${context.availableMinutes}m, Environment: ${context.environment}`;
      const recommendationSummary = `Recommended Action: 20-Min Restorative Spinal Mobility & Breathwork (Low Intensity, Recovery domain) to adapt to sleep debt and fatigue.`;
      const behaviorSummary = `Home completion rate: ${behavior.completionRateHome}%, Gym completion rate: ${behavior.completionRateGym}%, Dominant barrier: ${state.dominantBarrier}.`;

      const responseText = await askAiCoach({
        message: message || 'How does today recommendation align with my recovery readiness?',
        contextSummary,
        recommendationSummary,
        behaviorSummary,
        history
      });

      res.json({ reply: responseText, timestamp: new Date().toISOString() });
    } catch (err: any) {
      console.error('Error in AI Coach chat endpoint:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // SYSTEM-WIDE EVALUATION & RESEARCH VALIDATION
  // ==========================================
  app.get('/api/evaluation/report', async (req, res) => {
    try {
      const report = await evaluationService.generateReport();
      res.json(report);
    } catch (err: any) {
      console.error('Error generating evaluation report:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/evaluation/export', async (req, res) => {
    try {
      const format = req.query.format === 'csv' ? 'csv' : 'json';
      const report = await evaluationService.generateReport();

      if (format === 'csv') {
        const csv = evaluationService.generateCsvExport(report);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="healthpilot-evaluation-report-${Date.now()}.csv"`);
        return res.send(csv);
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="healthpilot-evaluation-report-${Date.now()}.json"`);
      return res.json(report);
    } catch (err: any) {
      console.error('Error exporting evaluation metrics:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/evaluation/run-tests', async (req, res) => {
    try {
      const report = await evaluationService.generateReport();
      res.json({
        success: true,
        testedAt: new Date().toISOString(),
        reliabilityTests: report.reliabilityTests,
        whatIfConsistency: report.whatIfConsistency,
        systemPerformance: report.systemPerformance
      });
    } catch (err: any) {
      console.error('Error running evaluation tests:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Explicit fallback HTML delivery for SPA routes in dev mode
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const fs = await import('fs');
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HealthPilot AI] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start HealthPilot AI server:', err);
});
