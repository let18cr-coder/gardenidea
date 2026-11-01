import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { SEED_IDEAS, SEED_NOTEBOOKS, uid, type Idea, type Notebook } from "./garden";

const KEY = "idea-garden-v1";

type EditorState = { open: boolean; idea?: Idea; notebookId?: string };

type Store = {
  notebooks: Notebook[];
  ideas: Idea[];
  saveIdea: (idea: Omit<Idea, "id" | "createdAt"> & { id?: string | undefined }) => void;
  deleteIdea: (id: string) => void;
  saveNotebook: (nb: Omit<Notebook, "id" | "createdAt"> & { id?: string | undefined }) => void;
  deleteNotebook: (id: string) => void;
  editor: EditorState;
  openEditor: (opts?: { idea?: Idea; notebookId?: string }) => void;
  closeEditor: () => void;
};

const Ctx = createContext<Store | null>(null);

export function GardenProvider({ children }: { children: ReactNode }) {
  const [notebooks, setNotebooks] = useState<Notebook[]>(SEED_NOTEBOOKS);
  const [ideas, setIdeas] = useState<Idea[]>(SEED_IDEAS);
  const [loaded, setLoaded] = useState(false);
  const [editor, setEditor] = useState<EditorState>({ open: false });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data.notebooks)) setNotebooks(data.notebooks);
        if (Array.isArray(data.ideas)) setIdeas(data.ideas);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify({ notebooks, ideas }));
  }, [notebooks, ideas, loaded]);

  const store: Store = {
    notebooks,
    ideas,
    saveIdea: (idea) => {
      if (idea.id) setIdeas((xs) => xs.map((x) => (x.id === idea.id ? { ...x, ...idea, id: x.id } : x)));
      else setIdeas((xs) => [{ ...idea, id: uid(), createdAt: Date.now() }, ...xs]);
    },
    deleteIdea: (id) => setIdeas((xs) => xs.filter((x) => x.id !== id)),
    saveNotebook: (nb) => {
      if (nb.id) setNotebooks((xs) => xs.map((x) => (x.id === nb.id ? { ...x, ...nb, id: x.id } : x)));
      else setNotebooks((xs) => [...xs, { ...nb, id: uid(), createdAt: Date.now() }]);
    },
    deleteNotebook: (id) => {
      setNotebooks((xs) => xs.filter((x) => x.id !== id));
      setIdeas((xs) => xs.filter((x) => x.notebookId !== id));
    },
    editor,
    openEditor: (opts) => setEditor({ open: true, ...opts }),
    closeEditor: () => setEditor({ open: false }),
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useGarden() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useGarden outside provider");
  return c;
}
