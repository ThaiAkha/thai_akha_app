-- nap-address-canonical.sql  ·  v2 (2026-08-02)
-- Allineamento NAP indirizzo alla forma CANONICA decisa dall'owner il 2026-08-03.
--
-- CANONICA (una riga):
--   14/10 Rat Chiang Saen 2 Ko. Alley, Tambon Hai Ya, Muang District, Chiang Mai 50100, Thailand
-- Layout postale su due righe:
--   14/10 Rat Chiang Saen 2 Ko. Alley, Tambon Hai Ya
--   Muang District, Chiang Mai 50100, Thailand
--
-- ⚠️ LEGGERE PRIMA DI ESEGUIRE
-- La via corretta e' "Rat Chiang Saen 2 Ko. Alley". NON e' una resa di Google Maps da
-- normalizzare: e' l'indirizzo giusto, a cui mancava solo la coda amministrativa
-- (Tambon Hai Ya, Muang District). Due tentativi di normalizzazione l'hanno riscritta:
--   forma A -> "14/10 Soi 2 Ko, Rat Chiang Saen Road, Hai Ya Sub-district, ..."
--   forma C -> "14/10 Soi Rat Chiang Saen 2 Ko., Rat Chiang Saen Rd, Hai Ya, ..."
-- Entrambe sbagliate. Questo script rimette la via giusta e aggiunge la coda.
--
-- ✅ GIA' ESEGUITO il 2026-08-02 su mtqullobcsypkqgdkaob. §4 a zero su tutte e sette
--    le tabelle, 40 righe canoniche. Backup in _nap_backup_20260803, non ancora droppato.
--    Lo script resta qui perche' e' IDEMPOTENTE: rilanciarlo non fa danno e serve da
--    rete per righe nuove che nascessero con la forma vecchia.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- CHANGELOG v1 -> v2: tre difetti chiusi
--
--   1. DUPLICAZIONE DELLA CODA. Il target della v1 ('14/10 Soi 2 Ko, Rat Chiang Saen
--      Road') era piu' corto della stringa reale: sostituiva la via e lasciava in
--      piedi ', Hai Ya Sub-district, Mueang Chiang Mai District'. Tutte e 6 le righe
--      site_metadata.json_ld sarebbero diventate:
--        "...Tambon Hai Ya, Muang District, Hai Ya Sub-district, Mueang Chiang Mai District"
--      cioe' il distretto due volte, in due lingue, dentro lo structured data che
--      Google legge. Chiuso: le replace ora partono dalla stringa PIU' LUNGA e la
--      coda vecchia se ne va insieme alla via.
--
--   2. 23 RIGHE RESTAVANO MONCHE. 17 content_categories, 1 akha_news e 5
--      site_metadata.page_essentials avevano gia' la via giusta ma SENZA coda. La
--      WHERE della v1 le escludeva e la §4 non controllava la coda: sarebbe passata
--      verde lasciandole incomplete, con per giunta due grafie diverse dentro
--      page_essentials. Chiuso: la coda si aggiunge anche alla via nuda, e la §4
--      adesso conta le righe canoniche invece di limitarsi a contare i residui.
--
--   3. faq_questions ERA IN §4 MA NON AVEVA UPDATE. Tre righe, nessun carve-out
--      dichiarato: sembrava una dimenticanza, non una scelta. La §4 non poteva dare
--      zero. Chiuso: faq_questions entra nel backup e negli UPDATE.
--
--   In piu': legal_documents e le 6 traduzioni NON sono piu' escluse. /terms ha
--   deciso il 2026-08-02 per l'errata corrige SENZA bump di legal_version (un
--   indirizzo e' un fatto, non un termine contrattuale). Senza bump la guardia
--   anti-stale non scatta e le pagine agency restano tradotte in TH, ZH ed ES.
--   Dopo l'esecuzione serve `npm run gen-legal` per propagare ai 10 file .ts.
-- ─────────────────────────────────────────────────────────────────────────────
--
-- GO-GATE: non eseguire in blocco. Sezione 0 (backup) e sezione 1 (censimento)
-- prima, si guardano i numeri, poi si eseguono le sezioni 2 e 3.


-- ─────────────────────────────────────────────────────────────────────────────
-- 0. BACKUP delle righe interessate (tabella temporanea, resta finche' non la droppi)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists _nap_backup_20260803 as
select 'content_categories' as tbl, id::text as row_id, to_jsonb(t.*) as snapshot
  from content_categories t where to_jsonb(t.*)::text ilike '%Rat Chiang Saen%'
union all
select 'site_metadata', id::text, to_jsonb(t.*)
  from site_metadata t where to_jsonb(t.*)::text ilike '%Rat Chiang Saen%'
union all
select 'akha_news', id::text, to_jsonb(t.*)
  from akha_news t where to_jsonb(t.*)::text ilike '%Rat Chiang Saen%'
union all
select 'business_profile', id::text, to_jsonb(t.*)
  from business_profile t
union all
select 'legal_documents', id::text, to_jsonb(t.*)
  from legal_documents t where to_jsonb(t.*)::text ilike '%Rat Chiang Saen%'
union all
select 'legal_documents_translations', id::text, to_jsonb(t.*)
  from legal_documents_translations t where to_jsonb(t.*)::text ilike '%Rat Chiang Saen%'
union all
select 'faq_questions', id::text, to_jsonb(t.*)          -- ← difetto 3
  from faq_questions t where to_jsonb(t.*)::text ilike '%Rat Chiang Saen%';

select tbl, count(*) as righe_salvate from _nap_backup_20260803 group by tbl order by tbl;


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CENSIMENTO: quale forma vive dove, PRIMA di scrivere
--    coda_mancante e' la colonna che nella v1 non c'era: sono le righe con la via
--    giusta ma senza "Tambon Hai Ya, Muang District", quelle che passavano inosservate.
-- ─────────────────────────────────────────────────────────────────────────────
with scan as (
  select 'content_categories' t, to_jsonb(x.*)::text d from content_categories x
  union all select 'site_metadata',    to_jsonb(x.*)::text from site_metadata x
  union all select 'akha_news',        to_jsonb(x.*)::text from akha_news x
  union all select 'business_profile', to_jsonb(x.*)::text from business_profile x
  union all select 'legal_documents',  to_jsonb(x.*)::text from legal_documents x
  union all select 'legal_documents_translations', to_jsonb(x.*)::text from legal_documents_translations x
  union all select 'faq_questions',    to_jsonb(x.*)::text from faq_questions x
)
select t,
  count(*) filter (where d ilike '%Ko. Alley, Tambon Hai Ya, Muang District%') as canonica,
  count(*) filter (where d ilike '%Ko. Alley%'
                     and d not ilike '%Ko. Alley, Tambon Hai Ya, Muang District%') as coda_mancante,
  count(*) filter (where d ilike '%Soi 2 Ko%')                  as forma_A,
  count(*) filter (where d ilike '%Soi Rat Chiang Saen 2 Ko.%') as forma_C
from scan
group by t
having count(*) filter (where d ilike '%Rat Chiang Saen%') > 0
order by t;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. LA CATENA DI NORMALIZZAZIONE, una volta sola, riusata da tutte le tabelle
--
--    Due accorgimenti che nella v1 mancavano:
--
--    a) le replace vanno dalla stringa PIU' LUNGA alla piu' corta. Una replace corta
--       eseguita per prima consuma la via e lascia orfana la coda vecchia: e' il
--       difetto 1. L'ordine qui sotto NON e' cosmetico, non riordinarlo.
--
--    b) il sentinella @@CANON@@ rende la funzione IDEMPOTENTE. Senza, la regola che
--       aggiunge la coda alla via nuda ("14/10 Rat Chiang Saen 2 Ko. Alley")
--       colpirebbe anche le righe gia' sistemate, che quella via nuda la contengono
--       come prefisso, e la coda finirebbe due volte. Si marca prima il canonico,
--       si aggiunge la coda solo a cio' che resta, si scioglie il sentinella alla fine.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function _nap_fix(s text) returns text language sql immutable as $$
  select replace(replace(replace(replace(replace(replace(replace(
    $1,
    -- forma C completa
    '14/10 Soi Rat Chiang Saen 2 Ko., Rat Chiang Saen Rd, Hai Ya, Mueang Chiang Mai',
    '14/10 Rat Chiang Saen 2 Ko. Alley, Tambon Hai Ya, Muang District, Chiang Mai'),
    -- forma A completa
    '14/10 Soi 2 Ko, Rat Chiang Saen Road, Hai Ya Sub-district, Mueang Chiang Mai District',
    '14/10 Rat Chiang Saen 2 Ko. Alley, Tambon Hai Ya, Muang District'),
    -- forma A abbreviata (quella che gira in AGENTS.md e nelle FAQ)
    '14/10 Soi 2 Ko, Rat Chiang Saen Rd, Hai Ya, Mueang Chiang Mai',
    '14/10 Rat Chiang Saen 2 Ko. Alley, Tambon Hai Ya, Muang District, Chiang Mai'),
    -- forma A troncata
    '14/10 Soi 2 Ko, Rat Chiang Saen Road, Hai Ya Sub-district',
    '14/10 Rat Chiang Saen 2 Ko. Alley, Tambon Hai Ya, Muang District'),
    -- forma C troncata
    '14/10 Soi Rat Chiang Saen 2 Ko., Rat Chiang Saen Rd',
    '14/10 Rat Chiang Saen 2 Ko. Alley, Tambon Hai Ya, Muang District'),
    -- marca il canonico prima di toccare la via nuda (idempotenza)
    '14/10 Rat Chiang Saen 2 Ko. Alley, Tambon Hai Ya, Muang District',
    '@@CANON@@'),
    -- via giusta ma senza coda -> difetto 2
    '14/10 Rat Chiang Saen 2 Ko. Alley',
    '@@CANON@@')
$$;

create or replace function _nap_done(s text) returns text language sql immutable as $$
  select replace(_nap_fix($1), '@@CANON@@',
                 '14/10 Rat Chiang Saen 2 Ko. Alley, Tambon Hai Ya, Muang District')
$$;

-- Prova a secco della funzione: le quattro forme devono convergere, e la canonica
-- deve restare identica a se stessa (idempotenza).
select _nap_done('14/10 Soi 2 Ko, Rat Chiang Saen Road, Hai Ya Sub-district, Mueang Chiang Mai District, Chiang Mai 50100, Thailand') as da_forma_A,
       _nap_done('14/10 Soi Rat Chiang Saen 2 Ko., Rat Chiang Saen Rd, Hai Ya, Mueang Chiang Mai 50100')                              as da_forma_C,
       _nap_done('14/10 Rat Chiang Saen 2 Ko. Alley, Chiang Mai 50100')                                                               as da_via_nuda,
       _nap_done('14/10 Rat Chiang Saen 2 Ko. Alley, Tambon Hai Ya, Muang District, Chiang Mai 50100')                                as gia_canonica;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. UPDATE
--    La guardia `is distinct from _nap_done(...)` fa due cose: evita le scritture a
--    vuoto (updated_at non si muove per niente) e rende ogni UPDATE ripetibile.
-- ─────────────────────────────────────────────────────────────────────────────

-- 3a. business_profile
--     street_address tiene la sola via; locality/region/postal stanno in colonne proprie.
update business_profile set street_address = _nap_done(street_address)
 where street_address is distinct from _nap_done(street_address);

-- 3b. content_categories (JSON-LD structured data)
update content_categories set json_ld = _nap_done(json_ld::text)::jsonb
 where json_ld::text is distinct from _nap_done(json_ld::text);

-- 3c. akha_news (JSON-LD)
update akha_news set json_ld = _nap_done(json_ld::text)::jsonb
 where json_ld::text is distinct from _nap_done(json_ld::text);

-- 3d. site_metadata: json_ld + page_essentials
update site_metadata set json_ld = _nap_done(json_ld::text)::jsonb
 where json_ld::text is distinct from _nap_done(json_ld::text);

update site_metadata set page_essentials = _nap_done(page_essentials::text)::jsonb
 where page_essentials is not null
   and page_essentials::text is distinct from _nap_done(page_essentials::text);

-- 3e. faq_questions  ← difetto 3
update faq_questions set answer = _nap_done(answer)
 where answer is distinct from _nap_done(answer);

-- 3f. legal_documents e le 6 traduzioni
--     ERRATA CORRIGE SENZA BUMP, decisione /terms del 2026-08-02. NON toccare
--     legal_version: se sale, le traduzioni diventano stale e le pagine agency
--     tornano in inglese finche' non sono ritradotte. Un indirizzo non lo merita.
update legal_documents set body = _nap_done(body::text)::jsonb
 where body::text is distinct from _nap_done(body::text);

update legal_documents_translations set body = _nap_done(body::text)::jsonb
 where body::text is distinct from _nap_done(body::text);


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. VERIFICA FINALE
--    Le prime quattro colonne devono dare 0 ovunque. `canonica` e' quella che nella
--    v1 mancava: senza, una riga monca passava per buona (difetto 2).
-- ─────────────────────────────────────────────────────────────────────────────
with scan as (
  select 'content_categories' t, to_jsonb(x.*)::text d from content_categories x
  union all select 'site_metadata',    to_jsonb(x.*)::text from site_metadata x
  union all select 'akha_news',        to_jsonb(x.*)::text from akha_news x
  union all select 'business_profile', to_jsonb(x.*)::text from business_profile x
  union all select 'legal_documents',  to_jsonb(x.*)::text from legal_documents x
  union all select 'legal_documents_translations', to_jsonb(x.*)::text from legal_documents_translations x
  union all select 'faq_questions',    to_jsonb(x.*)::text from faq_questions x
)
select t,
  count(*) filter (where d ilike '%Soi 2 Ko%')                  as forma_A_residua,
  count(*) filter (where d ilike '%Soi Rat Chiang Saen 2 Ko.%') as forma_C_residua,
  count(*) filter (where d ilike '%Hai Ya Sub-district%')       as coda_vecchia_residua,
  count(*) filter (where d ilike '%Muang District, Hai Ya%'
                     or d ilike '%Muang District, Muang District%'
                     or d ilike '%Tambon Hai Ya, Tambon Hai Ya%')  as duplicazioni,
  count(*) filter (where d ilike '%Ko. Alley, Tambon Hai Ya, Muang District%') as canonica
from scan
group by t
having count(*) filter (where d ilike '%Rat Chiang Saen%') > 0
order by t;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. PULIZIA
--    Le helper servono solo durante il giro: lasciarle in giro significa lasciare
--    in database una funzione che nessuno si aspetta di trovarci.
--    Il backup NON si droppa qui: lo droppi tu quando sei sicuro.
-- ─────────────────────────────────────────────────────────────────────────────
drop function if exists _nap_done(text);
drop function if exists _nap_fix(text);

-- drop table _nap_backup_20260803;   -- solo a verifica accettata


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. DOPO IL DATABASE
--    a) i file .ts che Cherry cita come autorevoli:  npm run gen-legal
--       controllo:  grep -c "Soi 2 Ko" packages/shared/src/data/legal/*.ts   -> 0
--    b) i master nel brain (2141 · 2142 · 6141 · 6142 · 015_Canonical_Facts ·
--       AGENTS.md · CLAUDE.md): gia' propagati il 2026-08-02, hash master/DB 56/56.
--    c) fuori perimetro, per altre skill: email 142_01 e 142_03, autoreply Facebook,
--       gbp.md, GBP_SAL.md, l'audit Facebook e 3 CSV di contatti storici.
-- ─────────────────────────────────────────────────────────────────────────────
