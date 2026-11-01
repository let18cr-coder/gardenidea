import { createFileRoute } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { useGarden } from "@/lib/garden-store";
import { STAGES } from "@/lib/garden";
import { PageHeader } from "@/components/garden/AppShell";

export const Route = createFileRoute("/progreso")({
  head: () => ({
    meta: [
      { title: "Mi jardín floreciendo · Idea Garden" },
      { name: "description", content: "Mira cómo tus ideas crecen de semilla a flor." },
      { property: "og:title", content: "Mi jardín floreciendo · Idea Garden" },
      { property: "og:description", content: "Progreso de tus ideas en cuatro etapas." },
    ],
  }),
  component: Progress,
});

function Progress() {
  const { ideas, notebooks, openEditor } = useGarden();
  const total = ideas.length || 1;
  const bloomed = ideas.filter((i) => i.stage === "flor").length;

  return (
    <>
      <PageHeader eyebrow="Mi progreso" title="Mi jardín floreciendo" subtitle="De una pequeña semilla a una flor: así crecen tus ideas." />

      <section className="paper-card mb-10 space-y-4 p-6">
        <div className="flex items-baseline justify-between">
          <p className="font-serif text-lg">Ideas florecidas</p>
          <p className="text-sm text-muted-foreground">{bloomed} de {ideas.length}</p>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full bg-muted" role="img" aria-label="Distribución de ideas por etapa">
          {STAGES.map((s) => {
            const n = ideas.filter((i) => i.stage === s.id).length;
            return <div key={s.id} className={s.tone.split(" ")[0]} style={{ width: `${(n / total) * 100}%` }} />;
          })}
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((s) => {
          const list = ideas.filter((i) => i.stage === s.id);
          return (
            <section key={s.id} aria-labelledby={`st-${s.id}`} className="flex flex-col gap-3 rounded-3xl bg-card/60 p-4 ring-1 ring-border">
              <header className={`flex items-center gap-3 rounded-2xl p-4 ${s.tone}`}>
                <span className="text-3xl" aria-hidden>{s.emoji}</span>
                <div className="flex-1">
                  <h2 id={`st-${s.id}`} className="text-xl font-medium">{s.label}</h2>
                  <p className="text-xs opacity-80">{s.hint}</p>
                </div>
                <span className="font-serif text-3xl">{list.length}</span>
              </header>
              {list.length === 0 && <p className="p-4 text-center text-sm text-muted-foreground">Nada por aquí todavía.</p>}
              {list.map((i) => (
                <button
                  key={i.id}
                  onClick={() => openEditor({ idea: i })}
                  className="paper-card group p-4 text-left transition-shadow hover:shadow-lift"
                  aria-label={`Editar ${i.title}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium leading-snug">{i.title}</p>
                    <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{notebooks.find((n) => n.id === i.notebookId)?.name}</p>
                </button>
              ))}
            </section>
          );
        })}
      </div>
    </>
  );
}
