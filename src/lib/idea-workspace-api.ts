import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { IMAGE_BUCKET, validateImage, workspaceSchema, type Workspace } from "./idea-workspace";

export async function readWorkspace(id: string) {
  const { data, error } = await supabase.from("ideas").select("workspace,workspace_revision").eq("id", id).single();
  if (error) throw error;
  return { workspace: workspaceSchema.parse(data.workspace), revision: data.workspace_revision };
}
export async function writeWorkspace(id: string, workspace: Workspace, revision: number, title: string, description: string) {
  const parsed = workspaceSchema.parse(workspace);
  const { data, error } = await supabase.from("ideas").update({ workspace: parsed as Json, workspace_revision: revision + 1, title, description }).eq("id", id).eq("workspace_revision", revision).select("workspace_revision").maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Esta idea cambió en otra ventana. Recarga la página antes de volver a guardar.");
  return data.workspace_revision;
}
export async function uploadIdeaImage(ideaId: string, file: File) {
  const invalid = validateImage(file);
  if (invalid) throw new Error(invalid);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Inicia sesión para subir imágenes.");
  const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
  const id = crypto.randomUUID();
  const path = `${user.id}/${ideaId}/${id}.${extensions[file.type]}`;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error("No se pudo subir la imagen. Revisa tu conexión e inténtalo de nuevo.");
  return { id, path, caption: "" };
}
export async function removeIdeaImages(paths: string[]) {
  if (!paths.length) return;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove(paths);
  if (error) throw new Error("El contenido se guardó, pero no se pudo eliminar el archivo. Inténtalo de nuevo.");
}