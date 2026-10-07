import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireEditor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "editor" && profile?.role !== "admin") {
    redirect("/");
  }

  return { user, role: profile!.role };
}
