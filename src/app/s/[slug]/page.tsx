import { MapHome } from "@/components/map/MapHome";
import { createClient } from "@/lib/supabase/server";

type Props = { params: { slug: string } };

export default async function SchemeMapPage({ params }: Props) {
  const supabase = await createClient();
  const { data: city } = await supabase
    .from("cities")
    .select("live")
    .eq("slug", "lahore")
    .maybeSingle();

  if (!city?.live) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-center text-sm">
        Map is not available yet. Apply Supabase seed SQL.
      </main>
    );
  }

  return <MapHome slug={params.slug} />;
}
