import { Sprout } from "lucide-react";

export function GardenLoader({ inline }: { inline?: boolean }) {
  return (
    <div role="status" className={inline ? "flex min-h-[50vh] items-center justify-center" : "flex min-h-screen items-center justify-center bg-background"}>
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <span className="flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-secondary">
          <Sprout className="h-6 w-6 text-primary" aria-hidden />
        </span>
        <p className="font-serif italic">Regando tu jardín…</p>
      </div>
    </div>
  );
}
