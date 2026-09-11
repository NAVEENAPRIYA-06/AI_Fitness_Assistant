import React, { useState, useMemo } from 'react';
import { useHealthPilot } from '../../context/HealthPilotContext.js';
import { MetricBadge } from '../common/MetricBadge.js';
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
  Activity,
  AlertTriangle,
  RotateCcw,
  Maximize2
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

  // Custom weights for interactive simulation
  const [weights, setWeights] = useState<DecisionScoringWeights>(
    recommendation?.scoringWeights || DEFAULT_WEIGHTS
  );

  // Comparison candidates selection
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [candidateAId, setCandidateAId] = useState<string>('');
  const [candidateBId, setCandidateBId] = useState<string>('');

  // Fallback evaluated candidates if not provided
  const baseCandidates: EvaluatedCandidate[] = useMemo(() => {
    if (recommendation?.allEvaluatedCandidates && recommendation.allEvaluatedCandidates.length > 0) {
      return recommendation.allEvaluatedCandidates;
    }

    if (!recommendation) return [];

    // Construct winner as an EvaluatedCandidate
    const winner: EvaluatedCandidate = {
      id: recommendation.id,
      activityType: 'Mobility & Stretching',
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
      suitabilityScore: recommendation.suitabilityScore ?? recommendation.healthSuitabilityScore,
      healthSuitabilityScore: recommendation.healthSuitabilityScore,
      goalAlignmentScore: recommendation.goalAlignmentScore || 85,
      goalReasons: ['Maintains physical habit streak while protecting cardiac load'],
      behavioralFitScore: recommendation.behavioralFitScore || 78,
      behavioralReasons: ['High historical consistency for 20m restorative sessions'],
      predictedAdherence: recommendation.predictedAdherence,
      contextFeasibilityScore: recommendation.contextFeasibilityScore || 95,
      feasibilityReasons: ['Fits comfortably in current 30m window at home'],
      finalDecisionScore: recommendation.finalDecisionScore || 89.2,
      scoreBreakdown: recommendation.scoreBreakdown || {
        suitabilityContribution: 28.2,
        goalAlignmentContribution: 17.0,
        behavioralFitContribution: 7.8,
        predictedAdherenceContribution: 22.0,
        contextFeasibilityContribution: 14.2
      },
      rationale: recommendation.whyRecommended,
      suitabilityReasons: ['Restorative recovery response to low sleep & elevated fatigue'],
      isWinner: true
    };

    const alts: EvaluatedCandidate[] = recommendation.alternatives.map((alt, idx) => ({
      ...alt,
      id: alt.id,
      activityType: alt.activityType || 'Active Recovery',
      title: alt.title,
      category: alt.category || 'recovery',
      durationMinutes: alt.durationMinutes,
      intensity: alt.intensity,
      environment: alt.environment as any,
      requiredEquipment: alt.requiredEquipment || ['Yoga mat'],
      goalAlignment: alt.goalAlignment || 'Cardiovascular Conditioning',
      recoveryDemand: alt.intensity === 'high' ? 'high' : 'moderate',
      description: alt.rationale,
      targetDomain: 'Conditioning',
      suitabilityScore: alt.suitabilityScore || alt.healthSuitabilityScore,
      healthSuitabilityScore: alt.healthSuitabilityScore,
      goalAlignmentScore: alt.goalAlignmentScore || (75 - idx * 6),
      goalReasons: alt.goalReasons || ['Secondary progression option'],
      behavioralFitScore: alt.behavioralFitScore || (68 - idx * 5),
      behavioralReasons: alt.behavioralReasons || ['Moderate historical friction under fatigue'],
      predictedAdherence: alt.predictedAdherence,
      contextFeasibilityScore: alt.contextFeasibilityScore || (82 - idx * 8),
      feasibilityReasons: alt.feasibilityReasons || ['Requires higher activation energy'],
      finalDecisionScore: alt.finalDecisionScore || Number((alt.healthSuitabilityScore * 0.4 + alt.predictedAdherence * 0.4 + 15).toFixed(1)),
      scoreBreakdown: alt.scoreBreakdown || {
        suitabilityContribution: Number((alt.healthSuitabilityScore * 0.3).toFixed(1)),
        goalAlignmentContribution: 14.0,
        behavioralFitContribution: 6.5,
        predictedAdherenceContribution: Number((alt.predictedAdherence * 0.25).toFixed(1)),
        contextFeasibilityContribution: 12.0
      },
      rationale: alt.rationale,
      suitabilityReasons: alt.suitabilityReasons || [alt.rationale],
      isWinner: false
    }));

    return [winner, ...alts];
  }, [recommendation]);

  // Recalculate candidate scores dynamically when weights are tuned
  const dynamicallyScoredCandidates = useMemo(() => {
    const totalW =
      weights.suitabilityWeight +
      weights.predictedAdherenceWeight +
      weights.goalAlignmentWeight +
      weights.contextFeasibilityWeight +
      weights.behavioralFitWeight || 1.0;

    const normW = {
      wSuit: weights.suitabilityWeight / totalW,
      wAdh: weights.predictedAdherenceWeight / totalW,
      wGoal: weights.goalAlignmentWeight / totalW,
      wFeas: weights.contextFeasibilityWeight / totalW,
      wBeh: weights.behavioralFitWeight / totalW
    };

    const reCalculated: EvaluatedCandidate[] = baseCandidates.map(c => {
      const suitContrib = c.suitabilityScore * normW.wSuit;
      const adhContrib = c.predictedAdherence * normW.wAdh;
      const goalContrib = c.goalAlignmentScore * normW.wGoal;
      const feasContrib = c.contextFeasibilityScore * normW.wFeas;
      const behContrib = c.behavioralFitScore * normW.wBeh;
      const newFinal = Number((suitContrib + adhContrib + goalContrib + feasContrib + behContrib).toFixed(1));

      return {
        ...c,
        finalDecisionScore: newFinal,
        scoreBreakdown: {
          suitabilityContribution: Number(suitContrib.toFixed(1)),
          predictedAdherenceContribution: Number(adhContrib.toFixed(1)),
          goalAlignmentContribution: Number(goalContrib.toFixed(1)),
          contextFeasibilityContribution: Number(feasContrib.toFixed(1)),
          behavioralFitContribution: Number(behContrib.toFixed(1))
        }
      };
    });

    // Sort descending by finalDecisionScore
    reCalculated.sort((a, b) => b.finalDecisionScore - a.finalDecisionScore);

    return reCalculated;
  }, [baseCandidates, weights]);

  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    dynamicallyScoredCandidates[0]?.id || ''
  );

  const selectedCandidate =
    dynamicallyScoredCandidates.find(c => c.id === selectedCandidateId) ||
    dynamicallyScoredCandidates[0];

  const candidateA =
    dynamicallyScoredCandidates.find(c => c.id === candidateAId) ||
    dynamicallyScoredCandidates[0];
  const candidateB =
    dynamicallyScoredCandidates.find(c => c.id === candidateBId) ||
    dynamicallyScoredCandidates[1] ||
    dynamicallyScoredCandidates[0];

  const handleResetWeights = () => {
    setWeights(DEFAULT_WEIGHTS);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0F0F11] border border-slate-800 rounded-2xl p-6 shadow-xs space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
              <Layers className="w-4 h-4 inline mr-1 text-emerald-400" />
              Decision Space Explorer
            </span>
            <span className="text-xs text-slate-500 font-mono">Multi-Objective Optimization</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                compareMode
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{compareMode ? 'Exit Trade-Off Comparison' : 'Side-by-Side Comparison'}</span>
            </button>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight sm:text-2xl">
          Plan Lab: Candidate Intervention Matrix & Trade-Offs
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
          The Recommendation Engine evaluates multiple candidate interventions across 5 mathematical factors:
          <strong> Health Suitability</strong> (recovery match), <strong>Predicted Adherence</strong> (behavioral probability),
          <strong> Goal Alignment</strong> (target synergy), <strong>Context Feasibility</strong> (time & space), and
          <strong> Behavioral Fit</strong> (habit history).
        </p>
      </div>

      {/* Weight Tuning Simulator Panel */}
      <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Interactive Decision Weight Tuner</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Live Re-Ranking
            </span>
          </div>

          <button
            onClick={handleResetWeights}
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Engine Defaults</span>
          </button>
        </div>

        {/* 5 Weight Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          {/* Suitability Weight */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">Health Suitability</span>
              <span className="font-mono font-bold text-teal-300">{Math.round(weights.suitabilityWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.60"
              step="0.05"
              value={weights.suitabilityWeight}
              onChange={e => setWeights({ ...weights, suitabilityWeight: parseFloat(e.target.value) })}
              className="w-full accent-teal-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Biological readiness priority</span>
          </div>

          {/* Adherence Weight */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">Predicted Adherence</span>
              <span className="font-mono font-bold text-emerald-400">{Math.round(weights.predictedAdherenceWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.60"
              step="0.05"
              value={weights.predictedAdherenceWeight}
              onChange={e => setWeights({ ...weights, predictedAdherenceWeight: parseFloat(e.target.value) })}
              className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Completion probability priority</span>
          </div>

          {/* Goal Alignment Weight */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">Goal Alignment</span>
              <span className="font-mono font-bold text-cyan-400">{Math.round(weights.goalAlignmentWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.60"
              step="0.05"
              value={weights.goalAlignmentWeight}
              onChange={e => setWeights({ ...weights, goalAlignmentWeight: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Long-term target priority</span>
          </div>

          {/* Context Feasibility Weight */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">Context Feasibility</span>
              <span className="font-mono font-bold text-indigo-400">{Math.round(weights.contextFeasibilityWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.60"
              step="0.05"
              value={weights.contextFeasibilityWeight}
              onChange={e => setWeights({ ...weights, contextFeasibilityWeight: parseFloat(e.target.value) })}
              className="w-full accent-indigo-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Time and gear barrier priority</span>
          </div>

          {/* Behavioral Fit Weight */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">Behavioral Fit</span>
              <span className="font-mono font-bold text-purple-400">{Math.round(weights.behavioralFitWeight * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.60"
              step="0.05"
              value={weights.behavioralFitWeight}
              onChange={e => setWeights({ ...weights, behavioralFitWeight: parseFloat(e.target.value) })}
              className="w-full accent-purple-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Historical consistency priority</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Mode */}
      {compareMode && (
        <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>Intervention Trade-Off Comparison Matrix</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Directly compare physiological cost vs. completion likelihood between two candidates
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={candidateAId || candidateA.id}
                onChange={e => setCandidateAId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-white focus:outline-hidden"
              >
                {dynamicallyScoredCandidates.map(c => (
                  <option key={c.id} value={c.id}>
                    Option A: {c.title}
                  </option>
                ))}
              </select>

              <span className="text-xs font-mono text-slate-500">vs</span>

              <select
                value={candidateBId || candidateB.id}
                onChange={e => setCandidateBId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-white focus:outline-hidden"
              >
                {dynamicallyScoredCandidates.map(c => (
                  <option key={c.id} value={c.id}>
                    Option B: {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Candidate A Card */}
            <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                    Candidate A
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">{candidateA.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>{candidateA.durationMinutes}m</span>
                    <span>•</span>
                    <span className="capitalize">{candidateA.intensity} intensity</span>
                    <span>•</span>
                    <span className="capitalize">{candidateA.environment}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-mono font-bold text-emerald-400">{candidateA.finalDecisionScore}</span>
                  <span className="text-[10px] text-slate-500 block">Final Score</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-800/40 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Suitability</span>
                  <span className="text-base font-mono font-bold text-teal-300">{candidateA.suitabilityScore}%</span>
                </div>
                <div className="p-2.5 bg-slate-800/40 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Adherence</span>
                  <span className="text-base font-mono font-bold text-emerald-400">{candidateA.predictedAdherence}%</span>
                </div>
                <div className="p-2.5 bg-slate-800/40 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Goal Synergy</span>
                  <span className="text-base font-mono font-bold text-cyan-400">{candidateA.goalAlignmentScore}%</span>
                </div>
                <div className="p-2.5 bg-slate-800/40 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Feasibility</span>
                  <span className="text-base font-mono font-bold text-indigo-400">{candidateA.contextFeasibilityScore}%</span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Trade-Off Rationale:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-800/30 p-2.5 rounded-lg border border-white/5">
                  {candidateA.rationale}
                </p>
              </div>
            </div>

            {/* Candidate B Card */}
            <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                    Candidate B
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">{candidateB.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>{candidateB.durationMinutes}m</span>
                    <span>•</span>
                    <span className="capitalize">{candidateB.intensity} intensity</span>
                    <span>•</span>
                    <span className="capitalize">{candidateB.environment}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-mono font-bold text-cyan-400">{candidateB.finalDecisionScore}</span>
                  <span className="text-[10px] text-slate-500 block">Final Score</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-800/40 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Suitability</span>
                  <span className="text-base font-mono font-bold text-teal-300">{candidateB.suitabilityScore}%</span>
                </div>
                <div className="p-2.5 bg-slate-800/40 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Adherence</span>
                  <span className="text-base font-mono font-bold text-emerald-400">{candidateB.predictedAdherence}%</span>
                </div>
                <div className="p-2.5 bg-slate-800/40 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Goal Synergy</span>
                  <span className="text-base font-mono font-bold text-cyan-400">{candidateB.goalAlignmentScore}%</span>
                </div>
                <div className="p-2.5 bg-slate-800/40 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Feasibility</span>
                  <span className="text-base font-mono font-bold text-indigo-400">{candidateB.contextFeasibilityScore}%</span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Trade-Off Rationale:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-800/30 p-2.5 rounded-lg border border-white/5">
                  {candidateB.rationale}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Candidate Matrix + Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Candidate List with Multi-Factor Scores */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Candidate Interventions Ranked ({dynamicallyScoredCandidates.length})
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Sorted by Composite Utility</span>
          </div>

          <div className="space-y-3">
            {dynamicallyScoredCandidates.map((c, idx) => {
              const isSelected = c.id === selectedCandidate.id;
              const isRankOne = idx === 0;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCandidateId(c.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500 shadow-xs'
                      : 'bg-[#0F0F11] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isRankOne ? 'bg-emerald-500 text-[#0A0A0B]' : 'bg-slate-800 text-slate-400'
                        }`}>
                          #{idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-white">{c.title}</h4>
                        {isRankOne && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                            Engine Winner
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {c.durationMinutes}m
                        </span>
                        <span className="text-xs text-slate-600">•</span>
                        <span className="text-xs text-slate-400 capitalize">{c.intensity} intensity</span>
                        <span className="text-xs text-slate-600">•</span>
                        <span className="text-xs text-slate-400 capitalize">{c.environment}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-mono font-bold text-emerald-400 block">
                        {c.finalDecisionScore}
                      </span>
                      <span className="text-[10px] text-slate-500 block">Score / 100</span>
                    </div>
                  </div>

                  {/* 5-Factor Mini Score Bar */}
                  <div className="grid grid-cols-5 gap-1.5 text-[10px] font-mono text-center pt-2 border-t border-slate-800/70">
                    <div className="p-1 rounded bg-slate-900/60">
                      <span className="text-slate-500 block">Suit</span>
                      <span className="font-bold text-teal-300">{c.suitabilityScore}%</span>
                    </div>
                    <div className="p-1 rounded bg-slate-900/60">
                      <span className="text-slate-500 block">Adh</span>
                      <span className="font-bold text-emerald-400">{c.predictedAdherence}%</span>
                    </div>
                    <div className="p-1 rounded bg-slate-900/60">
                      <span className="text-slate-500 block">Goal</span>
                      <span className="font-bold text-cyan-400">{c.goalAlignmentScore}%</span>
                    </div>
                    <div className="p-1 rounded bg-slate-900/60">
                      <span className="text-slate-500 block">Feas</span>
                      <span className="font-bold text-indigo-400">{c.contextFeasibilityScore}%</span>
                    </div>
                    <div className="p-1 rounded bg-slate-900/60">
                      <span className="text-slate-500 block">Beh</span>
                      <span className="font-bold text-purple-400">{c.behavioralFitScore}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Candidate Deep Dive */}
        <div className="lg:col-span-6 space-y-4">
          {selectedCandidate && (
            <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                    Candidate Specification
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedCandidate.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="capitalize">Category: {selectedCandidate.category?.replace('_', ' ')}</span>
                    <span>•</span>
                    <span className="capitalize">Gear: {selectedCandidate.requiredEquipment?.join(', ') || 'None'}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="text-right">
                    <span className="text-2xl font-mono font-extrabold text-emerald-400">
                      {selectedCandidate.finalDecisionScore}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Utility Score</span>
                  </div>
                </div>
              </div>

              {/* Point Contribution Breakdown */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Point Contribution Breakdown (Weighted Sum)
                </span>
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-teal-300 font-medium">Health Suitability ({selectedCandidate.suitabilityScore}%)</span>
                    <span className="font-mono font-bold text-teal-300">+{selectedCandidate.scoreBreakdown?.suitabilityContribution} pts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-400 font-medium">Predicted Adherence ({selectedCandidate.predictedAdherence}%)</span>
                    <span className="font-mono font-bold text-emerald-400">+{selectedCandidate.scoreBreakdown?.predictedAdherenceContribution} pts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-400 font-medium">Goal Alignment ({selectedCandidate.goalAlignmentScore}%)</span>
                    <span className="font-mono font-bold text-cyan-400">+{selectedCandidate.scoreBreakdown?.goalAlignmentContribution} pts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-indigo-400 font-medium">Context Feasibility ({selectedCandidate.contextFeasibilityScore}%)</span>
                    <span className="font-mono font-bold text-indigo-400">+{selectedCandidate.scoreBreakdown?.contextFeasibilityContribution} pts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-400 font-medium">Behavioral Fit ({selectedCandidate.behavioralFitScore}%)</span>
                    <span className="font-mono font-bold text-purple-400">+{selectedCandidate.scoreBreakdown?.behavioralFitContribution} pts</span>
                  </div>
                </div>
              </div>

              {/* Trade-Off Summary */}
              <div className="space-y-1.5 text-xs">
                <h4 className="font-bold text-slate-200">Engine Attribution & Trade-Off Notice</h4>
                <p className="text-slate-300 leading-relaxed bg-slate-800/40 p-3.5 rounded-lg border border-white/5">
                  {selectedCandidate.rationale}
                </p>
              </div>

              {/* Suitability & Feasibility Rationales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">Suitability Rationale</span>
                  <ul className="text-slate-300 text-[11px] space-y-1">
                    {selectedCandidate.suitabilityReasons?.map((r, i) => (
                      <li key={i} className="leading-tight">• {r}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Feasibility & Fit</span>
                  <ul className="text-slate-300 text-[11px] space-y-1">
                    {selectedCandidate.feasibilityReasons?.map((r, i) => (
                      <li key={i} className="leading-tight">• {r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <button
                  onClick={() => setActiveModule('what_if')}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>Simulate in What-If Lab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setActiveModule('coach')}
                  className="text-xs font-medium text-slate-400 hover:text-white"
                >
                  Consult AI Coach
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
