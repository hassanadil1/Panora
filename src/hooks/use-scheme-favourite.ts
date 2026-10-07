"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";

export function useSchemeFavourite(schemeId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["favourite", user?.id, schemeId],
    enabled: Boolean(user && schemeId),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("favs")
        .select("scheme_id")
        .eq("user_id", user!.id)
        .eq("scheme_id", schemeId!)
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },
  });

  const mutation = useMutation({
    mutationFn: async (next: boolean) => {
      const supabase = createClient();
      if (!user || !schemeId) throw new Error("Sign in to save favourites");
      if (next) {
        const { error } = await supabase
          .from("favs")
          .insert({ user_id: user.id, scheme_id: schemeId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favs")
          .delete()
          .eq("user_id", user.id)
          .eq("scheme_id", schemeId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favourite", user?.id, schemeId] });
      queryClient.invalidateQueries({ queryKey: ["favourites-list", user?.id] });
    },
  });

  return {
    isFavourite: query.data ?? false,
    loading: query.isLoading,
    toggle: () => mutation.mutate(!(query.data ?? false)),
    pending: mutation.isPending,
  };
}
