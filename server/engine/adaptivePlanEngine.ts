import {
  AdaptivePlanDay,
  PlanAdaptationEvent,
  AdaptivePlanPayload,
  RecommendationOutcome,
  EvolvingUserState,
  UserProfile,
  PersonalBehavioralProfile,
  GoalStrategyItem
} from '../../src/types/index.js';

/**
 * HealthPilot AI Adaptive Plan Engine
 * Dedicated module for multi-day schedule adaptation and continuous empirical feedback loop.
 * 
 * Architectural Constraints:
 * - Separated from Decision Engine and ML Pipeline.
 * - Evidence-based thresholds (no over-adapting to a single isolated skip).
 * - Preserves long-term goals while adjusting immediate session volume and stimulus.
 * - Maintains auditable log of all adaptation events with transparent triggering evidence.
 * - Strictly no claims of reinforcement learning, autonomous intelligence, or medical adaptation.
 */
export class AdaptivePlanEngine {
  // PRISTINE RESEARCH BASELINE: Standard weekly training template
  private readonly BASELINE_PLAN: AdaptivePlanDay[] = [
    {
      id: 'base-day-1',
      dayOfWeek: 'Monday',
      dayName: 'Monday',
      date: '2026-09-07',
      title: '30-Min High-Intensity Threshold Intervals',
      plannedSession: '30-Min High-Intensity Threshold Intervals',
      category: 'workout',
      durationMinutes: 30,
      intensity: 'high',
      isAdaptiveAdapted: false,
      status: 'scheduled',
      originalTitle: '30-Min High-Intensity Threshold Intervals',
      originalDurationMinutes: 30,
      originalIntensity: 'high',
      originalCategory: 'workout'
    },
    {
      id: 'base-day-2',
      dayOfWeek: 'Tuesday',
      dayName: 'Tuesday',
      date: '2026-09-08',
      title: '35-Min Home Dumbbell Strength (Posterior Focus)',
      plannedSession: '35-Min Home Dumbbell Strength (Posterior Focus)',
      category: 'workout',
      durationMinutes: 35,
      intensity: 'moderate',
      isAdaptiveAdapted: false,
      status: 'scheduled',
      originalTitle: '35-Min Home Dumbbell Strength (Posterior Focus)',
      originalDurationMinutes: 35,
      originalIntensity: 'moderate',
      originalCategory: 'workout'
    },
    {
      id: 'base-day-3',
      dayOfWeek: 'Wednesday',
      dayName: 'Wednesday',
      date: '2026-09-09',
      title: '40-Min Aerobic Zone 2 Base Run',
      plannedSession: '40-Min Aerobic Zone 2 Base Run',
      category: 'workout',
      durationMinutes: 40,
      intensity: 'moderate',
      isAdaptiveAdapted: false,
      status: 'scheduled',
      originalTitle: '40-Min Aerobic Zone 2 Base Run',
      originalDurationMinutes: 40,
      originalIntensity: 'moderate',
      originalCategory: 'workout'
    },
    {
      id: 'base-day-4',
      dayOfWeek: 'Thursday',
      dayName: 'Thursday',
      date: '2026-09-10',
      title: '25-Min Active Rest & Parasympathetic Walk',
      plannedSession: '25-Min Active Rest & Parasympathetic Walk',
      category: 'active_rest',
      durationMinutes: 25,
      intensity: 'low',
      isAdaptiveAdapted: false,
      status: 'scheduled',
      originalTitle: '25-Min Active Rest & Parasympathetic Walk',
      originalDurationMinutes: 25,
      originalIntensity: 'low',
      originalCategory: 'active_rest'
    },
    {
      id: 'base-day-5',
      dayOfWeek: 'Friday',
      dayName: 'Friday',
      date: '2026-09-11',
      title: '30-Min Functional Kettlebell Circuit',
      plannedSession: '30-Min Functional Kettlebell Circuit',
      category: 'workout',
      durationMinutes: 30,
      intensity: 'moderate',
      isAdaptiveAdapted: false,
      status: 'scheduled',
      originalTitle: '30-Min Functional Kettlebell Circuit',
      originalDurationMinutes: 30,
      originalIntensity: 'moderate',
      originalCategory: 'workout'
    },
    {
      id: 'base-day-6',
      dayOfWeek: 'Saturday',
      dayName: 'Saturday',
      date: '2026-09-12',
      title: '45-Min Aerobic Base Run / Cross-Training',
      plannedSession: '45-Min Aerobic Base Run / Cross-Training',
      category: 'workout',
      durationMinutes: 45,
      intensity: 'moderate',
      isAdaptiveAdapted: false,
      status: 'scheduled',
      originalTitle: '45-Min Aerobic Base Run / Cross-Training',
      originalDurationMinutes: 45,
      originalIntensity: 'moderate',
      originalCategory: 'workout'
    },
    {
      id: 'base-day-7',
      dayOfWeek: 'Sunday',
      dayName: 'Sunday',
      date: '2026-09-13',
      title: '30-Min Deload & Deep Tissue Recovery Flow',
      plannedSession: '30-Min Deload & Deep Tissue Recovery Flow',
      category: 'recovery',
      durationMinutes: 30,
      intensity: 'low',
      isAdaptiveAdapted: false,
      status: 'scheduled',
      originalTitle: '30-Min Deload & Deep Tissue Recovery Flow',
      originalDurationMinutes: 30,
      originalIntensity: 'low',
      originalCategory: 'recovery'
    }
  ];

  // ACTIVE MUTABLE SCHEDULE STATE
  private currentPlan: AdaptivePlanDay[] = [];
  private adaptationEvents: PlanAdaptationEvent[] = [];
  private lastRebalancedAt: string = new Date().toISOString();

  constructor() {
    this.initDefaultPlan();
  }

  private initDefaultPlan() {
    // Clone baseline plan with initial Monday adaptation (seed demonstration state)
    this.currentPlan = this.BASELINE_PLAN.map(day => ({ ...day }));

    // Seed initial adaptation on Monday (acute fatigue/sleep deficit) and Friday (re-scheduled threshold work)
    this.currentPlan[0] = {
      ...this.currentPlan[0],
      title: '20-Min Restorative Spinal Mobility & Breathwork',
      plannedSession: '20-Min Restorative Spinal Mobility & Breathwork',
      category: 'recovery',
      durationMinutes: 20,
      intensity: 'low',
      isAdaptiveAdapted: true,
      adaptationReason: 'Adapted from 30m high-intensity intervals due to acute sleep deficit (5.8h) and high fatigue (7/10).',
      triggeringEvidence: 'Acute sleep deficit (5.8h < 6h threshold) & elevated fatigue (7/10). Recovery readiness estimated at 48%.',
      evidenceThresholdMet: true,
      goalPreservedTitle: 'Cardiovascular Aerobic Base (10K sub-50 min)',
      adaptationTimestamp: '2026-09-07T07:15:00.000Z',
      status: 'adapted'
    };

    this.currentPlan[1] = {
      ...this.currentPlan[1],
      durationMinutes: 25,
      title: '25-Min Home Dumbbell Strength (Posterior Focus)',
      plannedSession: '25-Min Home Dumbbell Strength (Posterior Focus)',
      status: 'scheduled'
    };

    this.currentPlan[2] = {
      ...this.currentPlan[2],
      durationMinutes: 35,
      title: '35-Min Aerobic Zone 2 Base Run',
      plannedSession: '35-Min Aerobic Zone 2 Base Run',
      status: 'scheduled'
    };

    this.currentPlan[4] = {
      ...this.currentPlan[4],
      title: 'Threshold Pace Intervals (4 x 4 min)',
      plannedSession: 'Threshold Pace Intervals (4 x 4 min)',
      durationMinutes: 35,
      intensity: 'high',
      isAdaptiveAdapted: true,
      adaptationReason: 'Shifted from Monday to allow full nervous system recovery buffer while preserving 10K threshold progress.',
      triggeringEvidence: 'Postponed Monday interval stimulus to Friday after recovery score rebounds above 70%.',
      evidenceThresholdMet: true,
      goalPreservedTitle: 'Cardiovascular Aerobic Base (10K sub-50 min)',
      adaptationTimestamp: '2026-09-07T07:15:00.000Z',
      status: 'adapted'
    };

    this.adaptationEvents = [
      {
        id: 'adapt-seed-1',
        timestamp: '2026-09-07T07:15:00.000Z',
        dayId: 'base-day-1',
        dayOfWeek: 'Monday',
        date: '2026-09-07',
        triggerType: 'fatigue_recovery',
        triggeringEvidence: 'Acute sleep deficit (5.8h < 6h threshold) & elevated systemic fatigue (7/10). Recovery readiness estimated at 48%.',
        originalSession: {
          title: '30-Min High-Intensity Threshold Intervals',
          durationMinutes: 30,
          intensity: 'high'
        },
        adaptedSession: {
          title: '20-Min Restorative Spinal Mobility & Breathwork',
          durationMinutes: 20,
          intensity: 'low'
        },
        goalPreserved: 'Cardiovascular Aerobic Base (10K sub-50 min) - Volume preserved through rescheduled session',
        status: 'active'
      },
      {
        id: 'adapt-seed-2',
        timestamp: '2026-09-07T07:15:00.000Z',
        dayId: 'base-day-5',
        dayOfWeek: 'Friday',
        date: '2026-09-11',
        triggerType: 'fatigue_recovery',
        triggeringEvidence: 'Preserving weekly high-intensity stimulus by shifting Monday intervals to Friday recovery window.',
        originalSession: {
          title: '30-Min Functional Kettlebell Circuit',
          durationMinutes: 30,
          intensity: 'moderate'
        },
        adaptedSession: {
          title: 'Threshold Pace Intervals (4 x 4 min)',
          durationMinutes: 35,
          intensity: 'high'
        },
        goalPreserved: 'Cardiovascular Aerobic Base (10K sub-50 min)',
        status: 'active'
      }
    ];
  }

  /**
   * Evaluates outcomes, evolving state, and behavioral profile to adapt future schedule days.
   * STRICTLY ENFORCES EVIDENCE THRESHOLDS:
   * 1. Insufficient data (<3 outcomes): No speculative adaptations.
   * 2. Isolated skip: Updates adherence rate, but does NOT trigger massive schedule overhaul.
   * 3. Repeated barrier (>=2 skips with same barrier): Triggers focused evidence-based adaptation.
   * 4. Acute fatigue/sleep debt: Down-regulates immediate session and postpones intense stimulus.
   * 5. Preserves primary goals across all adaptations.
   */
  public evaluateAndAdaptPlan(
    state: EvolvingUserState,
    outcomes: RecommendationOutcome[],
    profile: UserProfile,
    behavioralProfile: PersonalBehavioralProfile,
    goals: GoalStrategyItem[]
  ): {
    plan: AdaptivePlanDay[];
    events: PlanAdaptationEvent[];
    changesMade: boolean;
    reasons: string[];
  } {
    const changes: string[] = [];
    let modified = false;

    // Rule 1: Insufficient History Guardrail
    if (outcomes.length < 3) {
      return {
        plan: [...this.currentPlan],
        events: [...this.adaptationEvents],
        changesMade: false,
        reasons: ['Baseline data collection in progress (insufficient history). Preserving standard plan.']
      };
    }

    // Inspect recent outcomes (last 5)
    const recentOutcomes = outcomes.slice(0, 5);
    const recentSkips = recentOutcomes.filter(o => o.outcomeStatus === 'skipped');
    const recentPartials = recentOutcomes.filter(o => o.outcomeStatus === 'partially_completed');
    const recentCompleted = recentOutcomes.filter(o => o.outcomeStatus === 'completed');

    // Check barrier counts in recent non-completions
    const timeSkipsCount = [...recentSkips, ...recentPartials].filter(o => o.reasonForSkipOrPartial === 'no_time').length;
    const fatigueSkipsCount = [...recentSkips, ...recentPartials].filter(o => o.reasonForSkipOrPartial === 'too_tired').length;
    const gymSkipsCount = recentSkips.filter(o => (o.contextSnapshot?.environment || '').toLowerCase() === 'gym' || o.reasonForSkipOrPartial === 'schedule_changed').length;

    // Primary Goal Reference (for goal preservation)
    const primaryGoal = goals.find(g => g.priority === 'primary') || goals[0] || {
      title: 'Cardiovascular Aerobic Base (10K sub-50 min)'
    };

    // Rule 2 & 3: Acute Fatigue & Sleep Deficit Handling
    const isFatiguedOrSleepDeprived = (state.recoveryReadiness < 50) || 
      ((state.fatigueLevel ?? 5) >= 7) || 
      (fatigueSkipsCount >= 2);

    if (isFatiguedOrSleepDeprived) {
      // Find the next scheduled high or moderate intensity day
      const targetDayIdx = this.currentPlan.findIndex(d => 
        (d.status === 'scheduled' || d.status === 'adapted') && 
        d.intensity === 'high' && 
        d.category === 'workout'
      );

      if (targetDayIdx !== -1 && targetDayIdx <= 2) {
        const targetDay = this.currentPlan[targetDayIdx];
        if (targetDay.category !== 'recovery') {
          // Adapt target day to recovery mobility
          const original = {
            title: targetDay.originalTitle || targetDay.title,
            durationMinutes: targetDay.originalDurationMinutes || targetDay.durationMinutes,
            intensity: targetDay.originalIntensity || targetDay.intensity
          };

          const adapted = {
            title: '20-Min Restorative Spinal Mobility & Breathwork',
            durationMinutes: 20,
            intensity: 'low' as const
          };

          this.currentPlan[targetDayIdx] = {
            ...targetDay,
            title: adapted.title,
            plannedSession: adapted.title,
            category: 'recovery',
            durationMinutes: adapted.durationMinutes,
            intensity: adapted.intensity,
            isAdaptiveAdapted: true,
            adaptationReason: `Pivoted from ${original.title} due to acute fatigue/sleep deficit (${state.recoveryReadiness}% recovery score).`,
            triggeringEvidence: `Systemic fatigue elevated (${state.fatigueLevel ?? 7}/10) and recovery readiness is ${state.recoveryReadiness}%.`,
            evidenceThresholdMet: true,
            goalPreservedTitle: primaryGoal.title,
            adaptationTimestamp: new Date().toISOString(),
            status: 'adapted'
          };

          // Find later day in the week to absorb the deferred session (e.g. Day 4 or 5)
          const laterDayIdx = this.currentPlan.findIndex((d, idx) => 
            idx > targetDayIdx && 
            (d.status === 'scheduled') && 
            d.category !== 'recovery'
          );

          if (laterDayIdx !== -1) {
            this.currentPlan[laterDayIdx] = {
              ...this.currentPlan[laterDayIdx],
              title: original.title,
              plannedSession: original.title,
              durationMinutes: original.durationMinutes,
              intensity: 'high',
              isAdaptiveAdapted: true,
              adaptationReason: `Rescheduled from ${targetDay.dayName} to ensure ${primaryGoal.title} stimulus is not lost.`,
              triggeringEvidence: `Postponed high-intensity stimulus to later recovery window (Day ${laterDayIdx + 1}).`,
              evidenceThresholdMet: true,
              goalPreservedTitle: primaryGoal.title,
              adaptationTimestamp: new Date().toISOString(),
              status: 'adapted'
            };
          }

          const event: PlanAdaptationEvent = {
            id: `adapt-${Date.now()}-1`,
            timestamp: new Date().toISOString(),
            dayId: targetDay.id || `day-${targetDayIdx}`,
            dayOfWeek: targetDay.dayOfWeek,
            date: targetDay.date,
            triggerType: 'fatigue_recovery',
            triggeringEvidence: `High systemic fatigue (${state.fatigueLevel ?? 7}/10) & recovery score ${state.recoveryReadiness}%.`,
            originalSession: original,
            adaptedSession: adapted,
            goalPreserved: `${primaryGoal.title} - Session shifted to post-recovery window`,
            status: 'active'
          };

          this.adaptationEvents.unshift(event);
          changes.push(`Day ${targetDay.dayName}: Down-regulated to 20m restorative mobility due to fatigue.`);
          modified = true;
        }
      }
    }

    // Rule 4: Time Compression (< 25 min or >= 2 'no_time' skips)
    if (timeSkipsCount >= 2 || (state.availableMinutes && state.availableMinutes <= 25)) {
      this.currentPlan = this.currentPlan.map(day => {
        if (day.status === 'scheduled' && day.durationMinutes > 25 && day.category === 'workout') {
          const original = {
            title: day.originalTitle || day.title,
            durationMinutes: day.originalDurationMinutes || day.durationMinutes,
            intensity: day.originalIntensity || day.intensity
          };

          const adaptedDuration = 25;
          const adaptedTitle = `25-Min High-Yield ${day.title.replace(/^\d+-Min\s*/i, '')}`;

          const event: PlanAdaptationEvent = {
            id: `adapt-${Date.now()}-${day.id || day.dayOfWeek}`,
            timestamp: new Date().toISOString(),
            dayId: day.id || day.dayOfWeek,
            dayOfWeek: day.dayOfWeek,
            date: day.date,
            triggerType: 'time_compression',
            triggeringEvidence: `Repeated time constraints reported (${timeSkipsCount} recent sessions affected). Truncating duration from ${original.durationMinutes}m to ${adaptedDuration}m.`,
            originalSession: original,
            adaptedSession: {
              title: adaptedTitle,
              durationMinutes: adaptedDuration,
              intensity: original.intensity
            },
            goalPreserved: `${primaryGoal.title} - Maintaining density with shorter rest periods`,
            status: 'active'
          };

          this.adaptationEvents.unshift(event);
          changes.push(`Day ${day.dayName}: Scaled duration from ${original.durationMinutes}m to 25m due to schedule constraints.`);
          modified = true;

          return {
            ...day,
            title: adaptedTitle,
            plannedSession: adaptedTitle,
            durationMinutes: adaptedDuration,
            isAdaptiveAdapted: true,
            adaptationReason: `Scaled down from ${original.durationMinutes}m to 25m to fit recurring schedule compression while preserving target workout.`,
            triggeringEvidence: `Evidence: ${timeSkipsCount} recent sessions reported 'no_time' barrier.`,
            evidenceThresholdMet: true,
            goalPreservedTitle: primaryGoal.title,
            adaptationTimestamp: new Date().toISOString(),
            status: 'adapted'
          };
        }
        return day;
      });
    }

    // Rule 5: Environment Friction (Gym skips >= 2)
    if (gymSkipsCount >= 2) {
      this.currentPlan = this.currentPlan.map(day => {
        if (day.status === 'scheduled' && day.title.toLowerCase().includes('gym')) {
          const original = {
            title: day.originalTitle || day.title,
            durationMinutes: day.originalDurationMinutes || day.durationMinutes,
            intensity: day.originalIntensity || day.intensity
          };

          const adaptedTitle = day.title.replace(/gym/i, 'Home Dumbbell');

          const event: PlanAdaptationEvent = {
            id: `adapt-${Date.now()}-gym-${day.dayOfWeek}`,
            timestamp: new Date().toISOString(),
            dayId: day.id || day.dayOfWeek,
            dayOfWeek: day.dayOfWeek,
            date: day.date,
            triggerType: 'environment_friction',
            triggeringEvidence: `Gym environment associated with repeated skips (${gymSkipsCount} observations). Swapping to home functional setup.`,
            originalSession: original,
            adaptedSession: {
              title: adaptedTitle,
              durationMinutes: original.durationMinutes,
              intensity: original.intensity
            },
            goalPreserved: 'Posterior Chain & Core Stability',
            status: 'active'
          };

          this.adaptationEvents.unshift(event);
          changes.push(`Day ${day.dayName}: Converted Gym session to Home Dumbbell equivalent.`);
          modified = true;

          return {
            ...day,
            title: adaptedTitle,
            plannedSession: adaptedTitle,
            isAdaptiveAdapted: true,
            adaptationReason: 'Converted from Gym facility to Home Dumbbell protocol to eliminate commute friction.',
            triggeringEvidence: `Gym barrier threshold met (${gymSkipsCount} non-completions).`,
            evidenceThresholdMet: true,
            goalPreservedTitle: 'Posterior Chain & Core Stability',
            adaptationTimestamp: new Date().toISOString(),
            status: 'adapted'
          };
        }
        return day;
      });
    }

    // Rule 6: Strong Momentum Rebound
    if (state.behavioralMomentum >= 75 && recentCompleted.length >= 3 && !isFatiguedOrSleepDeprived) {
      // Rebound: check if any previously down-regulated day can safely return to baseline progression
      const adaptedRecoveryDay = this.currentPlan.find(d => 
        d.status === 'adapted' && 
        d.category === 'recovery' && 
        d.originalIntensity === 'high'
      );

      if (adaptedRecoveryDay && state.recoveryReadiness >= 75) {
        // High recovery restored! Can restore progression
        const idx = this.currentPlan.indexOf(adaptedRecoveryDay);
        if (idx !== -1) {
          this.currentPlan[idx] = {
            ...adaptedRecoveryDay,
            title: adaptedRecoveryDay.originalTitle || '30-Min High-Intensity Threshold Intervals',
            plannedSession: adaptedRecoveryDay.originalTitle || '30-Min High-Intensity Threshold Intervals',
            category: 'workout',
            durationMinutes: adaptedRecoveryDay.originalDurationMinutes || 30,
            intensity: 'high',
            isAdaptiveAdapted: false,
            adaptationReason: undefined,
            triggeringEvidence: 'Restored to baseline progression after recovery readiness rebounded above 75% and momentum reached Strong.',
            status: 'scheduled'
          };

          this.adaptationEvents.unshift({
            id: `adapt-rebound-${Date.now()}`,
            timestamp: new Date().toISOString(),
            dayId: adaptedRecoveryDay.id || `day-${idx}`,
            dayOfWeek: adaptedRecoveryDay.dayOfWeek,
            date: adaptedRecoveryDay.date,
            triggerType: 'adherence_rebound',
            triggeringEvidence: `Recovery readiness rebounded to ${state.recoveryReadiness}% with strong momentum (${state.behavioralMomentum}/100).`,
            originalSession: {
              title: adaptedRecoveryDay.title,
              durationMinutes: adaptedRecoveryDay.durationMinutes,
              intensity: adaptedRecoveryDay.intensity
            },
            adaptedSession: {
              title: adaptedRecoveryDay.originalTitle || '30-Min High-Intensity Threshold Intervals',
              durationMinutes: adaptedRecoveryDay.originalDurationMinutes || 30,
              intensity: 'high'
            },
            goalPreserved: primaryGoal.title,
            status: 'active'
          });

          changes.push(`Day ${adaptedRecoveryDay.dayName}: Restored high-intensity threshold progression following recovery rebound.`);
          modified = true;
        }
      }
    }

    this.lastRebalancedAt = new Date().toISOString();

    return {
      plan: [...this.currentPlan],
      events: [...this.adaptationEvents],
      changesMade: modified,
      reasons: changes.length > 0 ? changes : ['All scheduled sessions align with current evolving readiness and evidence thresholds.']
    };
  }

  /**
   * Updates matching day when an outcome is logged
   */
  public recordOutcomeInPlan(outcome: RecommendationOutcome): void {
    const outcomeDate = outcome.timestamp.split('T')[0];
    const matchIdx = this.currentPlan.findIndex(d => d.date === outcomeDate);

    if (matchIdx !== -1) {
      const current = this.currentPlan[matchIdx];
      let newStatus: AdaptivePlanDay['status'] = 'completed';
      if (outcome.outcomeStatus === 'skipped') newStatus = 'skipped';
      else if (outcome.outcomeStatus === 'partially_completed') newStatus = 'modified';

      this.currentPlan[matchIdx] = {
        ...current,
        status: newStatus,
        durationMinutes: outcome.actualDurationMinutes || current.durationMinutes
      };
    }
  }

  /**
   * Returns complete payload with multi-day plan, baseline comparison, and audit events
   */
  public getPlanPayload(
    state: EvolvingUserState,
    outcomes: RecommendationOutcome[]
  ): AdaptivePlanPayload {
    const totalOutcomes = outcomes.length;
    let dataSufficiency: 'insufficient' | 'preliminary' | 'moderate' | 'high' = 'insufficient';
    let dataSufficiencyNotice = 'Gathering baseline outcomes (minimum 3 required to establish evidence-based adaptation thresholds).';

    if (totalOutcomes >= 14) {
      dataSufficiency = 'high';
      dataSufficiencyNotice = `High statistical confidence based on ${totalOutcomes} recorded outcomes.`;
    } else if (totalOutcomes >= 7) {
      dataSufficiency = 'moderate';
      dataSufficiencyNotice = `Moderate statistical confidence based on ${totalOutcomes} recorded outcomes.`;
    } else if (totalOutcomes >= 3) {
      dataSufficiency = 'preliminary';
      dataSufficiencyNotice = `Preliminary evidence based on ${totalOutcomes} recorded outcomes. Adaptations require repeated barrier confirmation.`;
    }

    const momentumScore = state.behavioralMomentum ?? 65;
    let momentumStatus: 'Strong' | 'Moderate' | 'Low' = 'Moderate';
    if (momentumScore >= 75) momentumStatus = 'Strong';
    else if (momentumScore < 45) momentumStatus = 'Low';

    const activeAdaptationsCount = this.currentPlan.filter(d => d.isAdaptiveAdapted).length;

    return {
      days: [...this.currentPlan],
      baselineDays: [...this.BASELINE_PLAN],
      adaptationEvents: [...this.adaptationEvents],
      lastRebalancedAt: this.lastRebalancedAt,
      momentumStatus,
      momentumScore,
      activeAdaptationsCount,
      dataSufficiency,
      dataSufficiencyNotice
    };
  }

  public getDays(): AdaptivePlanDay[] {
    return [...this.currentPlan];
  }

  public getBaselineDays(): AdaptivePlanDay[] {
    return [...this.BASELINE_PLAN];
  }

  public getAdaptationEvents(): PlanAdaptationEvent[] {
    return [...this.adaptationEvents];
  }

  public resetToBaseline(): AdaptivePlanPayload {
    this.initDefaultPlan();
    this.lastRebalancedAt = new Date().toISOString();

    this.adaptationEvents.unshift({
      id: `adapt-reset-${Date.now()}`,
      timestamp: new Date().toISOString(),
      dayId: 'all',
      dayOfWeek: 'All Days',
      date: new Date().toISOString().split('T')[0],
      triggerType: 'manual_rebalance',
      triggeringEvidence: 'User triggered reset to baseline research schedule.',
      originalSession: {
        title: 'Customized Adaptive Schedule',
        durationMinutes: 30,
        intensity: 'moderate'
      },
      adaptedSession: {
        title: 'Standard Research Baseline Template',
        durationMinutes: 30,
        intensity: 'moderate'
      },
      goalPreserved: 'All primary and secondary fitness goals',
      status: 'active'
    });

    return {
      days: [...this.currentPlan],
      baselineDays: [...this.BASELINE_PLAN],
      adaptationEvents: [...this.adaptationEvents],
      lastRebalancedAt: this.lastRebalancedAt,
      momentumStatus: 'Moderate',
      momentumScore: 65,
      activeAdaptationsCount: this.currentPlan.filter(d => d.isAdaptiveAdapted).length,
      dataSufficiency: 'high',
      dataSufficiencyNotice: 'Reset to research baseline schedule.'
    };
  }
}

export const adaptivePlanEngine = new AdaptivePlanEngine();
