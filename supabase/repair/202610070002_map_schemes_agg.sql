-- Fix: aggregate function calls cannot contain window function calls (map_schemes).
-- Run this in the SQL editor if the full migration already failed at map_schemes.

create or replace function public.map_schemes(p_city text)
returns jsonb
language sql
stable
security invoker
as $$
  select jsonb_build_object(
    'type', 'FeatureCollection',
    'features', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'type',       'Feature',
            'id',         sub.fid,
            'geometry',   sub.geom,
            'properties', sub.props
          )
          order by sub.fid
        )
        from (
          select
            row_number() over (order by s.slug) as fid,
            st_asgeojson(
              st_reduceprecision(s.geom, 0.000001)
            )::jsonb as geom,
            jsonb_build_object(
              'slug',     s.slug,
              'name',     s.name,
              'short',    coalesce(s.short_name, s.name),
              'tier',     s.tier,
              'color',    s.color_key,
              'has_tour', exists (
                select 1 from public.tours t
                where t.scheme_id = s.id
                  and t.state = 'verified'
              )
            ) as props
          from public.schemes s
          join public.cities c on c.id = s.city_id
          where c.slug = p_city
            and s.published
        ) sub
      ),
      '[]'::jsonb
    )
  )
$$;

grant execute on function public.map_schemes(text) to anon, authenticated;
