"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useSchemeId(slug: string | undefined) {
  return useQuery({
    queryKey: ["scheme-id", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("schemes")
        .select("id")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data?.id as string | undefined;
    },
  });
}
