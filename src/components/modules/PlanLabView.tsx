import React, { useState, useMemo } from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import { EvaluatedCandidate, DecisionScoringWeights } from '../../types/index.js';
import {
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  Home,
  Dumbbell,
  ArrowRight,
  Sliders,
  Scale,
  ShieldCheck,
  Zap,
  ChevronDown,
  RotateCcw
} from 'lucide-react';

const DEFAULT_WEIGHTS: DecisionScoringWeights = {
  suitabilityWeight: 0.30,
  predictedAdherenceWeight: 0.25,
  goalAlignmentWeight: 0.20,
  contextFeasibilityWeight: 0.15,
  behavioralFitWeight: 0.10
};

export const PlanLabView: React.FC = () => {
  const { recommendation, context, evolvingState, setActiveModule } = useHealthPilot();

  const [weights, setWeights] = useState<DecisionScoringWeights>(
    recommendation?.scoringWeights || DEFAULT_WEIGHTS
  );
  const [showAdvancedWeights, setShowAdvancedWeights] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const baseCandidates: EvaluatedCandidate[] = useMemo(() => {
    if (recommendation?.allEvaluatedCandidates && recommendation.allEvaluatedCandidates.length > 0) {
      return recommendation.allEvaluatedCandidates;
    }

    if (!recommendation) return [];

    const winner: any = {
      id: recommendation.id,
      activityType: 'Mobility & Conditioning',
      title: recommendation.title,
      category: recommendation.category,
      durationMinutes: recommendation.durationMinutes,
      intensity: recommendation.intensity,
      environment: recommendation.environment as any,
      requiredEquipment: ['Yoga mat'],
      goalAlignment: recommendation.targetDomain,
      recoveryDemand: recommendation.intensity === 'low' ? 'low' : 'moderate',
      description: recommendation.whyRecommended,
      targetDomain: recommendation.targetDomain,
      suitabilityScore: 92,
      healthSuitabilityScore: 92,
      goalAlignmentScore: 88,
      behavioralFitScore: 85,
      predictedAdherence: recommendation.predictedAdherence,
      contextFeasibilityScore: 95,
      finalDecisionScore: 89.5,
      rationale: recommendation.whyRecommended,
      tradeoff: 'Prioritizes immediate physical recovery and habit preservation over high cardiovascular strain.',
      isWinner: true
    };

    const alts: any[] = (recommendation.alternatives || []).map((alt, idx) => ({
      id: alt.id || `alt-${idx}`,
      activityType: alt.activityType || 'Alternative Workout',
      title: alt.title,
      category: alt.category || 'workout',
      durationMinutes: alt.durationMinutes,
      intensity: alt.intensity,
      environment: alt.environment as any,
      requiredEquipment: alt.requiredEquipment || ['Dumbbells'],
      goalAlignment: alt.goalAlignment || 'Primary Fitness Goal',
      recoveryDemand: alt.intensity === 'high' ? 'high' : 'moderate',
      description: alt.rationale,
      targetDomain: 'Primary Goal',
      suitabilityScore: 82 - idx * 6,
      healthSuitabilityScore: 82 - idx * 6,
      goalAlignmentScore: 92,
      behavioralFitScore: 74,
      predictedAdherence: Math.max(50, recommendation.predictedAdherence - (idx + 1) * 8),
      contextFeasibilityScore: 80 - idx * 10,
      finalDecisionScore: 82.0 - idx * 7,
      rationale: alt.rationale,
      tradeoff: idx === 0
        ? 'Delivers a stronger strength stimulus, but demands 15 more minutes and carries higher fatigue risk.'
        : 'Faster to complete, but provides less progressive overload for endurance building.',
      isWinner: false
    }));

    return [winner, ...alts] as EvaluatedCandidate[];
  }, [recommendation]);

  const resetWeights = () => setWeights(DEFAULT_WEIGHTS);

  return (
    <div className="space-y-8 max-w-5xl mx-auto transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Option Comparison</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Explore Your Options
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-normal max-w-2xl">
            See the different workout paths HealthPilot evaluated for today, and understand the trade-offs behind the recommended choice.
          </p>
        </div>

        <button
          onClick={() => setActiveModule('today')}
          className="px-4 py-2 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>Return to Today</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3 CANDIDATE OPTION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {baseCandidates.slice(0, 3).map((candidate, idx) => {
          const isWinner = candidate.isWinner || idx === 0;

          return (
            <div
              key={candidate.id || idx}
              className={`p-6 sm:p-7 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                isWinner
                  ? 'bg-[var(--surface)] border-2 border-[var(--primary)] shadow-md'
                  : 'bg-[var(--surface)] border border-[var(--border)] shadow-xs hover:border-[var(--primary)]/40'
              }`}
            >
              <div className="space-y-3">
                {/* Top Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      isWinner
                        ? 'bg-[var(--primary)] text-white shadow-xs'
                        : 'bg-[var(--surface-soft)] text-[var(--text-muted)] border border-[var(--border)]'
                    }`}
                  >
                    {isWinner ? 'Best Match' : `Option ${idx + 1}`}
                  </span>
                  <span className="text-xs font-semibold text-[var(--primary)]">
                    {candidate.predictedAdherence}% match
                  </span>
                </div>

                {/* Workout Title */}
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    {candidate.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
                    <span>{candidate.durationMinutes} min</span>
                    <span>•</span>
                    <span className="capitalize">{candidate.intensity}</span>
                    <span>•</span>
                    <span className="capitalize">{candidate.environment || 'Home'}</span>
                  </div>
                </div>

                {/* Plain Trade-Off */}
                <div className="p-3.5 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border)] text-xs text-[var(--text-secondary)] space-y-1">
                  <span className="font-bold text-[var(--text-primary)] block">
                    {isWinner ? 'Why this won today:' : 'Trade-off consideration:'}
                  </span>
                  <p className="leading-relaxed">
                    {(candidate as any).tradeoff || candidate.rationale || candidate.description}
                  </p>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="pt-3 border-t border-[var(--border)]">
                {isWinner ? (
                  <div className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Selected for Today</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedCandidateId(candidate.id);
                      setActiveModule('today');
                    }}
                    className="w-full py-2.5 rounded-2xl bg-[var(--surface-soft)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Choose This Instead</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADVANCED DETAILS COLLAPSIBLE */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 space-y-4 shadow-xs">
        <button
          onClick={() => setShowAdvancedWeights(!showAdvancedWeights)}
          className="w-full flex items-center justify-between text-left"
        >
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--primary)]" />
              <span>Advanced Decision Weights</span>
            </h4>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Customize how HealthPilot balances physiological suitability, goal alignment, and time feasibility
            </p>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${
              showAdvancedWeights ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showAdvancedWeights && (
          <div className="pt-4 border-t border-[var(--border)] space-y-5 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-primary)] font-medium">Recovery & Readiness</span>
                  <span className="font-bold text-[var(--primary)]">{Math.round(weights.suitabilityWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={50}
                  value={weights.suitabilityWeight * 100}
                  onChange={(e) => setWeights({ ...weights, suitabilityWeight: Number(e.target.value) / 100 })}
                  className="w-full accent-[var(--primary)]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-primary)] font-medium">Predicted Adherence</span>
                  <span className="font-bold text-[var(--primary)]">{Math.round(weights.predictedAdherenceWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={50}
                  value={weights.predictedAdherenceWeight * 100}
                  onChange={(e) => setWeights({ ...weights, predictedAdherenceWeight: Number(e.target.value) / 100 })}
                  className="w-full accent-[var(--primary)]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-primary)] font-medium">Long-Term Goal Progress</span>
                  <span className="font-bold text-[var(--primary)]">{Math.round(weights.goalAlignmentWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={50}
                  value={weights.goalAlignmentWeight * 100}
                  onChange={(e) => setWeights({ ...weights, goalAlignmentWeight: Number(e.target.value) / 100 })}
                  className="w-full accent-[var(--primary)]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={resetWeights}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Balanced Defaults</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
