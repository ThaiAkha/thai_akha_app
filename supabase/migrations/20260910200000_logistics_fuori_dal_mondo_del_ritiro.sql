-- ─────────────────────────────────────────────────────────────────────────────
-- `logistics` esce dal mondo del ritiro, anche dalle due porte del database.
--
-- Decisione del proprietario, 2026-09-10: «logistic non si occupa di driver e
-- pickup e drop off al 100%, eliminalo dai permessi», e poi «procediamo escludendo
-- logistic». Il ruolo e' quello di chi va al mercato: un account solo, che si
-- chiama *Logistic Shopping* (`logistic@thaiakha.com`).
--
-- ── LE DUE PORTE, che nessuno aveva guardato ─────────────────────────────────
-- Il Driver Planner era la porta visibile (rotta admin, chiusa dalla sessione
-- admin). Ma `can_manage_logistics()` - che vale admin, manager **e logistics** -
-- governa anche:
--     hotel_locations   policy `hotels_manage`   (FOR ALL)
--     hotel_pickup_rules policy `rules_manage`   (FOR ALL)
-- Cioe' gli hotel e le REGOLE DI RITIRO: il mondo del pickup in pieno. Il nome
-- della funzione ha ingannato: «logistics» nel progetto indica due mestieri
-- diversi - chi fa la spesa, e la pagina dei giri. Chi l'ha scritta intendeva il
-- secondo e l'ha applicata al primo.
--
-- ── PERCHE' E' SICURO, verificato prima ──────────────────────────────────────
-- Gli scrittori sono DUE, non uno, e vale la pena nominarli bene perche' la frase
-- sbagliata ("non scrive nessuna riga di codice") farebbe concludere a chi legge fra
-- sei mesi che queste tabelle sono irraggiungibili dall'app:
--   · `useAdminHotels.ts:262-263`, montato su `/admin-hotels` -> solo hotel_locations;
--   · **l'esploratore generico del database** (`useAdminDatabase.tsx:31-32`), che fa
--     insert, update e delete su qualunque tabella del suo elenco - e in quell'elenco
--     ci sono ENTRAMBE. Montato su `/admin-database`.
-- La conclusione non cambia: **tutte e due le rotte sono `['admin']`**, e `is_admin()`
-- copre admin e manager. Nessun salvataggio si rompe.
-- Tutti gli altri usi sono letture, coperte dalle policy pubbliche che restano
-- intatte ("Public Read Active", "Public Read Rules", "Users Suggest Hotel").
-- Quindi togliere `logistics` non toglie una capacita' a nessuno: allinea il
-- database a una UI che gia' non gliela dava.
--
-- ── LA FUNZIONE RESTA, MA SMETTE DI ESSERE CONCESSA AD ANON ─────────────────
-- Non si droppa (ordine del proprietario del 2026-08-10: niente drop), e resterebbe
-- comunque orfana: nessuna policy, nessuna vista, nessuna funzione la usa dopo
-- questa migration, e il repo non la chiama (verificato: solo un commento in una
-- migration e una firma nei tipi generati). Il commento sotto lo dice, cosi' chi
-- la trova non la riusa per il nome.
-- Le si toglie pero' il grant ad `anon`, che non ha mai avuto motivo di esserci.
-- ─────────────────────────────────────────────────────────────────────────────

drop policy if exists "hotels_manage" on public.hotel_locations;
create policy "hotels_manage" on public.hotel_locations
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "rules_manage" on public.hotel_pickup_rules;
create policy "rules_manage" on public.hotel_pickup_rules
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

revoke all on function public.can_manage_logistics() from anon;

comment on function public.can_manage_logistics() is
  'ORFANA dal 2026-09-10: nessuna policy la usa piu''. Valeva admin+manager+logistics e governava hotel_locations e hotel_pickup_rules, cioe'' il mondo del RITIRO - a un ruolo che nel progetto fa la SPESA AL MERCATO. Il nome inganna: "logistics" qui indica due mestieri diversi. NON riusarla: per lo staff del ritiro si usa is_admin() (admin+manager). Non droppata solo per l''ordine "niente drop"; il suo corpo, se servisse ricrearla, e'' SELECT EXISTS (SELECT 1 FROM profiles WHERE id=auth.uid() AND role = ANY(ARRAY[''admin'',''manager'',''logistics''])).';
