import React from 'react';
import { ExplainabilityFactor } from '../../types/index.js';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ShapAttributionBarProps {
  factors: ExplainabilityFactor[];
  title?: string;
}

export const ShapAttributionBar: React.FC<ShapAttributionBarProps> = ({
  factors,
  title = 'Explainable Decision Attribution (SHAP-Inspired)'
}) => {
  return (
    <div className="bg-[#0F0F11] border border-slate-800 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-white tracking-tight">{title}</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Empirical feature weights influencing adherence prediction and health suitability
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30">
          XAI Engine
        </span>
      </div>

      <div className="space-y-3.5">
        {factors.map((factor, index) => {
          const isPositive = factor.direction === 'increases_adherence';
          const isNegative = factor.direction === 'decreases_adherence';
          const barWidthPercent = Math.min(100, Math.max(12, Math.abs(factor.impactScore) * 120));

          return (
            <div key={index} className="text-xs">
              <div className="flex items-center justify-between font-medium mb-1">
                <div className="flex items-center gap-1.5 text-slate-200">
                  {isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : isNegative ? (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                  <span>{factor.feature}</span>
                </div>
                <span
                  className={`font-mono font-semibold ${
                    isPositive
                      ? 'text-emerald-400'
                      : isNegative
                      ? 'text-rose-400'
                      : 'text-slate-400'
                  }`}
                >
                  {factor.impactScore > 0 ? `+${factor.impactScore}` : factor.impactScore}
                </span>
              </div>

              {/* Attribution Impact Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isPositive
                      ? 'bg-emerald-500'
                      : isNegative
                      ? 'bg-rose-500'
                      : 'bg-slate-600'
                  }`}
                  style={{ width: `${barWidthPercent}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                {factor.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
