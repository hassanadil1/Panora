"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmbedTour } from "@/components/tour/EmbedTour";
import { isAllowedEmbedUrl } from "@/lib/tour/allowlist";
import type { SchemeTour } from "@/lib/schema/scheme";

type TourViewerProps = {
  schemeSlug: string;
  schemeName: string;
  tour: SchemeTour;
  allowlistHosts: string[];
  onReport?: () => void;
};

export function TourViewer({
  schemeSlug,
  schemeName,
  tour,
  allowlistHosts,
  onReport,
}: TourViewerProps) {
  if (tour.kind === "embed" && tour.url) {
    if (!isAllowedEmbedUrl(tour.url, allowlistHosts)) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-sm">This tour host is not on the allowlist.</p>
          <Button asChild variant="outline">
            <Link href={`/s/${schemeSlug}`}>Back to {schemeName}</Link>
          </Button>
        </div>
      );
    }
    return <EmbedTour url={tour.url} owner={tour.owner} onReport={onReport} />;
  }

  if (tour.kind === "external_link" && tour.url) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="max-w-md text-sm text-muted-foreground">
          You are leaving Panora to view a tour hosted by {tour.owner ?? "a third party"}.
        </p>
        <Button asChild>
          <a href={tour.url} target="_blank" rel="noopener noreferrer">
            Open tour
          </a>
        </Button>
        <Button asChild variant="ghost">
          <Link href={`/s/${schemeSlug}`}>Cancel</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm">Native 360° tours are coming soon for this scheme.</p>
      <Button asChild variant="outline">
        <Link href={`/s/${schemeSlug}`}>Back</Link>
      </Button>
    </div>
  );
}
