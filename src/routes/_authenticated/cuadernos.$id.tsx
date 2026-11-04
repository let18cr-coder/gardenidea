import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { useGarden } from "@/lib/garden-store";
import { Button } from "@/components/ui/button";
import { Cover } from "@/components/garden/covers";
import { IdeaBoard } from "@/components/garden/IdeaBoard";
import { NotebookDialog } from "@/components/garden/NotebookDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/cuadernos/$id")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Tablero de ideas · Idea Garden" },
      { name: "description", content: "Un tablero visual para las ideas de tu cuaderno." },
      { property: "og:title", content: "Tablero de ideas · Idea Garden" },
      { property: "og:description", content: "Tablero de inspiración estilo scrapbook." },
    ],
  }),
  component: Board,
});

function Board() {
  const { id } = Route.useParams();
  const { notebooks, ideas, openEditor, deleteNotebook } = useGarden();
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const nb = notebooks.find((n) => n.id === id);

  if (!nb)
    return (
      <div className="paper-card p-10 text-center">
        <p className="font-serif text-xl">No encontramos este cuaderno</p>
        <Button asChild variant="secondary" className="mt-4 rounded-full"><Link to="/cuadernos">Volver a mis cuadernos</Link></Button>
      </div>
    );

  const nbIdeas = ideas.filter((i) => i.notebookId === nb.id);

  return (
    <div className="space-y-8">
      <Link to="/cuadernos" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Mis cuadernos</Link>
      <header className="paper-card flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
        <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl shadow-soft"><Cover cover={nb.cover} /></div>
        <div className="flex-1 space-y-1">
          <h1 className="text-3xl font-medium">{nb.name}</h1>
          {nb.description && <p className="text-muted-foreground">{nb.description}</p>}
          <p className="text-sm text-muted-foreground">{nbIdeas.length} ideas</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setEdit(true)} aria-label="Editar cuaderno"><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:text-destructive" onClick={() => setConfirm(true)} aria-label="Eliminar cuaderno"><Trash2 className="h-4 w-4" /></Button>
          <Button onClick={() => openEditor({ notebookId: nb.id })} className="rounded-full"><Plus className="h-4 w-4" /> Agregar idea</Button>
        </div>
      </header>
      <IdeaBoard ideas={nbIdeas} />
      <NotebookDialog open={edit} onOpenChange={setEdit} notebook={nb} />
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar “{nb.name}”?</AlertDialogTitle>
            <AlertDialogDescription>También se eliminarán sus {nbIdeas.length} ideas. Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { deleteNotebook(nb.id); toast("Cuaderno eliminado"); navigate({ to: "/cuadernos" }); }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
