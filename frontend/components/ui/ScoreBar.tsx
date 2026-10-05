interface ScoreBarProps {
  score: number;
  label?: string;
}

export function ScoreBar({ score, label }: ScoreBarProps) {
  let colorClass = "bg-red-500";
  if (score >= 80) colorClass = "bg-emerald-500";
  else if (score >= 60) colorClass = "bg-amber-500";

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">{label}</span>
          <span className="font-medium">{score}%</span>
        </div>
      )}
      <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
