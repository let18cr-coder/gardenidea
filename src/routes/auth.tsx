import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Flower2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar · Idea Garden" },
      { name: "description", content: "Inicia sesión o crea tu cuenta en Idea Garden." },
      { property: "og:title", content: "Entrar · Idea Garden" },
      { property: "og:description", content: "Inicia sesión o crea tu cuenta en Idea Garden." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        if (password.length < 6) return void toast.error("La contraseña debe tener al menos 6 caracteres.");
        if (password !== confirm) return void toast.error("Las contraseñas no coinciden.");
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { display_name: name } },
        });
        if (error) return void toast.error(error.message);
        toast.success("Revisa tu correo para confirmar tu cuenta.");
        setMode("login");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth` });
        if (error) return void toast.error(error.message);
        toast.success("Te enviamos un correo para recuperar tu contraseña.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return void toast.error("Correo o contraseña incorrectos.");
        navigate({ to: "/" });
      }
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) return void toast.error("No se pudo continuar con Google.");
    if (r.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm space-y-6 rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose">
            <Flower2 className="h-6 w-6 text-primary" aria-hidden />
          </span>
          <h1 className="text-2xl font-medium">
            {mode === "signup" ? "Crea tu jardín" : mode === "reset" ? "Recuperar contraseña" : "Bienvenida de nuevo"}
          </h1>
          <p className="font-serif text-sm italic text-muted-foreground">“Every great idea starts with a little seed.”</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5"><Label htmlFor="name">Nombre visible</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} /></div>
          )}
          <div className="space-y-1.5"><Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          {mode !== "reset" && (
            <div className="space-y-1.5"><Label htmlFor="pw">Contraseña</Label>
              <Input id="pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          )}
          {mode === "signup" && (
            <div className="space-y-1.5"><Label htmlFor="pw2">Confirmar contraseña</Label>
              <Input id="pw2" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
          )}
          <Button type="submit" disabled={busy} className="w-full rounded-full">
            {mode === "signup" ? "Crear cuenta" : mode === "reset" ? "Enviar correo" : "Iniciar sesión"}
          </Button>
        </form>
        {mode !== "reset" && (
          <Button type="button" variant="outline" onClick={google} className="w-full rounded-full">Continuar con Google</Button>
        )}
        <div className="flex flex-col items-center gap-1 text-sm">
          {mode === "login" && <>
            <button className="text-muted-foreground underline" onClick={() => setMode("reset")}>Olvidé mi contraseña</button>
            <button className="text-primary underline" onClick={() => setMode("signup")}>Crear cuenta</button>
          </>}
          {mode !== "login" && <button className="text-primary underline" onClick={() => setMode("login")}>Ya tengo cuenta</button>}
        </div>
      </div>
    </main>
  );
}
