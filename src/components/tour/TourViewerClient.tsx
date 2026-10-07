"use client";

import { TourViewer } from "@/components/tour/TourViewer";
import type { SchemeTour } from "@/lib/schema/scheme";
import { trackEvent } from "@/lib/analytics/track-event";

type Props = {
  schemeSlug: string;
  schemeName: string;
  tour: SchemeTour;
  allowlistHosts: string[];
};

export function TourViewerClient(props: Props) {
  return (
    <TourViewer
      {...props}
      onReport={() =>
        trackEvent({
          kind: "tour_report",
          meta: { slug: props.schemeSlug, tourId: props.tour.id },
        })
      }
    />
  );
}
