"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Tier } from "@/lib/schema/database.types";

export default function AdminSchemeEditPage() {
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    blurb: "",
    published: false,
    tier: "premium",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("schemes")
      .select("name, slug, blurb, published, tier")
      .eq("id", params.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setMessage(error.message);
        else if (data) setForm(data as typeof form);
        setLoading(false);
      });
  }, [params.id]);

  const save = async () => {
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase
      .from("schemes")
      .update({
        name: form.name,
        blurb: form.blurb,
        published: form.published,
        tier: form.tier as Tier,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id);
    setMessage(error ? error.message : "Saved.");
  };

  if (loading) return <p className="text-sm">Loading…</p>;

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Link href="/admin/schemes" className="text-sm underline">
        ← All schemes
      </Link>
      <h1 className="text-xl font-semibold">Edit {form.name}</h1>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Slug</Label>
        <Input value={form.slug} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="blurb">Blurb</Label>
        <Textarea
          id="blurb"
          rows={4}
          value={form.blurb ?? ""}
          onChange={(e) => setForm({ ...form, blurb: e.target.value })}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm({ ...form, published: e.target.checked })}
        />
        Published on map
      </label>
      <Button type="button" onClick={save}>
        Save
      </Button>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      <p className="text-xs text-muted-foreground">
        Polygon editing via <code>save_scheme_geom</code> RPC is available in a
        follow-up geometry admin screen. For now, update geometry in SQL or
        Supabase dashboard.
      </p>
      {form.published && (
        <Button asChild variant="outline">
          <Link href={`/s/${form.slug}`}>View on map</Link>
        </Button>
      )}
    </div>
  );
}
