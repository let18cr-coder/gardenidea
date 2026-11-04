import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useBlocker } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Plus, Save, ImagePlus, ListChecks } from "lucide-react";
import { useGarden } from "@/lib/garden-store";
import { newSection, SECTION_TYPES, type Workspace, type IdeaSection, type IdeaImage } from "@/lib/idea-workspace";
import { readWorkspace, writeWorkspace, removeIdeaImages } from "@/lib/idea-workspace-api";
import { WorkspaceSection } from "@/components/garden/WorkspaceSection";
import { StageBadge } from "@/components/garden/StageBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const workspaceQuery = (id: string) => queryOptions({ queryKey: ["idea-workspace", id], queryFn: () => readWorkspace(id), staleTime: 0 });
export const Route = createFileRoute("/_authenticated/ideas_/$ideaId")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(workspaceQuery(params.ideaId)),
  head: () => ({ meta: [
    { title: "Mi espacio de idea · Idea Garden" }, { name: "description", content: "Desarrolla tus ideas con notas, imágenes privadas y secciones personales." },
    { property: "og:title", content: "Mi espacio de idea · Idea Garden" }, { property: "og:description", content: "Tu cuaderno personal de notas, tareas e inspiración." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  errorComponent: () => <div className="space-y-4"><h1 className="font-serif text-2xl">No pudimos abrir esta idea</h1><p>Puede que no exista, no pertenezca a tu cuenta o haya un problema de conexión.</p><Button asChild variant="outline"><Link to="/ideas">Volver a mis ideas</Link></Button></div>,
  component: () => { const { ideaId } = Route.useParams(); return <IdeaWorkspace key={ideaId} id={ideaId} />; },
});

function IdeaWorkspace({ id }: { id: string }) {
  const { data } = useSuspenseQuery(workspaceQuery(id));
  const { ideas, notebooks, updateIdeaLocal } = useGarden();
  const idea = ideas.find(i => i.id === id);
  const queryClient = useQueryClient();
  const [workspace, setWorkspace] = useState<Workspace>(data.workspace);
  const [revision, setRevision] = useState(data.revision);
  const [title, setTitle] = useState(idea?.title ?? "");
  const [description, setDescription] = useState(idea?.description ?? "");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirm, setConfirm] = useState<{ sectionId: string; image?: IdeaImage } | null>(null);
  const pendingDelete = useRef<string[]>([]);
  const currentWorkspace = useRef(workspace);
  const busy = useRef(false);
  const version = useRef(0);
  useBlocker({ shouldBlockFn: () => dirty && !window.confirm("Tienes cambios sin guardar. ¿Salir sin guardarlos?"), enableBeforeUnload: dirty });
  useEffect(() => { const warn = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [dirty]);
  const changed = () => { version.current += 1; setDirty(true); setSaved(false); };
  const update = (next: Workspace) => { currentWorkspace.current = next; setWorkspace(next); changed(); };
  const sectionChange = (section: IdeaSection) => update({ ...currentWorkspace.current, sections: currentWorkspace.current.sections.map(s => s.id === section.id ? section : s) });
  const save = async (next = currentWorkspace.current) => {
    if (busy.current) throw new Error("Espera a que termine el guardado.");
    if (!title.trim()) throw new Error("Dale un nombre a tu idea.");
    busy.current = true; setSaving(true); const savingVersion = version.current;
    try {
      const nextRevision = await writeWorkspace(id, next, revision, title.trim(), description);
      setRevision(nextRevision); updateIdeaLocal(id, { title: title.trim(), description });
      queryClient.setQueryData(workspaceQuery(id).queryKey, { workspace: next, revision: nextRevision });
      if (savingVersion === version.current) { setDirty(false); setSaved(true); }
      const paths = [...pendingDelete.current];
      await removeIdeaImages(paths); pendingDelete.current = pendingDelete.current.filter(p => !paths.includes(p));
    } finally { busy.current = false; setSaving(false); }
  };
  const saveClick = () => void save().catch(e => toast.error(e instanceof Error ? e.message : "No se pudieron guardar los cambios."));
  const add = (kind: IdeaSection["kind"]) => update({ ...currentWorkspace.current, sections: [...currentWorkspace.current.sections, newSection(kind)] });
  const remove = () => {
    if (!confirm) return;
    const section = currentWorkspace.current.sections.find(s => s.id === confirm.sectionId);
    if (section) {
      pendingDelete.current.push(...(confirm.image ? [confirm.image.path] : section.images.map(i => i.path)));
      if (confirm.image) sectionChange({ ...section, images: section.images.filter(i => i.id !== confirm.image?.id) });
      else update({ ...currentWorkspace.current, sections: currentWorkspace.current.sections.filter(s => s.id !== section.id) });
    }
    setConfirm(null);
  };
  if (!idea) return <p>No encontramos esta idea en tu jardín.</p>;
  const notebook = notebooks.find(n => n.id === idea.notebookId);
  return <div className="mx-auto max-w-4xl space-y-6">
    <Link to="/cuadernos/$id" params={{ id: idea.notebookId }} className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />{notebook?.name ?? "Mi cuaderno"}</Link>
    <header className="flex flex-wrap items-center justify-between gap-3"><StageBadge stage={idea.stage} /><div className="flex items-center gap-3"><span className="inline-flex items-center gap-1 text-xs text-muted-foreground" role="status">{saving ? "Guardando…" : dirty ? "Cambios sin guardar" : saved ? <><Check className="h-4 w-4" />Guardado</> : ""}</span><Button onClick={saveClick} disabled={saving}><Save />Guardar</Button></div></header>
    <div className="space-y-4"><div className="space-y-2"><Label htmlFor="workspace-title">Título de la idea</Label><Input id="workspace-title" className="h-auto min-h-12 font-serif text-2xl sm:text-3xl" value={title} onChange={e => { setTitle(e.target.value); changed(); }} /></div><div className="space-y-2"><Label htmlFor="workspace-description">Descripción</Label><Textarea id="workspace-description" rows={3} value={description} onChange={e => { setDescription(e.target.value); changed(); }} /></div></div>
    <div className="flex flex-wrap gap-2"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="secondary" disabled={saving}><Plus />Agregar sección</Button></DropdownMenuTrigger><DropdownMenuContent>{SECTION_TYPES.map(s => <DropdownMenuItem key={s.kind} onSelect={() => add(s.kind)}>{s.label}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu><Button variant="outline" disabled={saving} onClick={() => add("gallery")}><ImagePlus />Agregar imágenes</Button><Button variant="outline" disabled={saving} onClick={() => add("checklist")}><ListChecks />Agregar checklist</Button></div>
    <div className={saving ? "pointer-events-none opacity-70" : ""} aria-busy={saving}>{workspace.sections.map((section, index) => <WorkspaceSection key={section.id} ideaId={id} section={section} first={index === 0} last={index === workspace.sections.length - 1} onChange={sectionChange} onDelete={() => setConfirm({ sectionId: section.id })} onRemoveImage={image => setConfirm({ sectionId: section.id, image })} onMove={direction => { const sections = [...currentWorkspace.current.sections]; const target = index + direction; const other = sections[target]; if (!other) return; sections[index] = other; sections[target] = section; update({ ...currentWorkspace.current, sections }); }} onUploaded={async images => { const current = currentWorkspace.current.sections.find(s => s.id === section.id); if (!current) { await removeIdeaImages(images.map(i => i.path)); return; } const next = { ...currentWorkspace.current, sections: currentWorkspace.current.sections.map(s => s.id === section.id ? { ...s, images: [...s.images, ...images] } : s) }; update(next); await save(next); }} />)}</div>
    {workspace.sections.length > 0 && <div className="flex justify-end border-t border-border pt-4"><Button onClick={saveClick} disabled={saving}><Save />Guardar cambios</Button></div>}
    <AlertDialog open={!!confirm} onOpenChange={o => !o && setConfirm(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{confirm?.image ? "¿Eliminar esta imagen?" : "¿Eliminar esta sección?"}</AlertDialogTitle><AlertDialogDescription>Se quitará al guardar los cambios. Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={remove}>Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}