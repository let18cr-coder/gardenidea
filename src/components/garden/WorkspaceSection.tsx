import { Plus, Trash2, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { type IdeaSection, type IdeaImage, checklistProgress, safeExternalUrl } from "@/lib/idea-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { RichNotes } from "./RichNotes";
import { IdeaGallery } from "./IdeaGallery";

export function WorkspaceSection({ ideaId, section: s, onChange, onDelete, onMove, first, last, onUploaded, onRemoveImage }: {
  ideaId: string; section: IdeaSection; onChange: (s: IdeaSection) => void; onDelete: () => void;
  onMove: (direction: number) => void; first: boolean; last: boolean;
  onUploaded: (images: IdeaImage[]) => Promise<void>; onRemoveImage: (image: IdeaImage) => void;
}) {
  const progress = checklistProgress(s.tasks);
  return <section className="min-w-0 space-y-4 border-t border-border py-6" aria-label={s.title}>
    <div className="flex items-center gap-1"><Input aria-label="Título de sección" className="min-w-0 flex-1 border-transparent bg-transparent font-serif text-xl shadow-none" value={s.title} onChange={e => onChange({ ...s, title: e.target.value })} />
      <Button type="button" variant="ghost" size="icon" disabled={first} title="Subir sección" aria-label="Subir sección" onClick={() => onMove(-1)}><ArrowUp /></Button>
      <Button type="button" variant="ghost" size="icon" disabled={last} title="Bajar sección" aria-label="Bajar sección" onClick={() => onMove(1)}><ArrowDown /></Button>
      <Button type="button" variant="ghost" size="icon" title="Eliminar sección" aria-label="Eliminar sección" onClick={onDelete}><Trash2 /></Button>
    </div>
    {(s.kind === "notes" || s.kind === "custom") && <RichNotes document={s.document} label={`Contenido de ${s.title}`} onChange={document => onChange({ ...s, document })} />}
    {s.kind === "gallery" && <IdeaGallery ideaId={ideaId} images={s.images} onChange={images => onChange({ ...s, images })} onUploaded={onUploaded} onRemove={onRemoveImage} />}
    {s.kind === "checklist" && <div className="space-y-3">
      <div className="flex items-center gap-4"><span className="shrink-0 text-sm text-muted-foreground">{progress.completed} de {progress.total} tareas completadas</span><Progress aria-label="Progreso de tareas" value={progress.total ? progress.completed / progress.total * 100 : 0} className="h-2" /></div>
      {s.tasks.map(t => <div key={t.id} className="flex items-center gap-3"><Checkbox aria-label={`Completar ${t.text || "tarea"}`} checked={t.done} onCheckedChange={done => onChange({ ...s, tasks: s.tasks.map(x => x.id === t.id ? { ...x, done: done === true } : x) })} /><Input aria-label="Texto de tarea" placeholder="Nueva tarea" value={t.text} className={t.done ? "text-muted-foreground line-through" : ""} onChange={e => onChange({ ...s, tasks: s.tasks.map(x => x.id === t.id ? { ...x, text: e.target.value } : x) })} /><Button type="button" variant="ghost" size="icon" title="Eliminar tarea" aria-label="Eliminar tarea" onClick={() => onChange({ ...s, tasks: s.tasks.filter(x => x.id !== t.id) })}><Trash2 /></Button></div>)}
      <Button type="button" variant="outline" onClick={() => onChange({ ...s, tasks: [...s.tasks, { id: crypto.randomUUID(), text: "", done: false }] })}><Plus />Agregar tarea</Button>
    </div>}
    {s.kind === "progress" && <div className="space-y-4">
      {s.entries.map(entry => <div key={entry.id} className="space-y-2"><div className="flex gap-2"><Input type="date" aria-label="Fecha de avance" value={entry.date} onChange={e => onChange({ ...s, entries: s.entries.map(x => x.id === entry.id ? { ...x, date: e.target.value } : x) })} /><Button type="button" size="icon" variant="ghost" aria-label="Eliminar avance" title="Eliminar avance" onClick={() => onChange({ ...s, entries: s.entries.filter(x => x.id !== entry.id) })}><Trash2 /></Button></div><Textarea aria-label="Comentario de avance" placeholder="¿Qué avanzaste?" value={entry.text} onChange={e => onChange({ ...s, entries: s.entries.map(x => x.id === entry.id ? { ...x, text: e.target.value } : x) })} /></div>)}
      <Button type="button" variant="outline" onClick={() => onChange({ ...s, entries: [...s.entries, { id: crypto.randomUUID(), date: new Date().toLocaleDateString("en-CA"), text: "" }] })}><Plus />Registrar avance</Button>
    </div>}
    {s.kind === "links" && <div className="space-y-3">
      {s.links.map(link => <div key={link.id} className="flex flex-wrap items-center gap-2"><Input className="min-w-0 flex-1 basis-40" aria-label="Nombre del enlace" placeholder="Nombre" value={link.label} onChange={e => onChange({ ...s, links: s.links.map(x => x.id === link.id ? { ...x, label: e.target.value } : x) })} /><Input className="min-w-0 flex-1 basis-48" aria-label="Dirección del enlace" placeholder="https://" type="url" value={link.url} onChange={e => onChange({ ...s, links: s.links.map(x => x.id === link.id ? { ...x, url: e.target.value } : x) })} />{safeExternalUrl(link.url) && <Button asChild size="icon" variant="ghost"><a href={safeExternalUrl(link.url) ?? undefined} target="_blank" rel="noopener noreferrer" aria-label="Abrir enlace" title="Abrir enlace"><ExternalLink /></a></Button>}<Button type="button" size="icon" variant="ghost" aria-label="Eliminar enlace" title="Eliminar enlace" onClick={() => onChange({ ...s, links: s.links.filter(x => x.id !== link.id) })}><Trash2 /></Button></div>)}
      <Button type="button" variant="outline" onClick={() => onChange({ ...s, links: [...s.links, { id: crypto.randomUUID(), label: "", url: "" }] })}><Plus />Agregar enlace</Button>
    </div>}
  </section>;
}