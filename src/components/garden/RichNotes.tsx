import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import { Bold, Italic, Heading2, List, ListOrdered, Highlighter, Undo2, Redo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RichNotes({ document, onChange, label }: { document?: Record<string, unknown> | undefined; onChange: (document: Record<string, unknown>) => void; label: string }) {
  const editor = useEditor({
    extensions: [StarterKit, Highlight], immediatelyRender: false,
    content: document ?? { type: "doc", content: [{ type: "paragraph" }] },
    editorProps: { attributes: { class: "rich-notes", role: "textbox", "aria-label": label, "aria-multiline": "true" } },
    onUpdate: ({ editor: instance }) => onChange(instance.getJSON()),
  });
  if (!editor) return null;
  const tools = [
    { label: "Negrita", icon: Bold, run: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
    { label: "Cursiva", icon: Italic, run: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
    { label: "Encabezado", icon: Heading2, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading") },
    { label: "Viñetas", icon: List, run: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
    { label: "Lista numerada", icon: ListOrdered, run: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") },
    { label: "Resaltar", icon: Highlighter, run: () => editor.chain().focus().toggleHighlight().run(), active: editor.isActive("highlight") },
    { label: "Deshacer", icon: Undo2, run: () => editor.chain().focus().undo().run(), active: false },
    { label: "Rehacer", icon: Redo2, run: () => editor.chain().focus().redo().run(), active: false },
  ];
  return <div className="overflow-hidden rounded-lg border border-input bg-card">
    <div className="flex flex-wrap gap-1 border-b border-border p-2" role="toolbar" aria-label="Formato de texto">
      {tools.map(t => <Button key={t.label} type="button" size="icon" variant={t.active ? "secondary" : "ghost"} title={t.label} aria-label={t.label} aria-pressed={t.active} onClick={t.run}><t.icon /></Button>)}
    </div>
    <EditorContent editor={editor} />
  </div>;
}