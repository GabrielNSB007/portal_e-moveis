import { percentage } from "@/shared/utils/format";

export function ScoreBadge({ score }: { score: number }) {
  const label = score >= 90 ? "Excelente match" : score >= 80 ? "Muito compatível" : "Compatível";

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-extrabold text-primary">
      <span>{percentage(score)}</span>
      <span className="font-semibold text-primary/75">{label}</span>
    </div>
  );
}
