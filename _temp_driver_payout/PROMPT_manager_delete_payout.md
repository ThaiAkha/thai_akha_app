# Prompt per Claude Code — Pulsante "Cancella servizio" lato Manager

Repo: `thaiakha-cherry-2026` (package `admin`). Parte del bypass driver-payout (vedi `_temp_driver_payout/`).
Marca ogni nuovo punto con `// BYPASS-PAYOUT`. Segui le regole repo (Typography, token semantici, `@thaiakha/shared`, mobile-first). Niente virgolette tipografiche nei file .ts/.tsx/.json.

## Obiettivo
Nella pagina **`packages/admin/src/pages/manager/ManagerDriverPayouts.tsx`** aggiungere, su ogni **riga servizio** (`w.rows`), un pulsante **elimina** (icona cestino) che cancella quel singolo servizio del driver selezionato. Deve funzionare solo se il servizio è `pending` e la settimana non è chiusa (esiste già il lucchetto a livello DB). Dopo la cancellazione: parte l'email di cancellazione (driver TH + office EN) e si ricarica la lista.

⚠️ NON riusare `delete_my_payout`: è self-service (`auth.uid()`), il manager cancella per conto di un altro utente. Serve una RPC admin nuova.

## 1. DB — nuova RPC `admin_delete_payout`
Aggiungere a `_temp_driver_payout/migration.sql` (FASE 2) e applicarla al progetto `mtqullobcsypkqgdkaob`. Mirror di `delete_my_payout` ma per `p_driver_id` esplicito e guardia `is_admin()` (copre admin+manager, come `mark_driver_week_paid`).

```sql
-- Admin/manager elimina UN servizio di un driver (solo pending, settimana non chiusa).
CREATE OR REPLACE FUNCTION public.admin_delete_payout(
  p_driver_id uuid, p_run_date date, p_session_id text
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_status text;
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'Solo admin/manager puo eliminare un servizio'; END IF;
  SELECT dp.status INTO v_status FROM driver_payments dp
   WHERE dp.driver_id=p_driver_id AND dp.run_date=p_run_date AND dp.session_id=p_session_id;
  IF v_status IS NULL THEN RAISE EXCEPTION 'Nessun servizio da eliminare'; END IF;
  IF v_status = 'paid' THEN RAISE EXCEPTION 'Servizio gia pagato: non eliminabile'; END IF;
  IF EXISTS (
    SELECT 1 FROM driver_payments dp
     WHERE dp.driver_id=p_driver_id AND dp.status='paid'
       AND dp.run_date >= date_trunc('week', p_run_date)::date
       AND dp.run_date <  date_trunc('week', p_run_date)::date + 7
  ) THEN
    RAISE EXCEPTION 'Settimana gia pagata e chiusa: impossibile eliminare';
  END IF;
  DELETE FROM driver_payments dp
   WHERE dp.driver_id=p_driver_id AND dp.run_date=p_run_date AND dp.session_id=p_session_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_delete_payout TO authenticated;
```
Aggiungere anche a `_temp_driver_payout/rollback.sql`: `DROP FUNCTION IF EXISTS public.admin_delete_payout(uuid, date, text);`

## 2. Frontend — `ManagerDriverPayouts.tsx`
a) **Driver email per l'email di cancellazione.** L'attuale query driver NON seleziona l'email. Aggiornare:
   - `interface DriverOpt { id; full_name; email: string | null; zoho_contact_id }`
   - la select: `.select('id, full_name, email, zoho_contact_id')`

b) **Helper range** (l'email vuole `stops_range` tipo "1-2", la riga ha solo `total_stops` numerico):
```ts
const stopsToRange = (n: number): string =>
  n <= 2 ? '1-2' : n <= 4 ? '3-4' : n <= 6 ? '5-6' : '7plus';
```

c) **Handler** (stato `deletingRow`/conferma per riga, niente `window.confirm`):
```ts
const handleDeleteRow = async (w: WeekGroup, r: PayoutRow) => {
  if (!selectedDriver) return;
  try {
    const { error: delErr } = await supabase.rpc('admin_delete_payout', {
      p_driver_id: selectedDriver.id,
      p_run_date: r.run_date,
      p_session_id: r.session_id,
    });
    if (delErr) throw delErr;

    // BYPASS-PAYOUT — email cancellazione (driver TH + office EN). Non blocca il successo.
    try {
      await supabase.functions.invoke('send-driver-cancellation', {
        body: {
          driver_name: selectedDriver.full_name,
          email: selectedDriver.email,
          run_date: r.run_date,
          session_id: r.session_id,
          stops_range: stopsToRange(r.total_stops),
          reason: null,
        },
      });
    } catch { /* degradazione graziosa */ }

    await fetchRows(selectedDriver.id);
  } catch (err) {
    setWeekResult((p) => ({ ...p, [w.key]: { ok: false, msg: err instanceof Error ? err.message : t('driverPayouts.errorGeneric') } }));
  }
};
```

d) **UI riga** (dentro `w.rows.map`): mostrare il cestino SOLO se `r.status !== 'paid' && !w.zohoId` (settimana non fatturata). Usare icona `Trash2` di `lucide-react`. Mettere una **conferma inline** per riga (stesso pattern del blocco `confirming` già presente), non un alert. Stile coerente: bottone icona piccolo, hover rosso. Lo sfondo riga e i token restano quelli esistenti.

## 3. i18n — `packages/admin/src/i18n/locales/{en,th}/manager.json`
Aggiungere sotto `driverPayouts`: `deleteService`, `confirmDeleteTitle`, `confirmDeleteMsg` (con `{{date}}`), `deleteConfirm`, `deleteCancel`, `serviceDeleted`. EN + TH.

## 4. Verifica
- `admin_delete_payout`: elimina solo pending; errore su `paid`; errore se la settimana ha un `paid` (lucchetto); errore se non-admin/non-manager.
- UI: cestino assente su righe `paid` e su settimane già fatturate (`w.zohoId`).
- Email: cancellando una riga arrivano 2 email (driver TH + office EN); il fallimento email NON blocca la cancellazione.
- `pnpm --filter admin tsc`/lint puliti. Code-review del componente.

## Note
- `send-driver-cancellation` esiste già (payload-driven). Va solo deployata: `supabase functions deploy send-driver-cancellation`.
- Aggiornare la tabella stato in `_temp_driver_payout/HANDOFF_CLAUDE_CODE.md` (manager delete fatto).
