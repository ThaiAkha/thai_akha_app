-- 20260728000100_legal_documents_hardening.sql
-- Hardening di legal_documents emerso dalla code-review della migration precedente.
-- Applicato PRIMA che qualunque documento venga pubblicato (tutti is_published = false),
-- quindi i CHECK validano istantaneamente e non c'e' mai stata esposizione reale.
--
-- Nessun GRANT/REVOKE: public.get_my_role() ha gia' EXECUTE per authenticated/anon
-- (SECURITY DEFINER, STABLE). I grant di is_admin() restano intoccati.

-- ─────────────────────────────────────────────────────────────────────────────
-- FIX 1 — I documenti agency erano leggibili da QUALSIASI utente autenticato.
-- `to authenticated` e' il ruolo Postgres, non il ruolo di business: senza il
-- controllo su profiles.role, un cliente/driver/kitchen loggato avrebbe letto i
-- termini agenzia (commission tiers) appena pubblicati. Gate esplicito via get_my_role().
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists "agency auth read" on public.legal_documents;
create policy "agency auth read" on public.legal_documents
  for select to authenticated
  using (
    audience = 'agency'
    and is_published = true
    and public.get_my_role() in ('agency','admin','manager')
  );

drop policy if exists "agency auth read" on public.legal_documents_translations;
create policy "agency auth read" on public.legal_documents_translations
  for select to authenticated
  using (
    is_published = true
    and public.get_my_role() in ('agency','admin','manager')
    and exists (
      select 1 from public.legal_documents d
      where d.id = legal_documents_translations.document_id
        and d.audience = 'agency'
        and d.is_published = true
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- FIX 3 — Impedisce di pubblicare un documento legale VUOTO.
-- front_policy/agency_* hanno versione e date valorizzate ma body vuoto: un solo
-- is_published = true pubblicherebbe un legale bianco dall'aria legittima.
-- jsonb_typeof: evita l'errore criptico di jsonb_array_length su un body non-array.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.legal_documents
  drop constraint if exists legal_documents_published_has_body;
alter table public.legal_documents
  add constraint legal_documents_published_has_body
  check (
    is_published = false
    or (jsonb_typeof(body) = 'array' and jsonb_array_length(body) > 0)
  );

alter table public.legal_documents_translations
  drop constraint if exists legal_documents_translations_published_has_body;
alter table public.legal_documents_translations
  add constraint legal_documents_translations_published_has_body
  check (
    is_published = false
    or (jsonb_typeof(body) = 'array' and jsonb_array_length(body) > 0)
  );
