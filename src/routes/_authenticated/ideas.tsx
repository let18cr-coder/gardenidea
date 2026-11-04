import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useGarden } from "@/lib/garden-store";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/garden/AppShell";
import { IdeaBoard } from "@/components/garden/IdeaBoard";

export const Route = createFileRoute("/_authenticated/ideas")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Todas mis ideas · Idea Garden" },
      { name: "description", content: "Explora, busca y filtra todas las ideas de tu jardín." },
      { property: "og:title", content: "Todas mis ideas · Idea Garden" },
      { property: "og:description", content: "Todas tus ideas en un tablero de inspiración." },
    ],
  }),
  component: AllIdeas,
});

function AllIdeas() {
  const { ideas, openEditor } = useGarden();
  return (
    <>
      <PageHeader
        eyebrow="Tablero"
        title="Todas mis ideas"
        subtitle="Todo lo que has plantado, de todos tus cuadernos."
        action={<Button onClick={() => openEditor()} className="rounded-full"><Plus className="h-4 w-4" /> Agregar idea</Button>}
      />
      <IdeaBoard ideas={ideas} showNotebook />
    </>
  );
}
