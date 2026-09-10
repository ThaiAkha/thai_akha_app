-- 20260907210000_match_semantic_gate_come_la_rls.sql
-- /database · 2026-09-07 · correzione di un buco nella MIA 20260907200000, trovato rivedendo
-- la prima fetta degli strumenti. STATO: PROPOSTA, non applicata.
-- Su GO: `supabase db query --linked -f <file>` + `migration repair --status applied 20260907210000`.
--
-- IL BUCO. La 200000 filtra `is_published` su ogni tabella che ha quella colonna. Ma il
-- cancello pubblico VERO, quello che la RLS applica ad anon, e' diverso da tabella a tabella:
--   recipes            Public Read           is_published OR is_admin()                    -> is_published: GIUSTO
--   culture_sections   Public Read           is_published OR is_admin()                    -> is_published: GIUSTO
--   ingredients_library Public Read          is_visible_public OR is_staff()               -> COLONNA SBAGLIATA
--   akha_news          Read News by Access   is_published AND access_level='public' OR ...  -> INCOMPLETO
-- Oggi i numeri coincidono per caso (192 = 192 sugli ingredienti, 7 = 7 sulle news, zero
-- divergenze misurate), quindi non e' scattato nulla. Ma il giorno che un articolo esce
-- `is_published` con `access_level='internal'` (valore previsto dalla policy, per admin,
-- manager e agenzie), `search_content` lo servirebbe a un ospite qualsiasi.
--
-- PERCHE' NON SI PUO' FARE IN MODO ELEGANTE. La cura pulita sarebbe "rispondi come il
-- pubblico": una SECURITY DEFINER che fa `set local role anon` e lascia decidere alla RLS,
-- senza copiare nessuna regola. Postgres lo VIETA (provato il 07/09 in transazione annullata):
--   ERROR 42501: cannot set parameter "role" within security-definer function
-- L'alternativa SECURITY INVOKER funziona (verificato: da anon la RLS filtra e l'ordinamento
-- per vettore regge, 7 news / 192 ingredienti / 22 ricette / 25 culture) ma sposta il problema
-- sul chiamante: con la chiave service_role la RLS e' bypassata e le bozze tornano. Sarebbe un
-- cambio coordinato DB + edge, e finche' non e' deployato varrebbe il contrario di quel che dice.
--
-- QUINDI: una mappa esplicita, tabella -> predicato, che RICOPIA le policy. E' la duplicazione
-- che ho tolto due volte oggi (lingue, zone) e qui non si puo' evitare: la scrivo dichiarandola,
-- col controllo di deriva qui sotto, invece di lasciarla implicita in una colonna indovinata.
--
-- LA DIFESA VERA RESTA A VALLE, e va detta alla chat Cherry: il fetch di DETTAGLIO nella edge
-- va fatto con la chiave ANON, non col service role. Cosi' e' la RLS a decidere cosa esce, per
-- tutte e tre le forme di cancello, senza nessun filtro scritto a mano; questa mappa serve solo
-- a non sprecare i 3 posti del top-N su righe che poi spariranno.

create or replace function public.match_semantic(query_embedding vector, match_table text, match_count integer default 5)
returns table(id text, similarity double precision)
language plpgsql security definer set search_path to 'public' as $function$
declare v_where text;
begin
  -- Mappa esplicita: SPECCHIO delle policy "Public Read" / "Read News by Access Level".
  -- Se una policy cambia, questa riga va cambiata con lei (controllo di deriva in coda al file).
  v_where := case match_table
    when 'recipes'             then 'is_published'
    when 'culture_sections'    then 'is_published'
    when 'ingredients_library' then 'is_visible_public'                          -- NON is_published
    when 'akha_news'           then E'is_published and access_level = \'public\''  -- internal e\' per lo staff
    when 'site_metadata'       then null
    when 'content_categories'  then 'is_active'
    when 'cooking_classes'     then 'is_active'
    when 'page_sections'       then null
    when 'media_assets'        then null
    when 'audio_assets'        then null
    when 'video_assets'        then null
    else '__vietata__'
  end;
  if v_where = '__vietata__' then
    raise exception 'table % not allowed', match_table;
  end if;
  -- ivfflat lists=10 su tabelle da 22-204 righe: con probes=1 il top-3 non e' garantito
  -- (misurato il 07/09: 10/10 campioni sbagliati sulle ricette). probes = lists = esatto.
  perform set_config('ivfflat.probes', '10', true);
  return query execute format(
    'select id::text, 1 - (semantic_vector <=> $1) as similarity from public.%I where semantic_vector is not null%s order by semantic_vector <=> $1 limit %s',
    match_table, case when v_where is null then '' else ' and ' || v_where end, match_count::int)
    using query_embedding;
end $function$;

comment on function public.match_semantic(vector, text, integer) is
  'Ricerca semantica per tabella (allowlist). Il filtro e'' uno SPECCHIO delle policy Public Read, diverse per tabella: recipes/culture is_published, ingredients_library is_visible_public, akha_news is_published AND access_level=public. Non e'' il confine di sicurezza: quello e'' la RLS sul fetch di DETTAGLIO, che va fatto con la chiave anon. probes=lists per risultati esatti. Chiamata col service_role (2026-09-07).';

-- CONTROLLO DI DERIVA (da rilanciare quando si tocca una policy Public Read):
-- select tablename, qual from pg_policies
--  where schemaname='public' and cmd='SELECT'
--    and tablename in ('recipes','culture_sections','ingredients_library','akha_news','content_categories','cooking_classes');
-- Il predicato di ogni riga, tolti i rami staff/admin, deve combaciare con la mappa qui sopra.
--
-- VERIFICA DOPO (attesi, misurati il 07/09 col vecchio filtro: identici, zero righe cambiano):
-- select count(*) from public.match_semantic((select semantic_vector from public.akha_news limit 1), 'akha_news', 50);            -> 7
-- select count(*) from public.match_semantic((select semantic_vector from public.ingredients_library limit 1), 'ingredients_library', 300); -> 192
-- select count(*) from public.match_semantic((select semantic_vector from public.recipes limit 1), 'recipes', 50);                -> 22
-- select count(*) from public.match_semantic((select semantic_vector from public.culture_sections limit 1), 'culture_sections', 50); -> 25
-- select public.match_semantic((select semantic_vector from public.recipes limit 1), 'bookings', 1);  -> ERROR table bookings not allowed
-- salute A-F -> 0
