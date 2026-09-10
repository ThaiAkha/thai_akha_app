-- 20260907200000_match_semantic_published_only.sql
-- /database · 2026-09-07 · per il passo 2 di Cherry (strumenti nella edge): `search_content`
-- chiamera' match_semantic. STATO: PROPOSTA, non applicata. Numero 190000 riservato all'altra chat.
-- Su GO: `supabase db query --linked -f <file>` + `supabase migration repair --status applied 20260907200000`.
--
-- TRE DIFETTI di match_semantic (nata per il backfill #71 del 02/09; nessun chiamante nel codice):
-- 1. SECURITY DEFINER senza filtro di pubblicazione: restituisce id e somiglianza anche delle
--    righe NON pubblicate. Oggi akha_news ha 9 bozze su 16 con vettore e ingredients_library 12
--    non pubblicati su 204. Con la edge che poi legge i dettagli col service_role, search_content
--    porterebbe le BOZZE nelle risposte di Cherry.
-- 2. EXECUTE concesso ad anon e authenticated: chiunque con la anon key puo' interrogare la
--    somiglianza di tutto il catalogo, bozze comprese. La edge usera' il service_role.
-- 3. ivfflat con lists=10 su tabelle da 22-204 righe e probes=1 di default: MISURATO il 07/09,
--    top-3 esatto vs indice divergono su 10/10 campioni (recipes), 7/10 (akha_news), 5/15
--    (ingredients_library), 4/10 (culture_sections). Con probes=10 (= lists): 0 divergenze.
--    Ricerca esatta a costo nullo su tabelle di questa taglia.
--
-- COSA FA: stessa firma; filtra `is_published` dove la colonna esiste (lo chiede al catalogo, non a
-- una lista a mano: recipes, ingredients_library, akha_news, culture_sections, e chi la avra' domani); alza probes a
-- 10 per la sola durata della chiamata; revoca anon e authenticated, resta service_role.
-- NON FA: non tocca `is_active` (page_sections, content_categories: tutte vive oggi), non tocca
-- gli indici, non tocca la edge generate-embeddings ne' il cron.

create or replace function public.match_semantic(query_embedding vector, match_table text, match_count integer default 5)
returns table(id text, similarity double precision)
language plpgsql security definer set search_path to 'public' as $function$
declare v_where text := 'semantic_vector is not null';
begin
  if match_table not in ('site_metadata','recipes','culture_sections','akha_news','ingredients_library',
                         'media_assets','content_categories','cooking_classes','page_sections','audio_assets','video_assets') then
    raise exception 'table % not allowed', match_table;
  end if;
  -- 2026-09-07: mai una bozza nei risultati. La colonna si scopre dal catalogo.
  if exists (select 1 from pg_attribute a join pg_class c on c.oid = a.attrelid
             join pg_namespace n on n.oid = c.relnamespace
             where n.nspname = 'public' and c.relname = match_table and a.attname = 'is_published'
               and a.attnum > 0 and not a.attisdropped) then
    v_where := v_where || ' and is_published';
  end if;
  -- 2026-09-07: ivfflat lists=10 su tabelle piccole: con probes=1 il top-3 non e' garantito.
  perform set_config('ivfflat.probes', '10', true);
  return query execute format(
    'select id::text, 1 - (semantic_vector <=> $1) as similarity from public.%I where %s order by semantic_vector <=> $1 limit %s',
    match_table, v_where, match_count::int) using query_embedding;
end $function$;
comment on function public.match_semantic(vector, text, integer) is
  'Ricerca semantica per tabella (allowlist). Solo righe pubblicate dove esiste is_published; probes=lists per risultati esatti. Chiamata dalla edge col service_role: anon e authenticated NON hanno EXECUTE (2026-09-07).';

revoke execute on function public.match_semantic(vector, text, integer) from public, anon, authenticated;
grant execute on function public.match_semantic(vector, text, integer) to service_role;

-- VERIFICA DOPO (attesi):
-- select count(*) from public.match_semantic((select semantic_vector from public.akha_news where not is_published limit 1), 'akha_news', 16);
--   -> 7 (solo pubblicate; prima 16)
-- select count(*) from public.match_semantic((select semantic_vector from public.ingredients_library limit 1), 'ingredients_library', 300);  -> 192
-- select grantee from information_schema.role_routine_grants where routine_name='match_semantic';  -> postgres, service_role
-- test di recall esatto vs indice sulle 4 tabelle: 0 divergenze
-- salute A-F -> 0 (E: search_path presente)
