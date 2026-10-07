import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { parseSchemePublic } from "@/lib/schema/scheme";
import { primaryVerifiedTour } from "@/lib/schema/scheme";
import { TourViewerClient } from "@/components/tour/TourViewerClient";

type Props = { params: { slug: string } };

export default async function SchemeTourPage({ params }: Props) {
  const supabase = await createClient();
  const { data: raw, error } = await supabase.rpc("scheme_public", {
    p_slug: params.slug,
  });

  if (error || !raw) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-6">
        <p className="text-sm">Tour not found.</p>
        <Link href="/" className="text-sm underline">
          Back to map
        </Link>
      </main>
    );
  }

  const scheme = parseSchemePublic(raw);
  const tour = primaryVerifiedTour(scheme);

  if (!tour) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-6">
        <p className="text-sm">No verified tour for this scheme yet.</p>
        <Link href={`/s/${params.slug}`} className="text-sm underline">
          Back to {scheme.name}
        </Link>
      </main>
    );
  }

  const { data: allowlistRows } = await supabase
    .from("embed_allowlist")
    .select("host");

  const allowlistHosts = (allowlistRows ?? []).map((r) => r.host);

  return (
    <div className="flex h-[100dvh] flex-col">
      <header className="flex items-center justify-between border-b px-4 py-2 text-sm">
        <Link href={`/s/${params.slug}`} className="underline">
          ← {scheme.name}
        </Link>
        <span className="text-muted-foreground">{tour.title}</span>
      </header>
      <div className="min-h-0 flex-1">
        <TourViewerClient
          schemeSlug={params.slug}
          schemeName={scheme.name}
          tour={tour}
          allowlistHosts={allowlistHosts}
        />
      </div>
    </div>
  );
}
