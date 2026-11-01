import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { GardenProvider, useGarden } from "@/lib/garden-store";
import { AppShell } from "@/components/garden/AppShell";
import { GardenLoader } from "@/components/garden/GardenLoader";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  pendingComponent: GardenLoader,
  component: AuthedLayout,
});

function Body() {
  const { loading } = useGarden();
  return loading ? <GardenLoader inline /> : <Outlet />;
}

function AuthedLayout() {
  return (
    <GardenProvider>
      <AppShell>
        <Body />
      </AppShell>
    </GardenProvider>
  );
}
