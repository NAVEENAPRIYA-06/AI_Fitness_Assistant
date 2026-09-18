import React from 'react';

interface AdherenceMeterProps {
  score: number; // 0-100
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
}

export const AdherenceMeter: React.FC<AdherenceMeterProps> = ({
  score,
  label = 'Predicted Adherence',
  size = 'md',
  subtitle
}) => {
  // Color calculation based on adherence probability
  const getColor = (val: number) => {
    if (val >= 75) return { stroke: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (val >= 50) return { stroke: '#f59e0b', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    return { stroke: '#f43f5e', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
  };

  const colors = getColor(score);
  const radius = size === 'lg' ? 44 : size === 'md' ? 36 : 28;
  const strokeWidth = size === 'lg' ? 7 : size === 'md' ? 6 : 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2;

  return (
    <div className="flex items-center gap-3.5">
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width={svgSize} height={svgSize} className="transform -rotate-90">
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono font-bold ${colors.text} ${size === 'lg' ? 'text-xl' : size === 'md' ? 'text-base' : 'text-xs'}`}>
            {score}%
          </span>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-white tracking-tight">{label}</p>
        {subtitle ? (
          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{subtitle}</p>
        ) : (
          <p className="text-[11px] text-slate-500 mt-0.5">
            {score >= 75 ? 'High probability of completion' : score >= 50 ? 'Moderate friction expected' : 'High risk of skipped session'}
          </p>
        )}
      </div>
    </div>
  );
};
