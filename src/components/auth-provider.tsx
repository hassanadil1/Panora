"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type Profile = {
  _id: string;
  name: string;
  email: string;
  imageUrl?: string;
};

type AuthState = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

async function ensureProfile(user: User): Promise<Profile | null> {
  const supabase = createClient();
  const name =
    (user.user_metadata?.name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Panora user";

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    name,
    email: user.email ?? "",
    image_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Could not save profile", error.message);
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, name, email, image_url")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) return null;

  return {
    _id: data.id,
    name: data.name,
    email: data.email,
    imageUrl: data.image_url ?? undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      if (!data.session?.user) setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    ensureProfile(user).then((next) => {
      if (!active) return;
      setProfile(next);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user]);

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
