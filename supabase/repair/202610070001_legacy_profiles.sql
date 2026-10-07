-- Run this in Supabase SQL editor if init_postgis failed at is_editor() with:
--   column "role" does not exist
--
-- Then re-run the rest of 202610070001_init_postgis.sql from section 4 onward,
-- or run the full migration again (idempotent sections are safe).

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'role'
  ) then
    alter table public.profiles
      add column role text not null default 'user'
      check (role in ('user','editor','admin'));
    alter table public.profiles drop column if exists name;
    alter table public.profiles drop column if exists email;
    alter table public.profiles drop column if exists image_url;
    alter table public.profiles drop column if exists updated_at;
  end if;
end $$;
