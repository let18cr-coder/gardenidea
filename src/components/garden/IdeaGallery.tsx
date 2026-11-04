import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { IMAGE_BUCKET, type IdeaImage } from "@/lib/idea-workspace";
import { uploadIdeaImage } from "@/lib/idea-workspace-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

function PrivateImage({ image, onOpen }: { image: IdeaImage; onOpen: (url: string) => void }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const { data, error } = await supabase.storage.from(IMAGE_BUCKET).createSignedUrl(image.path, 3600);
      if (active && data) setUrl(data.signedUrl);
      if (active && error) toast.error("No se pudo mostrar la imagen privada.");
    };
    void refresh(); const timer = setInterval(() => void refresh(), 3000000);
    return () => { active = false; clearInterval(timer); };
  }, [image.path]);
  return <Button type="button" variant="ghost" className="h-auto w-full overflow-hidden p-0" aria-label="Ampliar imagen" onClick={() => url && onOpen(url)} disabled={!url}>
    {url ? <img src={url} alt={image.caption || "Imagen de la idea"} className="aspect-[4/3] w-full object-cover" /> : <span className="flex aspect-[4/3] w-full items-center justify-center bg-muted text-muted-foreground">Cargando imagen…</span>}
  </Button>;
}
export function IdeaGallery({ ideaId, images, onChange, onUploaded, onRemove }: { ideaId: string; images: IdeaImage[]; onChange: (images: IdeaImage[]) => void; onUploaded: (images: IdeaImage[]) => Promise<void>; onRemove: (image: IdeaImage) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const added: IdeaImage[] = [];
      for (const file of Array.from(files)) {
        try { added.push(await uploadIdeaImage(ideaId, file)); } catch (e) { toast.error(e instanceof Error ? e.message : "No se pudo subir la imagen."); }
      }
      if (added.length) await onUploaded(added);
    } catch (e) { toast.error(e instanceof Error ? e.message : "No se pudieron guardar las imágenes."); }
    finally { setBusy(false); if (input.current) input.current.value = ""; }
  };
  return <div className="space-y-4">
    <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" aria-label="Subir imágenes" onChange={e => void upload(e.target.files)} />
    <div className="flex flex-wrap items-center gap-3"><Button type="button" variant="outline" disabled={busy} onClick={() => input.current?.click()}><ImagePlus />{busy ? "Subiendo…" : "Agregar imágenes"}</Button><span className="text-xs text-muted-foreground">JPG, PNG, WebP o GIF · hasta 10 MB</span></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {images.map(image => <figure key={image.id} className="min-w-0 space-y-2">
        <PrivateImage image={image} onOpen={setExpanded} />
        <figcaption className="flex items-center gap-1"><Input aria-label="Nota de la imagen" placeholder="Nota de la imagen" value={image.caption} onChange={e => onChange(images.map(i => i.id === image.id ? { ...i, caption: e.target.value } : i))} /><Button type="button" size="icon" variant="ghost" title="Eliminar imagen" aria-label="Eliminar imagen" onClick={() => onRemove(image)}><Trash2 /></Button></figcaption>
      </figure>)}
    </div>
    <Dialog open={!!expanded} onOpenChange={o => !o && setExpanded(null)}><DialogContent className="sm:max-w-4xl"><DialogTitle>Imagen de la idea</DialogTitle><DialogDescription className="sr-only">Vista ampliada</DialogDescription>{expanded && <img src={expanded} alt="Imagen ampliada" className="max-h-[75vh] w-full object-contain" />}</DialogContent></Dialog>
  </div>;
}