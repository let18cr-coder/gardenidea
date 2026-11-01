import { useState } from "react";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useGarden } from "@/lib/garden-store";
import type { Idea } from "@/lib/garden";
import { StageBadge } from "./StageBadge";
import { IMAGE_COVERS } from "./covers";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function IdeaCard({ idea, showNotebook }: { idea: Idea; showNotebook?: boolean }) {
  const { openEditor, deleteIdea, notebooks } = useGarden();
  const [confirm, setConfirm] = useState(false);
  const img = idea.image ? IMAGE_COVERS[idea.image] ?? idea.image : undefined;
  const nb = notebooks.find((n) => n.id === idea.notebookId);

  return (
    <article className="paper-card group mb-5 break-inside-avoid overflow-hidden transition-shadow hover:shadow-lift">
      {img && <img src={img} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />}
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <StageBadge stage={idea.stage} />
          <div className="flex gap-1">
            <button
              onClick={() => openEditor({ idea })}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={`Editar ${idea.title}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => setConfirm(true)}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
              aria-label={`Eliminar ${idea.title}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <h3 className="text-lg font-medium leading-snug">{idea.title}</h3>
        {idea.description && <p className="text-sm leading-relaxed text-muted-foreground">{idea.description}</p>}
        {idea.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Etiquetas">
            {idea.tags.map((t) => (
              <li key={t} className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground">#{t}</li>
            ))}
          </ul>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {showNotebook && nb ? <span>📓 {nb.name}</span> : <span />}
          {idea.link && (
            <a href={idea.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
              Enlace <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta idea?</AlertDialogTitle>
            <AlertDialogDescription>“{idea.title}” se quitará de tu jardín. Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { deleteIdea(idea.id); toast("Idea eliminada"); }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}

export function IdeaGrid({ ideas, showNotebook }: { ideas: Idea[]; showNotebook?: boolean }) {
  if (!ideas.length)
    return (
      <div className="paper-card flex flex-col items-center gap-2 p-10 text-center">
        <span className="text-4xl" aria-hidden>🌰</span>
        <p className="font-serif text-lg">Aún no hay ideas aquí</p>
        <p className="text-sm text-muted-foreground">Planta tu primera semilla y mírala crecer.</p>
      </div>
    );
  return (
    <div className="columns-1 gap-5 sm:columns-2 xl:columns-3">
      {ideas.map((i) => <IdeaCard key={i.id} idea={i} showNotebook={showNotebook} />)}
    </div>
  );
}
