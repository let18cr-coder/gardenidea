import casa from "@/assets/cover-casa.jpg";
import viajes from "@/assets/cover-viajes.jpg";
import creativo from "@/assets/cover-creativo.jpg";
import personal from "@/assets/cover-personal.jpg";
import { Flower2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const IMAGE_COVERS: Record<string, string> = { casa, viajes, creativo, personal };

const COLOR_BG: Record<string, string> = {
  rosa: "bg-rose",
  salvia: "bg-sage",
  lavanda: "bg-lavender",
};

export const COVER_OPTIONS = [...Object.keys(IMAGE_COVERS), ...Object.keys(COLOR_BG)];

export function Cover({ cover, className, alt = "" }: { cover: string; className?: string; alt?: string }) {
  const img = IMAGE_COVERS[cover];
  if (img) return <img src={img} alt={alt} loading="lazy" className={cn("h-full w-full object-cover", className)} />;
  return (
    <div className={cn("flex h-full w-full items-center justify-center", COLOR_BG[cover] ?? "bg-sage", className)}>
      <Flower2 className="h-10 w-10 text-primary/60" aria-hidden />
    </div>
  );
}
