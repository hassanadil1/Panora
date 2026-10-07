import { MapHome } from "@/components/map/MapHome";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: city, error } = await supabase
    .from("cities")
    .select("slug, name, live")
    .eq("slug", "lahore")
    .maybeSingle();

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-semibold">Panora map</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Could not reach Supabase ({error.message}). Check{" "}
          <code className="text-xs">.env.local</code> and that migrations are
          applied.
        </p>
      </main>
    );
  }

  if (!city?.live) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-xl font-semibold">Panora map</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Lahore is not marked live yet. Run{" "}
          <code className="text-xs">supabase/seed/lahore.sql</code> in the SQL
          editor.
        </p>
      </main>
    );
  }

  return <MapHome />;
}
