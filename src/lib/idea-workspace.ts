import { z } from "zod";

export const IMAGE_BUCKET = "idea-images";
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const imageSchema = z.object({ id: z.string(), path: z.string(), caption: z.string() });
const sectionSchema = z.object({
  id: z.string(), title: z.string(),
  kind: z.enum(["notes", "gallery", "checklist", "progress", "links", "custom"]),
  document: z.record(z.unknown()).optional(),
  images: z.array(imageSchema).default([]),
  tasks: z.array(z.object({ id: z.string(), text: z.string(), done: z.boolean() })).default([]),
  entries: z.array(z.object({ id: z.string(), date: z.string(), text: z.string() })).default([]),
  links: z.array(z.object({ id: z.string(), label: z.string(), url: z.string() })).default([]),
});
export const workspaceSchema = z.object({ version: z.literal(1), sections: z.array(sectionSchema) });
export type Workspace = z.infer<typeof workspaceSchema>;
export type IdeaSection = Workspace["sections"][number];
export type IdeaImage = IdeaSection["images"][number];
export const SECTION_TYPES: { kind: IdeaSection["kind"]; label: string }[] = [
  { kind: "notes", label: "Notas" }, { kind: "gallery", label: "Galería de imágenes" },
  { kind: "checklist", label: "Checklist" }, { kind: "progress", label: "Seguimiento de avances" },
  { kind: "links", label: "Enlaces" }, { kind: "custom", label: "Sección personalizada" },
];
export function newSection(kind: IdeaSection["kind"]): IdeaSection {
  return { id: crypto.randomUUID(), kind, title: SECTION_TYPES.find(s => s.kind === kind)?.label ?? "Sección", images: [], tasks: [], entries: [], links: [] };
}
export function validateImage(file: Pick<File, "type" | "size">): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return "Elige una imagen JPG, PNG, WebP o GIF.";
  if (file.size > MAX_IMAGE_BYTES) return "La imagen supera el máximo de 10 MB.";
  if (!file.size) return "La imagen está vacía.";
  return null;
}
export function checklistProgress(tasks: IdeaSection["tasks"]) {
  return { completed: tasks.filter(t => t.done).length, total: tasks.length };
}
export function safeExternalUrl(value: string): string | null {
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.href : null; } catch { return null; }
}