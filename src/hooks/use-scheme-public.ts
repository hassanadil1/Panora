"use client";

import { useQuery } from "@tanstack/react-query";
import { parseSchemePublic, type SchemePublic } from "@/lib/schema/scheme";
import { createClient } from "@/lib/supabase/client";

export function useSchemePublic(slug: string | undefined) {
  return useQuery({
    queryKey: ["scheme-public", slug],
    enabled: Boolean(slug),
    queryFn: async (): Promise<SchemePublic> => {
      if (!slug) throw new Error("Missing slug");
      const supabase = createClient();
      const { data, error } = await supabase.rpc("scheme_public", {
        p_slug: slug,
      });
      if (error) throw error;
      if (!data) throw new Error("Scheme not found");
      return parseSchemePublic(data);
    },
  });
}

export { primaryVerifiedTour } from "@/lib/schema/scheme";
