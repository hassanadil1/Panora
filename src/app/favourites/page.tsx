import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function FavouritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in?next=/favourites");

  const { data: favs, error: favError } = await supabase
    .from("favs")
    .select("scheme_id")
    .eq("user_id", user.id);

  if (favError) {
    return (
      <main className="mx-auto max-w-lg p-6">
        <p className="text-sm text-destructive">Could not load favourites.</p>
      </main>
    );
  }

  const schemeIds = (favs ?? []).map((f) => f.scheme_id);
  if (schemeIds.length === 0) {
    return (
      <main className="mx-auto max-w-lg space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Saved schemes</h1>
          <Link href="/" className="text-sm underline">
            Map
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          No favourites yet. Open a scheme on the map and tap the heart.
        </p>
      </main>
    );
  }

  const { data: schemes, error: schemeError } = await supabase
    .from("schemes")
    .select("id, slug, name, tier")
    .in("id", schemeIds)
    .eq("published", true)
    .order("name");

  if (schemeError) {
    return (
      <main className="mx-auto max-w-lg p-6">
        <p className="text-sm text-destructive">Could not load scheme details.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Saved schemes</h1>
        <Link href="/" className="text-sm underline">
          Map
        </Link>
      </div>
      {(schemes ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No published favourites to show.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {(schemes ?? []).map((scheme) => (
            <li key={scheme.id}>
              <Link
                href={`/s/${scheme.slug}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-accent"
              >
                <span>{scheme.name}</span>
                <span className="text-xs capitalize text-muted-foreground">
                  {scheme.tier}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
