import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BookHeart, Flower2, Lightbulb, Menu, Plus, Sprout, TrendingUp } from "lucide-react";
import { useGarden } from "@/lib/garden-store";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { IdeaEditor } from "./IdeaEditor";

const NAV = [
  { to: "/", label: "Mi jardín", icon: Sprout },
  { to: "/cuadernos", label: "Mis cuadernos", icon: BookHeart },
  { to: "/ideas", label: "Todas mis ideas", icon: Lightbulb },
  { to: "/progreso", label: "Mi progreso", icon: TrendingUp },
] as const;

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-lg">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose">
        <Flower2 className="h-5 w-5 text-primary" aria-hidden />
      </span>
      <span className="font-serif text-xl font-medium">Idea Garden</span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Principal" className="space-y-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact: to === "/" }}
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-foreground"
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { openEditor } = useGarden();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
        Saltar al contenido
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-8 border-r border-border bg-card/80 p-6 backdrop-blur lg:flex">
        <Brand />
        <NavLinks />
        <div className="mt-auto space-y-4">
          <Button onClick={() => openEditor()} className="w-full rounded-full">
            <Plus className="h-4 w-4" /> Plantar una idea
          </Button>
          <p className="px-1 font-serif text-sm italic text-muted-foreground">“Every great idea starts with a little seed.”</p>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <div className="flex items-center gap-1">
          <Button size="icon" onClick={() => openEditor()} className="rounded-full" aria-label="Plantar una idea">
            <Plus className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setOpen(true)} aria-label="Abrir menú" className="rounded-full">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 bg-card p-6">
          <SheetTitle className="sr-only">Menú</SheetTitle>
          <div className="space-y-8">
            <Brand />
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <main id="main" className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-12">{children}</div>
      </main>
      <IdeaEditor />
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>}
        <h1 className="text-3xl font-medium sm:text-4xl">{title}</h1>
        {subtitle && <p className="max-w-xl text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
