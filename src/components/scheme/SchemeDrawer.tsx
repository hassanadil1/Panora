"use client";

import Link from "next/link";
import { Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  primaryVerifiedTour,
  useSchemePublic,
} from "@/hooks/use-scheme-public";
import { useSchemeId } from "@/hooks/use-scheme-id";
import { useSchemeFavourite } from "@/hooks/use-scheme-favourite";
import { useAuth } from "@/components/auth-provider";
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

  if (!slug) return null;

  return (
    <aside
      className="pointer-events-auto absolute bottom-0 right-0 top-14 z-20 flex w-full max-w-md flex-col border-l bg-card shadow-xl md:top-0 md:max-h-full"
      aria-label="Scheme details"
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
        {tour?.url ? (
          <Button asChild className="w-full" size="lg">
            <Link
              href={`/s/${slug}/tour`}
              onClick={() =>
                trackEvent({ kind: "tour_open", meta: { slug, tourId: tour.id } })
              }
            >
              Enter virtual tour
            </Link>
          </Button>
        ) : (
          <Button className="w-full" size="lg" disabled>
            Tour coming soon
          </Button>
        )}
        {!user && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            <Link href="/sign-in" className="underline">
              Sign in
            </Link>{" "}
            to save favourites
          </p>
        )}
      </div>
    </aside>
  );
}
