import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useGarden } from "@/lib/garden-store";
import { STAGES, type Stage } from "@/lib/garden";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function IdeaEditor() {
  const { editor, closeEditor, saveIdea, notebooks } = useGarden();
  const idea = editor.idea;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notebookId, setNotebookId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [link, setLink] = useState("");
  const [stage, setStage] = useState<Stage>("semilla");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editor.open) return;
    setTitle(idea?.title ?? "");
    setDescription(idea?.description ?? "");
    setNotebookId(idea?.notebookId ?? editor.notebookId ?? notebooks[0]?.id ?? "");
    setTags(idea?.tags ?? []);
    setTagInput("");
    setLink(idea?.link ?? "");
    setStage(idea?.stage ?? "semilla");
    setError("");
  }, [editor.open]); // eslint-disable-line react-hooks/exhaustive-deps

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, "").toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError("Dale un nombre a tu idea.");
    if (!notebookId) return setError("Primero crea un cuaderno.");
    const pending = tagInput.trim().replace(/^#/, "").toLowerCase();
    saveIdea({
      id: idea?.id,
      title: title.trim(),
      description: description.trim(),
      notebookId,
      tags: pending && !tags.includes(pending) ? [...tags, pending] : tags,
      link: link.trim() || undefined,
      image: idea?.image,
      stage,
    });
    toast(idea ? "Idea actualizada 🌿" : "¡Semilla plantada! 🌱");
    closeEditor();
  };

  return (
    <Dialog open={editor.open} onOpenChange={(o) => !o && closeEditor()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl bg-card sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-medium">{idea ? "Editar idea" : "Plantar una idea"}</DialogTitle>
          <DialogDescription>Cada gran idea empieza con una pequeña semilla.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="idea-title">Nombre de la idea</Label>
            <Input id="idea-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Rincón de lectura" maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="idea-desc">Descripción</Label>
            <Textarea id="idea-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={500} placeholder="¿Qué te inspira de esta idea?" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="idea-nb">Cuaderno</Label>
              <select
                id="idea-nb"
                value={notebookId}
                onChange={(e) => setNotebookId(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {notebooks.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="idea-link">Enlace (opcional)</Label>
              <Input id="idea-link" type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="idea-tags">Etiquetas</Label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs">
                  #{t}
                  <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`Quitar etiqueta ${t}`} className="rounded-full hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <Input
              id="idea-tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
              placeholder="Escribe y presiona Enter"
            />
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Estado de crecimiento</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {STAGES.map((s) => (
                <label
                  key={s.id}
                  className={cn(
                    "flex cursor-pointer flex-col items-center gap-1 rounded-2xl border p-3 text-center text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                    stage === s.id ? "border-primary bg-secondary" : "border-border hover:bg-muted",
                  )}
                >
                  <input type="radio" name="stage" value={s.id} checked={stage === s.id} onChange={() => setStage(s.id)} className="sr-only" />
                  <span className="text-2xl" aria-hidden>{s.emoji}</span>
                  <span className="font-medium">{s.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="rounded-full" onClick={closeEditor}>Cancelar</Button>
            <Button type="submit" className="rounded-full px-6">Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
