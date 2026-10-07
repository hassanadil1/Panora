"use client";

import { createClient } from "@/lib/supabase/client";

const ANON_KEY = "panora_anon_id";

function getAnonId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem(ANON_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANON_KEY, id);
  }
  return id;
}

export type TrackEventInput = {
  kind: string;
  schemeId?: string;
  meta?: Record<string, unknown>;
};

export async function trackEvent(input: TrackEventInput): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("events").insert({
      user_id: user?.id ?? null,
      anon_id: user ? null : getAnonId(),
      scheme_id: input.schemeId ?? null,
      kind: input.kind,
      meta: input.meta ?? null,
    });
  } catch {
    // Analytics must not break UX
  }
}
