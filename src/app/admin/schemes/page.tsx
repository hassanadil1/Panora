import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export default async function AdminSchemesPage() {
  const supabase = await createClient();
  const { data: schemes, error } = await supabase
    .from("schemes")
    .select("id, slug, name, tier, published, city_id, cities(slug)")
    .order("name");

  if (error) {
    return <p className="text-sm text-destructive">Failed to load schemes.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Schemes</h1>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Tier</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {(schemes ?? []).map((s) => (
              <tr key={s.id} className="border-b last:border-0">
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/schemes/${s.id}`}
                    className="font-medium underline"
                  >
                    {s.name}
                  </Link>
                </td>
                <td className="px-3 py-2 font-mono text-xs">{s.slug}</td>
                <td className="px-3 py-2 capitalize">{s.tier}</td>
                <td className="px-3 py-2">
                  <Badge variant={s.published ? "default" : "secondary"}>
                    {s.published ? "Published" : "Draft"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
