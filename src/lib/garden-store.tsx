import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Idea, Notebook, Stage } from "./garden";

type EditorState = { open: boolean; idea?: Idea; notebookId?: string };

type Store = {
  notebooks: Notebook[];
  ideas: Idea[];
  loading: boolean;
  saveIdea: (idea: Omit<Idea, "id" | "createdAt"> & { id?: string | undefined }) => void;
  deleteIdea: (id: string) => void;
  saveNotebook: (nb: Omit<Notebook, "id" | "createdAt"> & { id?: string | undefined }) => void;
  deleteNotebook: (id: string) => void;
  editor: EditorState;
  openEditor: (opts?: { idea?: Idea; notebookId?: string }) => void;
  closeEditor: () => void;
  updateIdeaLocal: (id: string, changes: Pick<Idea, "title" | "description">) => void;
};

const Ctx = createContext<Store | null>(null);

type NbRow = { id: string; name: string; description: string; cover: string; created_at: string };
type IdeaRow = {
  id: string; notebook_id: string; title: string; description: string; stage: string;
  tags: string[]; link: string | null; image: string | null; created_at: string;
};

const toNb = (r: NbRow): Notebook => ({ id: r.id, name: r.name, description: r.description, cover: r.cover, createdAt: Date.parse(r.created_at) });
const toIdea = (r: IdeaRow): Idea => ({
  id: r.id, notebookId: r.notebook_id, title: r.title, description: r.description, stage: r.stage as Stage,
  tags: r.tags ?? [], link: r.link ?? undefined, image: r.image ?? undefined, createdAt: Date.parse(r.created_at),
});

const fail = (msg: string) => (err: unknown) => {
  console.error(err);
  toast.error(msg);
};

export function GardenProvider({ children }: { children: ReactNode }) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState<EditorState>({ open: false });

  const reload = async () => {
    const [nb, id] = await Promise.all([
      supabase.from("notebooks").select("id,name,description,cover,created_at").order("created_at"),
      supabase.from("ideas").select("id,notebook_id,title,description,stage,tags,link,image,created_at").order("created_at", { ascending: false }),
    ]);
    if (nb.error || id.error) fail("No pudimos cargar tu jardín")(nb.error ?? id.error);
    setNotebooks((nb.data ?? []).map(toNb));
    setIdeas((id.data ?? []).map(toIdea));
    setLoading(false);
  };

  useEffect(() => { void reload(); }, []);

  const run = async (p: PromiseLike<{ error: unknown }>, msg: string) => {
    const { error } = await p;
    if (error) { fail(msg)(error); await reload(); }
  };

  const store: Store = {
    notebooks,
    ideas,
    loading,
    saveIdea: (idea) => {
      const row = {
        notebook_id: idea.notebookId, title: idea.title, description: idea.description, stage: idea.stage,
        tags: idea.tags, link: idea.link ?? null, image: idea.image ?? null,
      };
      if (idea.id) {
        const id = idea.id;
        setIdeas((xs) => xs.map((x) => (x.id === id ? { ...x, ...idea, id } : x)));
        void run(supabase.from("ideas").update(row).eq("id", id), "No se pudo guardar la idea");
      } else {
        const id = crypto.randomUUID();
        setIdeas((xs) => [{ ...idea, id, createdAt: Date.now() }, ...xs]);
        void run(supabase.from("ideas").insert({ ...row, id }), "No se pudo plantar la idea");
      }
    },
    deleteIdea: (id) => {
      setIdeas((xs) => xs.filter((x) => x.id !== id));
      void run(supabase.from("ideas").delete().eq("id", id), "No se pudo eliminar la idea");
    },
    saveNotebook: (nb) => {
      const row = { name: nb.name, description: nb.description, cover: nb.cover };
      if (nb.id) {
        const id = nb.id;
        setNotebooks((xs) => xs.map((x) => (x.id === id ? { ...x, ...nb, id } : x)));
        void run(supabase.from("notebooks").update(row).eq("id", id), "No se pudo guardar el cuaderno");
      } else {
        const id = crypto.randomUUID();
        setNotebooks((xs) => [...xs, { ...nb, id, createdAt: Date.now() }]);
        void run(supabase.from("notebooks").insert({ ...row, id }), "No se pudo crear el cuaderno");
      }
    },
    deleteNotebook: (id) => {
      setNotebooks((xs) => xs.filter((x) => x.id !== id));
      setIdeas((xs) => xs.filter((x) => x.notebookId !== id));
      void run(supabase.from("notebooks").delete().eq("id", id), "No se pudo eliminar el cuaderno");
    },
    editor,
    openEditor: (opts) => setEditor({ open: true, ...opts }),
    closeEditor: () => setEditor({ open: false }),
    updateIdeaLocal: (id, changes) => setIdeas(xs => xs.map(x => x.id === id ? { ...x, ...changes } : x)),
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useGarden() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useGarden outside provider");
  return c;
}
