import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Plus } from "lucide-react";
import { useGarden } from "@/lib/garden-store";
import { Button } from "@/components/ui/button";
import { Cover } from "@/components/garden/covers";
import { PageHeader } from "@/components/garden/AppShell";
import { NotebookDialog } from "@/components/garden/NotebookDialog";

export const Route = createFileRoute("/_authenticated/cuadernos/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Mis cuadernos · Idea Garden" },
      { name: "description", content: "Tu galería de cuadernos digitales con portadas personalizadas." },
      { property: "og:title", content: "Mis cuadernos · Idea Garden" },
      { property: "og:description", content: "Cuadernos digitales para organizar tus ideas." },
    ],
  }),
  component: Notebooks,
});

function Notebooks() {
  const { notebooks, ideas } = useGarden();
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Colección"
        title="Mis cuadernos"
        subtitle="Cada cuaderno es un pequeño invernadero para tus ideas."
        action={<Button onClick={() => setOpen(true)} className="rounded-full"><Plus className="h-4 w-4" /> Nuevo cuaderno</Button>}
      />
      <div className="grid gap-8 pt-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {notebooks.map((n, i) => (
          <article key={n.id} className={`tape paper-card flex flex-col overflow-hidden transition-transform hover:-translate-y-1 ${i % 2 ? "rotate-[0.6deg]" : "-rotate-[0.6deg]"}`}>
            <div className="aspect-[3/4] overflow-hidden border-b border-border"><Cover cover={n.cover} alt={`Portada de ${n.name}`} /></div>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div>
                <h2 className="text-xl font-medium">{n.name}</h2>
                <p className="text-sm text-muted-foreground">{ideas.filter((x) => x.notebookId === n.id).length} ideas</p>
              </div>
              <Button asChild variant="secondary" className="mt-auto rounded-full">
                <Link to="/cuadernos/$id" params={{ id: n.id }}><BookOpen className="h-4 w-4" /> Abrir cuaderno</Link>
              </Button>
            </div>
          </article>
        ))}
        <button
          onClick={() => setOpen(true)}
          className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border p-6 text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary"><Plus className="h-6 w-6" /></span>
          <span className="font-serif text-lg">Crear cuaderno</span>
        </button>
      </div>
      <NotebookDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
