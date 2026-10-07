import { createClient } from "@/lib/supabase/server";

export default async function AdminAllowlistPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("embed_allowlist")
    .select("host, label, created_at")
    .order("host");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Embed allowlist</h1>
      <p className="text-sm text-muted-foreground">
        Only these hosts may load inside Panora tour iframes. Add rows via SQL
        or Supabase table editor (admin RLS).
      </p>
      <ul className="divide-y rounded-lg border text-sm">
        {(rows ?? []).map((row) => (
          <li key={row.host} className="flex justify-between px-4 py-2">
            <span className="font-mono">{row.host}</span>
            <span className="text-muted-foreground">{row.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
