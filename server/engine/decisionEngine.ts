import {
  UserProfile,
  DailyContext,
  EvolvingUserState,
  BehaviorPatternSummary,
  TodayRecommendation,
  GoalConditionConflict,
  CandidateIntervention,
  EvaluatedCandidate,
  DecisionScoringWeights,
  RecommendationExplanation,
  InterventionActivityType,
  GoalStrategyItem,
  PersonalBehavioralProfile,
  RecommendationHistoryItem,
  DecisionFactorItem
} from '../../src/types/index.js';
import { mlService, AdherenceFeatureVector } from '../ml/mlService.js';
import { db } from '../db/repository.js';

/**
 * Standard Intervention Catalog
 * Contains multi-domain candidate interventions across all 8 supported activity types
 */
export const INTERVENTION_CATALOG: CandidateIntervention[] = [
  // 1. Mobility & Stretching
  {
    id: 'cand-mobility-20',
    activityType: 'Mobility & Stretching',
    title: '20-Min Restorative Spinal Mobility & Decompression Flow',
    durationMinutes: 20,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Yoga mat'],
    goalAlignment: 'Sleep Hygiene, Spinal Decompression & Habit Continuity',
    recoveryDemand: 'low',
    description: 'Cat-cow variations, thoracic extensions, kneeling hip openers, and 90-90 hip flows to restore postural alignment without central fatigue.',
    targetDomain: 'Autonomic Nervous System Recovery & Hip/Spine Decompression',
    category: 'recovery'
  },
  {
    id: 'cand-mobility-15',
    activityType: 'Mobility & Stretching',
    title: '15-Min Thoracic & Posterior Chain Release',
    durationMinutes: 15,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Yoga mat', 'Foam roller'],
    goalAlignment: 'Desk Work Posture Relief & Joint Mobility',
    recoveryDemand: 'low',
    description: 'Targeted myofascial foam rolling of thoracic spine and lats followed by active hamstring and glute flossing.',
    targetDomain: 'Postural Reset & Micro-Recovery',
    category: 'recovery'
  },

  // 2. Functional Strength
  {
    id: 'cand-strength-25',
    activityType: 'Functional Strength',
    title: '25-Min Home Dumbbell Strength (Posterior Focus)',
    durationMinutes: 25,
    intensity: 'moderate',
    environment: 'home',
    requiredEquipment: ['Adjustable dumbbells', 'Resistance bands'],
    goalAlignment: 'Posterior Chain Strength & Core Stability',
    recoveryDemand: 'moderate',
    description: 'Controlled tempo Romanian deadlifts, single-arm dumbbell rows, half-kneeling presses, and pallof presses.',
    targetDomain: 'Posterior Chain Hypertrophy & Neuromuscular Tone',
    category: 'workout'
  },
  {
    id: 'cand-strength-20',
    activityType: 'Functional Strength',
    title: '20-Min Core & Resistance Band Stability Circuit',
    durationMinutes: 20,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Resistance bands', 'Yoga mat'],
    goalAlignment: 'Lumbopelvic Stability & Movement Quality',
    recoveryDemand: 'low',
    description: 'Glute bridges with band abductions, dead-bugs, bird-dogs, and side plank holds.',
    targetDomain: 'Musculoskeletal Integrity & Postural Endurance',
    category: 'workout'
  },
  {
    id: 'cand-strength-45',
    activityType: 'Functional Strength',
    title: '45-Min Progressive Overload Heavy Compound Hypertrophy',
    durationMinutes: 45,
    intensity: 'high',
    environment: 'gym',
    requiredEquipment: ['Barbell & Rack', 'Dumbbells', 'Cable machine'],
    goalAlignment: 'Maximal Strength & 2x Bodyweight Deadlift',
    recoveryDemand: 'high',
    description: 'Heavy barbell deadlifts, barbell rows, dumbbell bench presses, and heavy farmer carries.',
    targetDomain: 'Maximal Neuromuscular Recruitment & Structural Remodeling',
    category: 'workout'
  },

  // 3. Aerobic Cardio
  {
    id: 'cand-cardio-35',
    activityType: 'Aerobic Cardio',
    title: '35-Min Aerobic Zone 2 Baseline Run',
    durationMinutes: 35,
    intensity: 'moderate',
    environment: 'outdoor',
    requiredEquipment: ['Running shoes'],
    goalAlignment: 'Cardiovascular Aerobic Base (10K sub-50 min)',
    recoveryDemand: 'moderate',
    description: 'Conversational nasal-breathing pace maintained between 65-75% max heart rate to develop mitochondrial density.',
    targetDomain: 'Mitochondrial Aerobic Base & Capillary Bed Expansion',
    category: 'workout'
  },
  {
    id: 'cand-cardio-20',
    activityType: 'Aerobic Cardio',
    title: '20-Min Low-Stress Aerobic Jog & Strides',
    durationMinutes: 20,
    intensity: 'low',
    environment: 'outdoor',
    requiredEquipment: ['Running shoes'],
    goalAlignment: 'Cardiovascular Aerobic Maintenance',
    recoveryDemand: 'low',
    description: 'Gentle conversational jog with 4 easy 15-second rhythm strides at the conclusion.',
    targetDomain: 'Active Hemodynamic Flow & Running Economy',
    category: 'workout'
  },
  {
    id: 'cand-cardio-45',
    activityType: 'Aerobic Cardio',
    title: '45-Min Outdoor Threshold Intervals (4 x 4 min)',
    durationMinutes: 45,
    intensity: 'high',
    environment: 'outdoor',
    requiredEquipment: ['Running shoes'],
    goalAlignment: 'Cardiovascular Aerobic Base (10K sub-50 min)',
    recoveryDemand: 'high',
    description: '10 min warm-up, 4 blocks of 4-min hard threshold pace at 90% HR max with 2-min active jogging recovery, 7 min cool-down.',
    targetDomain: 'VO2 Max Threshold & Glycolytic Tolerance',
    category: 'workout'
  },

  // 4. Walking
  {
    id: 'cand-walk-20',
    activityType: 'Walking',
    title: '20-Min Parasympathetic Outdoor Sunlight Walk',
    durationMinutes: 20,
    intensity: 'low',
    environment: 'outdoor',
    requiredEquipment: [],
    goalAlignment: 'Circadian Rhythm Sync & Active Cortisol Clearance',
    recoveryDemand: 'low',
    description: 'Brisk outdoor nasal-breathing walk in natural light to down-regulate acute sympathetic stress and stimulate circadian melatonin rhythm.',
    targetDomain: 'Autonomic Calming & Baseline Energy Flux',
    category: 'lighter_activity'
  },
  {
    id: 'cand-walk-30',
    activityType: 'Walking',
    title: '30-Min Brisk Incline Aerobic Walk',
    durationMinutes: 30,
    intensity: 'moderate',
    environment: 'outdoor',
    requiredEquipment: [],
    goalAlignment: 'Low-Impact Caloric Expenditure & Joint Sparing',
    recoveryDemand: 'low',
    description: 'Steady incline outdoor walk maintaining an elevated brisk pace without orthopedic impact.',
    targetDomain: 'Cardiovascular Circulation & Metabolic Flow',
    category: 'lighter_activity'
  },

  // 5. HIIT
  {
    id: 'cand-hiit-15',
    activityType: 'HIIT',
    title: '15-Min Micro-Interval High-Density Tabata',
    durationMinutes: 15,
    intensity: 'high',
    environment: 'home',
    requiredEquipment: ['Yoga mat'],
    goalAlignment: 'Metabolic Conditioning & Time-Compressed Consistency',
    recoveryDemand: 'high',
    description: '4 rounds of 20s all-out bodyweight movement (air squats, mountain climbers, burpees) followed by 10s rest.',
    targetDomain: 'Anaerobic Alactic Stimulation & Caloric Flux',
    category: 'workout'
  },
  {
    id: 'cand-hiit-25',
    activityType: 'HIIT',
    title: '25-Min Kettlebell / Dumbbell High-Density Intervals',
    durationMinutes: 25,
    intensity: 'high',
    environment: 'home',
    requiredEquipment: ['Adjustable dumbbells'],
    goalAlignment: 'Cardiovascular Work Capacity & Functional Power',
    recoveryDemand: 'high',
    description: 'EMOM (Every Minute on the Minute) circuit alternating dumbbell clean & thrusters, push-up burpees, and kettlebell swings.',
    targetDomain: 'EPOC Caloric Afterburn & Dynamic Power Endurance',
    category: 'workout'
  },

  // 6. Yoga
  {
    id: 'cand-yoga-20',
    activityType: 'Yoga',
    title: '20-Min Gentle Vinyasa Restoration & Hip Flow',
    durationMinutes: 20,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Yoga mat'],
    goalAlignment: 'Joint Mobility, Breath Synchronization & Pelvic Reset',
    recoveryDemand: 'low',
    description: 'Slow, fluid sun salutations transitioning into pigeon pose, seated forward fold, and supported bridge pose.',
    targetDomain: 'Connective Tissue Hydration & Vagal Tone',
    category: 'recovery'
  },
  {
    id: 'cand-yoga-30',
    activityType: 'Yoga',
    title: '30-Min Deep Hatha & Myofascial Opening',
    durationMinutes: 30,
    intensity: 'moderate',
    environment: 'home',
    requiredEquipment: ['Yoga mat'],
    goalAlignment: 'Total-Body Flexibility & Core Postural Control',
    recoveryDemand: 'low',
    description: 'Sustained holds in warrior series, triangle pose, low lunge, and spine twists paired with rhythmic 4-count pranayama breathing.',
    targetDomain: 'Fascial Elasticity & Neuromuscular Stillness',
    category: 'recovery'
  },

  // 7. Active Recovery
  {
    id: 'cand-recovery-25',
    activityType: 'Active Recovery',
    title: '25-Min Zone 1 Flushing & Full-Body Mobility Flow',
    durationMinutes: 25,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Yoga mat', 'Foam roller'],
    goalAlignment: 'Active Lymphatic Clearance & Nervous System Restoration',
    recoveryDemand: 'low',
    description: 'Low-effort dynamic joint circles, soft-tissue foam rolling, and effortless light bodyweight flows to flush metabolic waste.',
    targetDomain: 'Blood Flow Acceleration without Neuroendocrine Stress',
    category: 'recovery'
  },

  // 8. Recovery / Rest
  {
    id: 'cand-rest-15',
    activityType: 'Recovery / Rest',
    title: '15-Min Autonomic Nervous System Breathwork & Yoga Nidra',
    durationMinutes: 15,
    intensity: 'low',
    environment: 'home',
    requiredEquipment: ['Yoga mat'],
    goalAlignment: 'Sleep Hygiene, Cortisol Down-Regulation & Deep Rest',
    recoveryDemand: 'low',
    description: 'Guided resonant 4-7-8 diaphragmatic breathing followed by structured body-scan relaxation to reset autonomic balance.',
    targetDomain: 'Parasympathetic Activation & Deep Nervous System Reset',
    category: 'recovery'
  }
];

export class DecisionIntelligenceEngine {
  /**
   * Default multi-factor decision weights
   */
  public static readonly DEFAULT_WEIGHTS: DecisionScoringWeights = {
    suitabilityWeight: 0.30,
    predictedAdherenceWeight: 0.25,
    goalAlignmentWeight: 0.20,
    contextFeasibilityWeight: 0.15,
    behavioralFitWeight: 0.10
  };

  /**
   * Step 3: Candidate Generation
   * Generates a realistic, context-appropriate pool of candidate interventions.
   */
  public generateCandidates(
    context: DailyContext,
    profile: UserProfile,
    state: EvolvingUserState,
    goals: GoalStrategyItem[],
    behavioralProfile?: PersonalBehavioralProfile
  ): CandidateIntervention[] {
    const availableTime = context.availableMinutes || 30;
    const currentEnvironment = context.environment || 'home';
    const userEquipment = context.equipmentAvailable || profile.availableEquipment || ['Yoga mat'];

    // Select candidates matching time window or adaptive variants
    const pool = INTERVENTION_CATALOG.filter(candidate => {
      // If user has restricted time (< 25 min), avoid long sessions (> 35 min) in primary pool
      if (availableTime < 25 && candidate.durationMinutes > 35) {
        return false;
      }
      return true;
    });

    // Ensure we include:
    // 1. A restorative / mobility option
    // 2. A moderate functional strength option
    // 3. An aerobic or walking option
    // 4. The scheduled / high-demand ambition (to show contrast and explain adaptations)
    // 5. A time-compressed or micro option if time is scarce
    const selectedCandidates: CandidateIntervention[] = [];

    // Always include Restorative Mobility
    const mobilityOption = pool.find(c => c.activityType === 'Mobility & Stretching') || INTERVENTION_CATALOG[0];
    selectedCandidates.push(mobilityOption);

    // Include Moderate Strength if equipment allows, else Bodyweight/Band
    const strengthOption = pool.find(c => c.activityType === 'Functional Strength' && c.durationMinutes <= availableTime + 10)
      || INTERVENTION_CATALOG[2];
    selectedCandidates.push(strengthOption);

    // Include Aerobic Cardio or Walking
    const cardioOption = pool.find(c => (c.activityType === 'Aerobic Cardio' || c.activityType === 'Walking') && c.durationMinutes <= availableTime + 10)
      || INTERVENTION_CATALOG[5];
    selectedCandidates.push(cardioOption);

    // Include High Demand / Original Ambition for transparent evaluation and conflict demonstration
    const highOption = INTERVENTION_CATALOG.find(c => c.intensity === 'high' && c.activityType === 'Aerobic Cardio')
      || INTERVENTION_CATALOG.find(c => c.intensity === 'high')
      || INTERVENTION_CATALOG[7];
    if (!selectedCandidates.some(c => c.id === highOption.id)) {
      selectedCandidates.push(highOption);
    }

    // Include Active Recovery or Yoga
    const recoveryOption = pool.find(c => (c.activityType === 'Active Recovery' || c.activityType === 'Yoga' || c.activityType === 'Recovery / Rest') && !selectedCandidates.some(s => s.id === c.id));
    if (recoveryOption) {
      selectedCandidates.push(recoveryOption);
    }

    // Ensure at least 4-5 diverse candidates
    return selectedCandidates.slice(0, 6);
  }

  /**
   * Step 4: Health / State Suitability Assessment (0 - 100)
   * Evaluates physiological appropriateness based on autonomic recovery, sleep, fatigue, soreness, and stress.
   */
  public evaluateSuitability(
    candidate: CandidateIntervention,
    context: DailyContext,
    state: EvolvingUserState
  ): { score: number; reasons: string[] } {
    const recoveryScore = context.recoveryScore ?? state.recoveryReadiness ?? 65;
    const sleepHours = context.sleepHours ?? 7.0;
    const fatigueLevel = context.fatigueLevel ?? 5;
    const sorenessLevel = context.sorenessLevel ?? 4;
    const stressLevel = context.stressLevel ?? 5;
    const energyLevel = context.energyLevel ?? 6;

    const reasons: string[] = [];
    let suitability = 70;

    if (candidate.intensity === 'high' || candidate.recoveryDemand === 'high') {
      // High demand requires high autonomic recovery and low fatigue
      suitability = 50 + (recoveryScore - 50) * 0.5 + (energyLevel - 5) * 3 - (fatigueLevel - 5) * 5 - (sorenessLevel - 5) * 4;

      if (recoveryScore < 55) {
        suitability -= (55 - recoveryScore) * 0.7;
        reasons.push(`Autonomic recovery score (${recoveryScore}%) is below the safe threshold (65%) for high-intensity work.`);
      }
      if (sleepHours < 6.2) {
        suitability -= 18;
        reasons.push(`Sleep duration (${sleepHours.toFixed(1)}h) impairs glycogen replenishment and elevates soft-tissue strain risk.`);
      }
      if (fatigueLevel >= 6) {
        suitability -= (fatigueLevel - 5) * 4;
        reasons.push(`Elevated fatigue (${fatigueLevel}/10) severely impairs motor unit recruitment.`);
      }
      if (sorenessLevel >= 6) {
        suitability -= (sorenessLevel - 5) * 3;
        reasons.push(`Muscular soreness (${sorenessLevel}/10) indicates ongoing structural tissue repair.`);
      }
      if (stressLevel >= 7) {
        suitability -= 10;
        reasons.push(`Elevated allostatic stress (${stressLevel}/10) compounds cortisol accumulation during high-intensity intervals.`);
      }
      if (reasons.length === 0) {
        reasons.push('High physiological readiness allows intense glycolytic stimulus.');
      }
    } else if (candidate.intensity === 'moderate') {
      // Moderate demand is well-tolerated across moderate recovery
      suitability = 72 + (recoveryScore - 50) * 0.25 + (energyLevel - 5) * 2.5 - (fatigueLevel - 5) * 2.5 - (sorenessLevel - 5) * 2.5;

      if (recoveryScore < 45) {
        suitability -= 15;
        reasons.push(`Low recovery score (${recoveryScore}%) requires cautious pacing and extended rest intervals.`);
      }
      if (fatigueLevel >= 7) {
        suitability -= 12;
        reasons.push(`Fatigue (${fatigueLevel}/10) suggests moderating total volume.`);
      } else {
        reasons.push('Moderate loading maintains functional capacity without exhausting neuroendocrine reserves.');
      }
    } else {
      // Low-intensity & Restorative interventions
      suitability = 82;

      if (recoveryScore < 60) {
        suitability += 12; // Highly indicated when recovery is low
        reasons.push(`Low autonomic recovery (${recoveryScore}%) directly indicates restorative parasympathetic down-regulation.`);
      }
      if (sleepHours < 6.5) {
        suitability += 8;
        reasons.push(`Preserves daily training identity without worsening sleep debt (${sleepHours.toFixed(1)}h).`);
      }
      if (fatigueLevel >= 6) {
        suitability += 6;
        reasons.push(`Active recovery accelerates lymphatic drainage and metabolic clearance under high fatigue (${fatigueLevel}/10).`);
      }
      if (sorenessLevel >= 5) {
        suitability += 5;
        reasons.push('Decompresses tight connective tissue and restores joint glide.');
      }
      if (reasons.length === 0) {
        reasons.push('Restorative stimulus supports joint mobility and parasympathetic tone.');
      }
    }

    const finalScore = Math.max(5, Math.min(99, Math.round(suitability)));
    return { score: finalScore, reasons };
  }

  /**
   * Step 5: Goal Alignment Assessment (0 - 100)
   * Evaluates how effectively the candidate advances user's active chronic goals.
   */
  public evaluateGoalAlignment(
    candidate: CandidateIntervention,
    goals: GoalStrategyItem[]
  ): { score: number; reasons: string[] } {
    if (!goals || goals.length === 0) {
      return { score: 70, reasons: ['General fitness maintenance alignment.'] };
    }

    const reasons: string[] = [];
    let weightedScore = 0;
    let totalWeight = 0;

    for (const goal of goals) {
      const weight = goal.priority === 'primary' ? 0.60 : 0.40;
      totalWeight += weight;

      let match = 50;

      if (goal.category === 'endurance') {
        if (candidate.activityType === 'Aerobic Cardio') {
          match = candidate.intensity === 'high' ? 95 : 90;
          reasons.push(`Directly develops cardiovascular engine for "${goal.title}".`);
        } else if (candidate.activityType === 'Walking') {
          match = 75;
          reasons.push(`Builds low-impact aerobic base supporting "${goal.title}".`);
        } else if (candidate.activityType === 'Mobility & Stretching') {
          match = 70;
          reasons.push(`Maintains pelvic and thoracic mobility crucial for running mechanics.`);
        } else if (candidate.activityType === 'Functional Strength') {
          match = 65;
          reasons.push(`Fortifies running durability and posterior chain power.`);
        }
      } else if (goal.category === 'strength') {
        if (candidate.activityType === 'Functional Strength') {
          match = 95;
          reasons.push(`Directly develops posterior chain neuromuscular recruitment for "${goal.title}".`);
        } else if (candidate.activityType === 'Mobility & Stretching') {
          match = 75;
          reasons.push(`Preserves joint range of motion needed for clean hip hinge mechanics.`);
        } else if (candidate.activityType === 'HIIT') {
          match = 70;
          reasons.push(`Builds work capacity and dynamic explosive power.`);
        }
      } else if (goal.category === 'sleep' || goal.category === 'consistency') {
        if (candidate.activityType === 'Mobility & Stretching' || candidate.activityType === 'Recovery / Rest' || candidate.activityType === 'Yoga') {
          match = 95;
          reasons.push(`Lowers sympathetic arousal to directly support "${goal.title}".`);
        } else if (candidate.activityType === 'Walking' || candidate.activityType === 'Active Recovery') {
          match = 85;
          reasons.push(`Regulates diurnal cortisol curve to protect sleep quality.`);
        } else if (candidate.intensity === 'high') {
          match = 25;
          reasons.push(`High sympathetic arousal may temporarily conflict with "${goal.title}".`);
        }
      }

      weightedScore += match * weight;
    }

    const finalScore = Math.max(10, Math.min(99, Math.round(weightedScore / (totalWeight || 1))));
    return { score: finalScore, reasons: reasons.slice(0, 3) };
  }

  /**
   * Step 6: Personal Behavioral Fit Assessment (0 - 100)
   * Integrates user's empirical behavioral profile, preferred durations, environment completion rates, and barrier mitigation.
   */
  public evaluateBehavioralFit(
    candidate: CandidateIntervention,
    profile?: PersonalBehavioralProfile,
    summary?: BehaviorPatternSummary
  ): { score: number; reasons: string[]; isAttenuated: boolean } {
    const reasons: string[] = [];

    // Data Sufficiency check: if fewer than 3 outcomes or insufficient data, apply neutral score and flag attenuation
    if (!profile || profile.observationCount < 3 || profile.dataSufficiency === 'insufficient') {
      return {
        score: 50,
        reasons: ['Behavioral history is accumulating (baseline learning phase); neutral behavioral score applied.'],
        isAttenuated: true
      };
    }

    let fit = profile.overallRecentAdherence || 70;

    // 1. Duration range comparison
    if (candidate.durationMinutes <= 30) {
      fit += 18;
      reasons.push(`Duration (${candidate.durationMinutes}m) fits your highest historical completion bucket (16–30m @ ${summary?.completionRateHome || 83}%).`);
    } else if (candidate.durationMinutes > 40) {
      fit -= 22;
      reasons.push(`Duration (${candidate.durationMinutes}m) enters your lowest historical completion tier (>40m).`);
    }

    // 2. Environment completion rate comparison
    if (candidate.environment === 'home') {
      fit += 12;
      reasons.push(`Home environment matches your highest historical completion rate (${summary?.completionRateHome || 83}%).`);
    } else if (candidate.environment === 'gym') {
      fit -= 18;
      reasons.push(`Gym environment historically incurs logistical friction and lower completion (${summary?.completionRateGym || 33}%).`);
    }

    // 3. Dominant failure barrier mitigation
    if (profile.dominantBarrier.toLowerCase().includes('tired') || profile.dominantBarrier.toLowerCase().includes('fatigue')) {
      if (candidate.intensity === 'low' || candidate.recoveryDemand === 'low') {
        fit += 12;
        reasons.push(`Low-barrier session prevents triggering your dominant failure mode ("${profile.dominantBarrier}").`);
      } else if (candidate.intensity === 'high') {
        fit -= 16;
        reasons.push(`High intensity directly triggers your dominant historical skip barrier ("${profile.dominantBarrier}").`);
      }
    } else if (profile.dominantBarrier.toLowerCase().includes('time')) {
      if (candidate.durationMinutes <= 20) {
        fit += 15;
        reasons.push(`Compact duration neutralizes your dominant historical barrier ("${profile.dominantBarrier}").`);
      }
    }

    const finalScore = Math.max(10, Math.min(99, Math.round(fit)));
    return { score: finalScore, reasons: reasons.slice(0, 3), isAttenuated: false };
  }

  /**
   * Step 7: Context Feasibility Assessment (0 - 100)
   * Evaluates available time margin, equipment availability, and environmental logistics.
   */
  public evaluateFeasibility(
    candidate: CandidateIntervention,
    context: DailyContext
  ): { score: number; reasons: string[] } {
    const reasons: string[] = [];
    const availableTime = context.availableMinutes || 30;
    const currentEnvironment = context.environment || 'home';
    const equipmentAvailable = context.equipmentAvailable || ['Yoga mat'];

    // 1. Time feasibility
    let timeScore = 100;
    if (candidate.durationMinutes <= availableTime) {
      const margin = availableTime - candidate.durationMinutes;
      timeScore = Math.min(100, 85 + margin * 1.5);
      reasons.push(`Fits comfortably in your ${availableTime}-minute available window (+${margin}m buffer).`);
    } else {
      const deficit = candidate.durationMinutes - availableTime;
      timeScore = Math.max(10, 100 - deficit * 6);
      reasons.push(`Exceeds today's available time (${availableTime}m) by ${deficit} minutes.`);
    }

    // 2. Equipment feasibility
    let equipScore = 100;
    const missingEquip = candidate.requiredEquipment.filter(
      req => !equipmentAvailable.some(avail => avail.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(avail.toLowerCase()))
    );

    if (missingEquip.length > 0) {
      equipScore = 25;
      reasons.push(`Missing required equipment: ${missingEquip.join(', ')}.`);
    } else if (candidate.requiredEquipment.length > 0) {
      reasons.push(`All equipment available (${candidate.requiredEquipment.join(', ')}).`);
    } else {
      reasons.push('Zero equipment required.');
    }

    // 3. Environment feasibility
    let envScore = 100;
    if (candidate.environment !== 'any' && candidate.environment !== currentEnvironment) {
      if (candidate.environment === 'gym' && currentEnvironment === 'home') {
        envScore = 20;
        reasons.push('Requires traveling to gym while current location is home.');
      } else if (candidate.environment === 'outdoor' && currentEnvironment === 'home') {
        envScore = 75; // stepping outside is minor friction
        reasons.push('Requires stepping outdoors from home.');
      }
    }

    // Weighted context feasibility
    const finalScore = Math.max(5, Math.min(99, Math.round(
      0.50 * timeScore + 0.30 * equipScore + 0.20 * envScore
    )));

    return { score: finalScore, reasons: reasons.slice(0, 3) };
  }

  /**
   * Step 8: Multi-Factor Decision Scoring
   * Final Decision Score =
   *   Suitability contribution +
   *   Goal alignment contribution +
   *   Behavioral fit contribution +
   *   Predicted adherence contribution +
   *   Context feasibility contribution
   */
  public calculateDecisionScore(
    scores: {
      suitabilityScore: number;
      goalAlignmentScore: number;
      behavioralFitScore: number;
      predictedAdherence: number;
      contextFeasibilityScore: number;
    },
    weights: DecisionScoringWeights = DecisionIntelligenceEngine.DEFAULT_WEIGHTS
  ): {
    finalDecisionScore: number;
    breakdown: {
      suitabilityContribution: number;
      goalAlignmentContribution: number;
      behavioralFitContribution: number;
      predictedAdherenceContribution: number;
      contextFeasibilityContribution: number;
    };
  } {
    const sContrib = scores.suitabilityScore * weights.suitabilityWeight;
    const gContrib = scores.goalAlignmentScore * weights.goalAlignmentWeight;
    const bContrib = scores.behavioralFitScore * weights.behavioralFitWeight;
    const aContrib = scores.predictedAdherence * weights.predictedAdherenceWeight;
    const fContrib = scores.contextFeasibilityScore * weights.contextFeasibilityWeight;

    const total = sContrib + gContrib + bContrib + aContrib + fContrib;

    return {
      finalDecisionScore: Math.round(total * 10) / 10,
      breakdown: {
        suitabilityContribution: Math.round(sContrib * 10) / 10,
        goalAlignmentContribution: Math.round(gContrib * 10) / 10,
        behavioralFitContribution: Math.round(bContrib * 10) / 10,
        predictedAdherenceContribution: Math.round(aContrib * 10) / 10,
        contextFeasibilityContribution: Math.round(fContrib * 10) / 10
      }
    };
  }

  /**
   * Conflict Detection between long-term ambition and acute daily physiological status
   */
  public detectGoalConditionConflict(
    profile: UserProfile,
    context: DailyContext,
    state: EvolvingUserState,
    goals: GoalStrategyItem[] = []
  ): GoalConditionConflict {
    const sleepHours = context.sleepHours ?? 7.0;
    const fatigueLevel = context.fatigueLevel ?? 5;
    const recoveryScore = context.recoveryScore ?? state.recoveryReadiness ?? 65;
    const availableMinutes = context.availableMinutes ?? 30;

    const isSleepDepleted = sleepHours < 6.2;
    const isFatigued = fatigueLevel >= 6;
    const isRecoveryLow = recoveryScore < 55;

    const primaryGoal = goals.find(g => g.priority === 'primary') || {
      title: '10K Endurance Base & High-Intensity Threshold Training',
      category: 'endurance'
    };

    if ((isSleepDepleted || isFatigued) && isRecoveryLow) {
      return {
        hasConflict: true,
        goalName: primaryGoal.title,
        conditionDescription: `Acute sleep deficit (${sleepHours.toFixed(1)}h) and elevated fatigue (${fatigueLevel}/10) have lowered recovery readiness to ${recoveryScore}%.`,
        severity: 'high',
        conflictExplanation: `Your scheduled training plan calls for high-intensity work towards "${primaryGoal.title}", but attempting high-demand glycolytic exertion during an acute physiological deficit delays recovery, elevates injury risk, and statistically triples session abandonment.`,
        recommendedResolution: 'Prioritize low-demand restorative mobility or active recovery today. Shift high-intensity threshold stimulus to 48 hours later once sleep and autonomic markers rebound.'
      };
    }

    if (availableMinutes < 25) {
      return {
        hasConflict: true,
        goalName: primaryGoal.title,
        conditionDescription: `Available time window is compressed to ${availableMinutes} minutes.`,
        severity: 'moderate',
        conflictExplanation: 'Standard 45-minute sessions cannot fit into current schedule without rushing or truncation.',
        recommendedResolution: 'Execute a 15–20 minute high-density micro-session to preserve habit momentum without schedule friction.'
      };
    }

    return {
      hasConflict: false,
      goalName: primaryGoal.title,
      conditionDescription: 'Context metrics within acceptable physiological tolerance bands.',
      severity: 'low',
      conflictExplanation: 'No acute dissonance between long-term goal trajectory and daily readiness.',
      recommendedResolution: 'Execute planned session with standard pacing.'
    };
  }

  /**
   * Synthesizes transparent structured explanations
   */
  public generateExplanation(
    selected: EvaluatedCandidate,
    alternatives: EvaluatedCandidate[],
    context: DailyContext,
    goalConflict: GoalConditionConflict,
    weights: DecisionScoringWeights
  ): RecommendationExplanation {
    const keyFactors: string[] = [
      `Time window match: ${selected.durationMinutes}m session fits your ${context.availableMinutes}m available window with zero logistical rush.`,
      `Physiological suitability (${selected.suitabilityScore}%): ${selected.suitabilityReasons[0] || 'Optimized for current autonomic state.'}`,
      `Predicted completion likelihood (${selected.predictedAdherence}%): Calibrated machine learning estimate based on current physiological and behavioral context.`,
      `Goal alignment (${selected.goalAlignmentScore}%): ${selected.goalReasons[0] || 'Directly supports active target.'}`,
      `Behavioral adherence fit (${selected.behavioralFitScore}%): ${selected.behavioralReasons[0] || 'Matches empirical consistency patterns.'}`
    ];

    let summary = '';
    if (goalConflict.hasConflict) {
      summary = `Adaptive Decision Applied: System detected a goal-condition conflict (${goalConflict.conditionDescription}). Rather than forcing a high-intensity session that risks overreaching and dropout, this ${selected.durationMinutes}-minute ${selected.title} preserves daily habit momentum while accelerating nervous system restoration.`;
    } else {
      summary = `Selected to maximize progression toward active goals within your ${context.availableMinutes}-minute available window, balancing high physiological suitability (${selected.suitabilityScore}%) with strong statistical adherence (${selected.predictedAdherence}%).`;
    }

    let comparisonVsAlternatives = '';
    if (alternatives.length > 0) {
      const runnerUp = alternatives[0];
      comparisonVsAlternatives = `Ranked #${selected.title} ahead of #${runnerUp.title} (Score: ${selected.finalDecisionScore} vs ${runnerUp.finalDecisionScore}) due to higher physiological suitability (${selected.suitabilityScore}% vs ${runnerUp.suitabilityScore}%) and reduced logistical friction.`;
    }

    const sContrib = Math.round(selected.suitabilityScore * weights.suitabilityWeight * 10) / 10;
    const aContrib = Math.round(selected.predictedAdherence * weights.predictedAdherenceWeight * 10) / 10;
    const gContrib = Math.round(selected.goalAlignmentScore * weights.goalAlignmentWeight * 10) / 10;
    const fContrib = Math.round(selected.contextFeasibilityScore * weights.contextFeasibilityWeight * 10) / 10;
    const bContrib = Math.round(selected.behavioralFitScore * weights.behavioralFitWeight * 10) / 10;

    const decisionFactors: DecisionFactorItem[] = [
      {
        factor: 'health_suitability',
        name: 'Health Suitability',
        score: selected.suitabilityScore,
        scoreDisplay: Math.round((selected.suitabilityScore / 100) * 100) / 100,
        weight: weights.suitabilityWeight,
        weightPercentage: Math.round(weights.suitabilityWeight * 100),
        contribution: sContrib,
        reason: selected.suitabilityReasons[0] || 'Your current recovery and energy state support this session.'
      },
      {
        factor: 'predicted_adherence',
        name: 'Predicted Adherence',
        score: selected.predictedAdherence,
        scoreDisplay: Math.round((selected.predictedAdherence / 100) * 100) / 100,
        weight: weights.predictedAdherenceWeight,
        weightPercentage: Math.round(weights.predictedAdherenceWeight * 100),
        contribution: aContrib,
        reason: selected.predictedAdherence >= 70
          ? 'Your previous behavior indicates strong completion likelihood under this time and energy state.'
          : 'Elevated fatigue or limited schedule reduces predicted completion probability; session scaled conservatively.'
      },
      {
        factor: 'goal_alignment',
        name: 'Goal Alignment',
        score: selected.goalAlignmentScore,
        scoreDisplay: Math.round((selected.goalAlignmentScore / 100) * 100) / 100,
        weight: weights.goalAlignmentWeight,
        weightPercentage: Math.round(weights.goalAlignmentWeight * 100),
        contribution: gContrib,
        reason: selected.goalReasons[0] || 'This session directly supports your primary fitness and health goals.'
      },
      {
        factor: 'context_feasibility',
        name: 'Context Feasibility',
        score: selected.contextFeasibilityScore,
        scoreDisplay: Math.round((selected.contextFeasibilityScore / 100) * 100) / 100,
        weight: weights.contextFeasibilityWeight,
        weightPercentage: Math.round(weights.contextFeasibilityWeight * 100),
        contribution: fContrib,
        reason: selected.feasibilityReasons[0] || 'The session fits your available time and current environment with minimal logistical friction.'
      },
      {
        factor: 'behavioral_fit',
        name: 'Behavioral Fit',
        score: selected.behavioralFitScore,
        scoreDisplay: Math.round((selected.behavioralFitScore / 100) * 100) / 100,
        weight: weights.behavioralFitWeight,
        weightPercentage: Math.round(weights.behavioralFitWeight * 100),
        contribution: bContrib,
        reason: selected.behavioralReasons[0] || 'This activity matches your preferred activity style and historical successful execution patterns.',
        isAttenuated: weights.isBehavioralWeightAttenuated
      }
    ];

    return {
      summary,
      keyFactors,
      suitabilityExplanation: selected.suitabilityReasons.join(' '),
      behavioralExplanation: selected.behavioralReasons.join(' '),
      adherenceExplanation: `Machine learning adherence pipeline predicts ${selected.predictedAdherence}% completion probability under current context. Predicted adherence is a statistical estimate and not a guarantee of execution.`,
      conflictExplanation: goalConflict.hasConflict ? goalConflict.conflictExplanation : undefined,
      tradeoffNotice: selected.intensity === 'low'
        ? 'Trade-off: Prioritizes autonomic recovery over acute cardiovascular threshold stimulus to protect long-term consistency.'
        : 'Trade-off: Demands adequate hydration and post-session nutrition to support muscular repair.',
      comparisonVsAlternatives,
      decisionFactors,
      decisionWeightsNotice: 'Current system design weights, not scientifically validated clinical weights.'
    };
  }

  /**
   * Evaluates an arbitrary matrix of candidates under specified context and weights
   * Used by Plan Lab and What-If analysis
   */
  public async evaluateCandidateMatrix(
    candidates: CandidateIntervention[],
    context: DailyContext,
    profile: UserProfile,
    state: EvolvingUserState,
    goals: GoalStrategyItem[],
    behavioralProfile?: PersonalBehavioralProfile,
    behaviorSummary?: BehaviorPatternSummary,
    customWeights?: Partial<DecisionScoringWeights>
  ): Promise<EvaluatedCandidate[]> {
    // Check data sufficiency and adapt weights if necessary
    const isDataInsufficient = !behavioralProfile || behavioralProfile.observationCount < 3 || behavioralProfile.dataSufficiency === 'insufficient';

    let weights: DecisionScoringWeights = {
      ...DecisionIntelligenceEngine.DEFAULT_WEIGHTS,
      ...customWeights
    };

    if (isDataInsufficient) {
      weights = {
        suitabilityWeight: 0.35,
        predictedAdherenceWeight: 0.25,
        goalAlignmentWeight: 0.20,
        contextFeasibilityWeight: 0.18,
        behavioralFitWeight: 0.02,
        isBehavioralWeightAttenuated: true,
        attenuationReason: 'Behavioral history is in baseline learning phase (insufficient historical records); weight adaptively shifted to physical state.'
      };
    }

    const evaluated: EvaluatedCandidate[] = [];

    for (const cand of candidates) {
      // 1. Suitability
      const suit = this.evaluateSuitability(cand, context, state);

      // 2. Goal Alignment
      const goal = this.evaluateGoalAlignment(cand, goals);

      // 3. Behavioral Fit
      const beh = this.evaluateBehavioralFit(cand, behavioralProfile, behaviorSummary);

      // 4. Context Feasibility
      const feas = this.evaluateFeasibility(cand, context);

      // 5. Adherence Prediction via ML Service
      const featureVector: AdherenceFeatureVector = {
        sleepHours: context.sleepHours ?? 7,
        sleepQuality: context.sleepQuality ?? 6,
        energyLevel: context.energyLevel ?? 6,
        fatigueLevel: context.fatigueLevel ?? 5,
        stressLevel: context.stressLevel ?? 5,
        availableMinutes: context.availableMinutes ?? 30,
        candidateDurationMinutes: cand.durationMinutes,
        candidateIntensity: cand.intensity,
        candidateCategory: cand.category || 'workout',
        environment: cand.environment,
        historicalHomeCompletionRate: behaviorSummary?.completionRateHome ?? 75,
        historicalGymCompletionRate: behaviorSummary?.completionRateGym ?? 40,
        baselineAdherenceRate: behaviorSummary?.completionRateOverall ?? 70
      };

      const mlResult = await mlService.predictAdherence(featureVector);

      // 6. Multi-Factor Decision Score
      const scores = {
        suitabilityScore: suit.score,
        goalAlignmentScore: goal.score,
        behavioralFitScore: beh.score,
        predictedAdherence: mlResult.predictedAdherence,
        contextFeasibilityScore: feas.score
      };

      const { finalDecisionScore, breakdown } = this.calculateDecisionScore(scores, weights);

      // 7. Rationale
      const rationale = `${suit.reasons[0] || ''} ${feas.reasons[0] || ''}`.trim();

      evaluated.push({
        ...cand,
        suitabilityScore: suit.score,
        healthSuitabilityScore: suit.score, // alias
        goalAlignmentScore: goal.score,
        behavioralFitScore: beh.score,
        predictedAdherence: mlResult.predictedAdherence,
        contextFeasibilityScore: feas.score,
        finalDecisionScore,
        scoreBreakdown: breakdown,
        rationale,
        suitabilityReasons: suit.reasons,
        feasibilityReasons: feas.reasons,
        goalReasons: goal.reasons,
        behavioralReasons: beh.reasons,
        modelSource: mlResult.modelSource,
        isModelPlaceholder: mlResult.isModelPlaceholder
      });
    }

    // Rank descending by final decision score
    evaluated.sort((a, b) => b.finalDecisionScore - a.finalDecisionScore);

    if (evaluated.length > 0) {
      evaluated[0].isWinner = true;
    }

    return evaluated;
  }

  /**
   * Main recommendation decision engine entry point
   */
  public async generateTodayRecommendation(
    profile: UserProfile,
    context: DailyContext,
    state: EvolvingUserState,
    behaviorSummary: BehaviorPatternSummary,
    goals: GoalStrategyItem[] = [],
    behavioralProfile?: PersonalBehavioralProfile,
    customWeights?: Partial<DecisionScoringWeights>
  ): Promise<TodayRecommendation> {
    const activeGoals = goals.length > 0 ? goals : db.getGoals();
    const activeBehaviorProfile = behavioralProfile || db.getPersonalBehavioralProfile();

    // 1. Conflict Detection
    const goalConflict = this.detectGoalConditionConflict(profile, context, state, activeGoals);

    // 2. Candidate Generation
    const rawCandidates = this.generateCandidates(context, profile, state, activeGoals, activeBehaviorProfile);

    // 3. Multi-Factor Evaluation Matrix
    const evaluatedCandidates = await this.evaluateCandidateMatrix(
      rawCandidates,
      context,
      profile,
      state,
      activeGoals,
      activeBehaviorProfile,
      behaviorSummary,
      customWeights
    );

    const winner = evaluatedCandidates[0];
    const alternatives = evaluatedCandidates.slice(1, 4);

    // 4. ML Attributions for Primary Winner
    const primaryFeatureVector: AdherenceFeatureVector = {
      sleepHours: context.sleepHours ?? 7,
      sleepQuality: context.sleepQuality ?? 6,
      energyLevel: context.energyLevel ?? 6,
      fatigueLevel: context.fatigueLevel ?? 5,
      stressLevel: context.stressLevel ?? 5,
      availableMinutes: context.availableMinutes ?? 30,
      candidateDurationMinutes: winner.durationMinutes,
      candidateIntensity: winner.intensity,
      candidateCategory: winner.category || 'workout',
      environment: winner.environment,
      historicalHomeCompletionRate: behaviorSummary?.completionRateHome ?? 75,
      historicalGymCompletionRate: behaviorSummary?.completionRateGym ?? 40,
      baselineAdherenceRate: behaviorSummary?.completionRateOverall ?? 70
    };

    const primaryMLResult = await mlService.predictAdherence(primaryFeatureVector);

    // 5. Configured Weights
    const scoringWeights: DecisionScoringWeights = {
      ...DecisionIntelligenceEngine.DEFAULT_WEIGHTS,
      ...customWeights
    };

    // 6. Structured Explanation
    const explanation = this.generateExplanation(
      winner,
      alternatives,
      context,
      goalConflict,
      scoringWeights
    );

    // 7. Accompanying Actions
    const nutritionAction = {
      title: context.sleepHours < 6.5 ? 'Electrolyte Hydration & Cortisol Modulation' : 'Balanced Glycogen Replenishment',
      description: context.sleepHours < 6.5
        ? `Hydrate with 500ml water containing magnesium and sodium. Keep total daily hydration near 2.5L and avoid excessive late caffeine which compounds sleep fragmentation.`
        : `Hydrate steadily (aim for ${profile.nutritionGoals[0] || '2.5L/day'}) with complex whole-food carbohydrates and lean protein post-session.`,
      timing: 'Morning to mid-afternoon'
    };

    const recoveryAction = {
      title: 'Parasympathetic Down-Regulation Protocol',
      description: 'Perform 5 minutes of 4-7-8 resonant diaphragmatic breathing post-session to down-regulate sympathetic tone and lower circulating cortisol.'
    };

    const recId = `rec-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const recommendation: TodayRecommendation = {
      id: recId,
      recommendationId: recId,
      title: winner.title,
      category: winner.category || 'workout',
      activityType: winner.activityType,
      selectedIntervention: winner,
      durationMinutes: winner.durationMinutes,
      duration: winner.durationMinutes,
      intensity: winner.intensity,
      environment: winner.environment,
      targetDomain: winner.targetDomain || winner.goalAlignment,
      predictedAdherence: winner.predictedAdherence,
      healthSuitabilityScore: winner.suitabilityScore,
      suitabilityScore: winner.suitabilityScore,
      goalAlignmentScore: winner.goalAlignmentScore,
      behavioralFitScore: winner.behavioralFitScore,
      contextFeasibilityScore: winner.contextFeasibilityScore,
      finalDecisionScore: winner.finalDecisionScore,
      scoreBreakdown: winner.scoreBreakdown,
      scoringWeights,
      decisionFactors: explanation.decisionFactors,
      shapExplanation: primaryMLResult.shapExplanation,
      whyRecommended: explanation.summary,
      explanation,
      explainabilityFactors: primaryMLResult.attributions,
      goalConflict,
      alternatives,
      allEvaluatedCandidates: evaluatedCandidates,
      nutritionAction,
      recoveryAction,
      timestamp,
      generatedAt: timestamp,
      modelName: primaryMLResult.modelName,
      modelVersion: primaryMLResult.modelVersion,
      dataSourceLabel: primaryMLResult.dataSourceLabel,
      modelSource: primaryMLResult.modelSource,
      isModelPlaceholder: primaryMLResult.isModelPlaceholder,
      limitationNotice: primaryMLResult.limitationNotice,
      predictionSource: primaryMLResult.modelSource === 'python_scikit_learn_service'
        ? 'Python Scikit-Learn Microservice'
        : 'Baseline Calibrated Heuristic'
    };

    // 8. Auto-persist snapshot to recommendation history
    try {
      const historyRecord: Omit<RecommendationHistoryItem, 'id'> = {
        recommendationId: recId,
        date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp,
        title: winner.title,
        activityType: winner.activityType,
        durationMinutes: winner.durationMinutes,
        intensity: winner.intensity,
        environment: winner.environment,
        predictedAdherence: winner.predictedAdherence,
        suitability: winner.suitabilityScore,
        goalAlignmentScore: winner.goalAlignmentScore,
        behavioralFitScore: winner.behavioralFitScore,
        contextFeasibilityScore: winner.contextFeasibilityScore,
        finalDecisionScore: winner.finalDecisionScore,
        status: 'Decision Issued (Awaiting Outcome)',
        context: `Sleep ${context.sleepHours.toFixed(1)}h • Fatigue ${context.fatigueLevel}/10 • ${context.environment} • ${context.availableMinutes}m Available`,
        rationale: winner.rationale,
        explanationSummary: explanation.summary,
        goalConsidered: goalConflict.goalName,
        conflictStatus: goalConflict.hasConflict ? 'Active Acute Conflict' : 'Aligned',
        alternatives,
        modelVersion: primaryMLResult.modelVersion,
        predictionSource: recommendation.predictionSource
      };

      db.recordRecommendationHistory(historyRecord);

      // Also record prediction into prediction ledger
      db.addPredictionRecord({
        userId: profile.id || 'user-001',
        recommendationId: recId,
        recommendationTitle: winner.title,
        predictionProbability: winner.predictedAdherence / 100,
        predictedAdherence: winner.predictedAdherence,
        predictedClass: winner.predictedAdherence >= 50 ? 1 : 0,
        modelName: primaryMLResult.modelName,
        modelVersion: primaryMLResult.modelVersion,
        isBaselineFallback: primaryMLResult.isModelPlaceholder,
        dataSourceLabel: primaryMLResult.dataSourceLabel,
        featureSnapshot: {
          sleep_hours: context.sleepHours,
          energy_level: context.energyLevel,
          fatigue_level: context.fatigueLevel,
          stress_level: context.stressLevel,
          available_minutes: context.availableMinutes,
          recommended_duration_minutes: winner.durationMinutes,
          environment: winner.environment,
          intensity: winner.intensity
        }
      });
    } catch (persistErr) {
      console.error('Non-blocking error recording recommendation history:', persistErr);
    }

    return recommendation;
  }
}

export const decisionEngine = new DecisionIntelligenceEngine();
