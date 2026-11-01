import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { STAGES, type Idea, type Stage } from "@/lib/garden";
import { Input } from "@/components/ui/input";
import { IdeaGrid } from "./IdeaCard";
import { cn } from "@/lib/utils";

export function IdeaBoard({ ideas, showNotebook }: { ideas: Idea[]; showNotebook?: boolean }) {
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<Stage | "all">("all");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return ideas
      .filter((i) => stage === "all" || i.stage === stage)
      .filter((i) => !s || [i.title, i.description, ...i.tags].join(" ").toLowerCase().includes(s))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [ideas, q, stage]);

  const chips: { id: Stage | "all"; label: string }[] = [{ id: "all", label: "Todas" }, ...STAGES.map((s) => ({ id: s.id, label: `${s.emoji} ${s.label}` }))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c.id}
              onClick={() => setStage(c.id)}
              aria-pressed={stage === c.id}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                stage === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="relative md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <label htmlFor="idea-search" className="sr-only">Buscar ideas</label>
          <Input id="idea-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar ideas o etiquetas" className="rounded-full bg-card pl-9" />
        </div>
      </div>
      <IdeaGrid ideas={filtered} showNotebook={showNotebook} />
    </div>
  );
}
