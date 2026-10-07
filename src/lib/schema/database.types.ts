/** Hand-maintained until `supabase gen types typescript` is run against a linked project. */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "user" | "editor" | "admin";
export type Tier = "ultra" | "premium" | "upper";

export interface Database {
  public: {
    Tables: {
      cities: {
        Row: {
          id: number;
          slug: string;
          name: string;
          center: unknown;
          zoom: number;
          live: boolean;
        };
      };
      profiles: {
        Row: { id: string; role: UserRole };
        Insert: { id: string; role?: UserRole };
        Update: { role?: UserRole };
      };
      schemes: {
        Row: {
          id: string;
          city_id: number;
          slug: string;
          name: string;
          blurb: string | null;
          tier: Tier;
          published: boolean;
          updated_at: string;
        };
        Update: {
          name?: string;
          blurb?: string | null;
          tier?: Tier;
          published?: boolean;
          updated_at?: string;
        };
      };
      favs: {
        Row: { user_id: string; scheme_id: string };
        Insert: { user_id: string; scheme_id: string };
      };
      events: {
        Insert: {
          user_id?: string | null;
          anon_id?: string | null;
          scheme_id?: string | null;
          kind: string;
          meta?: Json | null;
        };
      };
      embed_allowlist: {
        Row: { host: string; label: string | null; created_at: string };
      };
    };
    Functions: {
      map_schemes: { Args: { p_city: string }; Returns: Json };
      scheme_public: { Args: { p_slug: string }; Returns: Json };
    };
  };
}
