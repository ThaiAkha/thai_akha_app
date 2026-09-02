-- 20260902210000_drop_driver_route_v.sql
--
-- Passo 2 di driver_route_v → RPC driver_route() (vedi 20260902200000_driver_route_rpc).
-- Applicata SOLO dopo il deploy del codice admin che legge dalla RPC (5cb1bf3):
-- una vista droppata prima del deploy avrebbe rotto la pagina percorso del driver
-- (lezione salary 2026-08: mai DDL breaking con il canale di deploy in mezzo).
--
-- Verifiche prima del drop: pg_depend/pg_policies/pg_proc = zero referenti; equivalenza
-- vista ≡ funzione con EXCEPT bidirezionale sotto claims driver/admin (0 differenze);
-- nessun riferimento nel codice (grep, esclusi i tipi generati).
--
-- Rollback: CREATE VIEW con la definizione in _SCHEMA (brain 054) + GRANT SELECT
-- TO authenticated. La funzione puo' restare.

drop view public.driver_route_v;
