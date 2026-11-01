import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Plus } from "lucide-react";
import garden from "@/assets/garden.jpg";
import { useGarden } from "@/lib/garden-store";
import { Button } from "@/components/ui/button";
import { Cover } from "@/components/garden/covers";
import { IdeaGrid } from "@/components/garden/IdeaCard";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Mi jardín · Idea Garden" },
      { name: "description", content: "Tu jardín de ideas: cuadernos, inspiración y progreso en un solo lugar." },
      { property: "og:title", content: "Mi jardín · Idea Garden" },
      { property: "og:description", content: "Every great idea starts with a little seed." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { ideas, notebooks, openEditor } = useGarden();
  const growing = ideas.filter((i) => i.stage === "brote" || i.stage === "planta").length;
  const done = ideas.filter((i) => i.stage === "flor").length;
  const stats = [
    { label: "Ideas plantadas", value: ideas.length, emoji: "🌰", tone: "bg-muted" },
    { label: "En crecimiento", value: growing, emoji: "🌱", tone: "bg-secondary" },
    { label: "Florecidas", value: done, emoji: "🌸", tone: "bg-rose/50" },
  ];
  const recentNb = [...notebooks].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);
  const recentIdeas = [...ideas].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);

  return (
    <div className="space-y-14">
      <section className="paper-card relative overflow-hidden">
        <div className="relative z-10 max-w-lg space-y-5 p-7 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Mi jardín</p>
          <h1 className="text-4xl font-medium leading-tight sm:text-5xl">Bienvenida a tu jardín de ideas</h1>
          <p className="font-serif text-lg italic text-muted-foreground">Every great idea starts with a little seed.</p>
          <Button size="lg" onClick={() => openEditor()} className="rounded-full px-6 shadow-soft">
            <Plus className="h-5 w-5" /> Plantar una idea
          </Button>
        </div>
        <img src={garden} alt="Ilustración de un pequeño jardín en macetas" width={1280} height={768} className="w-full object-cover md:absolute md:inset-y-0 md:right-0 md:h-full md:w-3/5 md:object-[70%_center]" />
      </section>

      <section aria-labelledby="stats" className="space-y-4">
        <h2 id="stats" className="sr-only">Estadísticas</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="paper-card flex items-center gap-4 p-5">
              <span className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${s.tone}`} aria-hidden>{s.emoji}</span>
              <div>
                <p className="font-serif text-3xl">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-medium">Cuadernos recientes</h2>
          <Link to="/cuadernos" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">Ver todos <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {recentNb.map((n) => (
            <Link key={n.id} to="/cuadernos/$id" params={{ id: n.id }} className="paper-card group overflow-hidden transition-shadow hover:shadow-lift">
              <div className="aspect-[4/3] overflow-hidden"><Cover cover={n.cover} className="transition-transform duration-500 group-hover:scale-105" /></div>
              <div className="p-4">
                <p className="font-serif text-base font-medium leading-snug">{n.name}</p>
                <p className="text-xs text-muted-foreground">{ideas.filter((i) => i.notebookId === n.id).length} ideas</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-medium">Ideas recientes</h2>
          <Link to="/ideas" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">Ver todas <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <IdeaGrid ideas={recentIdeas} showNotebook />
      </section>
    </div>
  );
}
