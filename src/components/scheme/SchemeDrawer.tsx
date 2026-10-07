"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TourViewer } from "@/components/tour/TourViewer";
import {
  primaryVerifiedTour,
  useSchemePublic,
} from "@/hooks/use-scheme-public";
import { useSchemeId } from "@/hooks/use-scheme-id";
import { useSchemeFavourite } from "@/hooks/use-scheme-favourite";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics/track-event";

type SchemeDrawerProps = {
  slug: string | undefined;
  onClose: () => void;
};

export function SchemeDrawer({ slug, onClose }: SchemeDrawerProps) {
  const { data, isLoading, isError } = useSchemePublic(slug);
  const { data: schemeId } = useSchemeId(slug);
  const { user } = useAuth();
  const fav = useSchemeFavourite(schemeId);
  const tour = primaryVerifiedTour(data);
  const { data: allowlistHosts, isLoading: allowlistLoading } = useQuery({
    queryKey: ["embed-allowlist"],
    queryFn: async () => {
      const supabase = createClient();
      const { data: rows, error } = await supabase
        .from("embed_allowlist")
        .select("host");
      if (error) throw error;
      return (rows ?? []).map((row) => row.host);
    },
  });

  const tourId = tour?.id;
  useEffect(() => {
    if (!slug || !tourId) return;
    void trackEvent({ kind: "tour_open", meta: { slug, tourId } });
  }, [slug, tourId]);

  if (!slug) return null;

  return (
    <aside
      className="pointer-events-auto absolute bottom-0 left-0 top-14 z-20 flex w-full max-w-xl animate-in flex-col border-r bg-card shadow-xl duration-500 slide-in-from-left md:top-0"
      aria-label="Virtual tour"
    >
      <div className="flex items-start justify-between gap-2 border-b px-4 py-3">
        <div>
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {isError && (
            <p className="text-sm text-destructive">Could not load this scheme.</p>
          )}
          {data && (
            <>
              <h2 className="text-lg font-semibold leading-tight">{data.name}</h2>
              <div className="mt-1 flex flex-wrap gap-1">
                <Badge variant="secondary" className="capitalize">
                  {data.tier}
                </Badge>
                {data.developer?.name && (
                  <Badge variant="outline">{data.developer.name}</Badge>
                )}
              </div>
            </>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          {user && schemeId && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={fav.isFavourite ? "Remove favourite" : "Save favourite"}
              disabled={fav.pending}
              onClick={() => fav.toggle()}
            >
              <Heart
                className="h-5 w-5"
                fill={fav.isFavourite ? "currentColor" : "none"}
              />
            </Button>
          )}
          <Button type="button" size="icon" variant="ghost" aria-label="Close" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {tour?.url ? (
        <div className="min-h-0 flex-1 bg-black">
          {allowlistLoading || !allowlistHosts ? (
            <p className="p-4 text-sm text-white/80">Loading tour…</p>
          ) : (
            <TourViewer
              schemeSlug={slug}
              schemeName={data?.name ?? "Scheme"}
              tour={tour}
              allowlistHosts={allowlistHosts}
              onReport={() =>
                trackEvent({
                  kind: "tour_report",
                  meta: { slug, tourId: tour.id },
                })
              }
            />
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-4 text-sm">
            {data?.blurb && <p className="text-muted-foreground">{data.blurb}</p>}
            {data?.approval && (
              <p className="mt-3 text-xs">
                <span className="font-medium">Approval:</span> {data.approval}
              </p>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              Boundaries shown are indicative only and not for legal or surveying use.
            </p>
          </div>
          <div className="border-t p-4">
            <Button className="w-full" size="lg" disabled>
              Tour coming soon
            </Button>
            {!user && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                <Link href="/sign-in" className="underline">
                  Sign in
                </Link>{" "}
                to save favourites
              </p>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
