import { stageInfo, type Stage } from "@/lib/garden";
import { cn } from "@/lib/utils";

export function StageBadge({ stage, className }: { stage: Stage; className?: string }) {
  const s = stageInfo(stage);
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", s.tone, className)}>
      <span aria-hidden>{s.emoji}</span>
      {s.label}
    </span>
  );
}
