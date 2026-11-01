import { useEffect, useState, type FormEvent } from "react";
import { useGarden } from "@/lib/garden-store";
import type { Notebook } from "@/lib/garden";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Cover, COVER_OPTIONS } from "./covers";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function NotebookDialog({ open, onOpenChange, notebook }: { open: boolean; onOpenChange: (o: boolean) => void; notebook?: Notebook }) {
  const { saveNotebook } = useGarden();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState("salvia");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(notebook?.name ?? "");
    setDescription(notebook?.description ?? "");
    setCover(notebook?.cover ?? "salvia");
    setError("");
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Ponle un nombre a tu cuaderno.");
    saveNotebook({ id: notebook?.id, name: name.trim(), description: description.trim(), cover });
    toast(notebook ? "Cuaderno actualizado" : "Nuevo cuaderno creado 📓");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-medium">{notebook ? "Editar cuaderno" : "Nuevo cuaderno"}</DialogTitle>
          <DialogDescription>Un lugar para agrupar ideas que crecen juntas.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="nb-name">Nombre</Label>
            <Input id="nb-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Ej. Recetas favoritas" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nb-desc">Descripción</Label>
            <Textarea id="nb-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={200} />
          </div>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Portada</legend>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {COVER_OPTIONS.map((c) => (
                <label key={c} className={cn("aspect-[3/4] cursor-pointer overflow-hidden rounded-xl border-2 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring", cover === c ? "border-primary" : "border-transparent")}>
                  <input type="radio" name="cover" value={c} checked={cover === c} onChange={() => setCover(c)} className="sr-only" aria-label={`Portada ${c}`} />
                  <Cover cover={c} />
                </label>
              ))}
            </div>
          </fieldset>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" className="rounded-full px-6">Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
