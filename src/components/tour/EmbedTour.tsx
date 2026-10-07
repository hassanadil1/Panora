"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type EmbedTourProps = {
  url: string;
  owner: string | null;
  onReport?: () => void;
};

export function EmbedTour({ url, owner, onReport }: EmbedTourProps) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    setTimedOut(false);
    const timer = window.setTimeout(() => setTimedOut(true), 20_000);
    return () => window.clearTimeout(timer);
  }, [url]);

  return (
    <div className="relative flex h-full w-full flex-col bg-black">
      {timedOut && (
        <div className="absolute inset-x-0 top-0 z-10 bg-amber-950/90 px-4 py-2 text-center text-xs text-amber-100">
          Tour is taking longer than usual to load. Check your connection or try
          again.
        </div>
      )}
      <iframe
        title="Virtual tour"
        src={url}
        className="min-h-0 flex-1 border-0"
        allow="fullscreen; xr-spatial-tracking"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-white/10 px-4 py-2 text-xs text-white/80">
        <span>Tour © {owner ?? "Rights holder"}</span>
        {onReport && (
          <Button type="button" variant="ghost" size="sm" onClick={onReport}>
            Report issue
          </Button>
        )}
      </footer>
    </div>
  );
}
