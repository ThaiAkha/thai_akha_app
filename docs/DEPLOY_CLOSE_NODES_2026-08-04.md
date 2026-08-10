# Chiudere i nodi deploy — runbook (Claude Code / terminale)

> **REV 2 (2026-08-04)** dopo verifica terminale. Correzioni vs REV 1:
> - Il push NON è bloccato da Zoho: è bloccato da **Resend** (`re_H83…`, nei dump SQL) e **Stitch/GCP** (`AQ.Ab8…`, nel doc MCP). Zoho non è nella history git. NON ruotare Zoho per il deploy (romperebbe le 6 edge per nulla).
> - Region Cloud Run: da **verificare con `gcloud run services list`**, non assumere.
> - Admin pulito: via **worktree**, non `git stash` (stash rischia conflitto col WIP dell'altra sessione).

Ordine corretto: **1 admin pulito → 2 payslip → 3 push+chiavi**.

## 0. Contesto verificato
- Il mio lavoro zoho-finance è **committato** (`117c2ed feat(zoho-finance)…`).
- Il lavoro dell'altra sessione (locale booking/driver/hotels/market/reservation ×4 lingue, `AgencyBooking.tsx`, `class.service.ts`, `database.types.ts`, doc cancellati) è **NON committato** nel working tree, ma è finito **live** perché `pnpm build:admin` compila il working tree.
- Branch: `feature/faq-central-render`. Renderer: Cloud Run `report-renderer` / `asia-southeast1`.

## 1. 🔴 Sicurezza PRIMA di tutto — ruotare i secret esposti
I secret Zoho sono passati in chat E sono nella **history git** (rimossi solo negli ultimi commit `b465023`/`49f249d`, ma restano nei commit precedenti → push protection blocca).
1. **Ruota nell'API console Zoho**: rigenera `client_secret` + `refresh_token`. (Il client_secret vecchio e il refresh vecchio diventano morti.)
2. Aggiorna i secret Supabase delle edge: `supabase secrets set ZOHO_CLIENT_SECRET=… ZOHO_REFRESH_TOKEN=…`
3. Verifica un'edge che usa Zoho (es. driver report) → deve ancora autenticare.

## 2. Push del branch (secret nella history)
Una volta ruotati (quindi morti), due vie:
- **Veloce**: nel messaggio di errore push, GitHub dà un URL "unblock secret" → sblocca (i secret sono ormai invalidi).
- **Pulita**: riscrivi la history rimuovendo le stringhe:
  ```bash
  pip install git-filter-repo
  printf 'OLD_CLIENT_SECRET==>REMOVED\nOLD_REFRESH_TOKEN==>REMOVED\n' > /tmp/scrub.txt
  git filter-repo --replace-text /tmp/scrub.txt
  git remote add origin <url>   # filter-repo rimuove il remote
  git push --force-with-lease origin feature/faq-central-render
  ```
  ⚠️ Riscrive la history: coordinare con l'altra sessione (force-push su branch condiviso).

## 3. Payslip — redeploy Cloud Run
Le credenziali gcloud erano scadute → la revisione live potrebbe non avere `salary_payslip.py` (già nel repo + in `REGISTRY` di `app/main.py`).
```bash
gcloud auth login
cd services/report-renderer
gcloud run deploy report-renderer --region asia-southeast1 --source .
gcloud run services describe report-renderer --region asia-southeast1 --format='value(status.url)'
```
- Se l'URL cambia, aggiorna il secret: `supabase secrets set REPORT_RENDERER_URL=<nuovo-url>`.
- **Verifica**: genera un payslip dalla pagina Salary (o invoca `render-report` con `template=salary_payslip`, un `salary_id`) → deve tornare un PDF, non "unknown template".

## 4. Admin: togliere dal live il lavoro altrui NON committato
`firebase hosting:rollback` NO: riporterebbe indietro anche la MIA UI committata (tab Classes, Paga Carta).
Meglio **ripubblicare da tree pulito** (solo codice committato):
```bash
git stash push -u -m "wip-altra-sessione"     # mette via i file non committati
npx tsc --noEmit -p packages/admin/tsconfig.app.json   # deve restare pulito
pnpm build:admin
firebase deploy --only hosting:admin
git stash pop                                  # ripristina il WIP per l'altra sessione
```
Risultato: live = solo codice committato (la mia roba c'è, il WIP altrui sparisce dalla produzione finché non lo committano loro.)
> DECISIONE UMANA: se il WIP altrui è considerato safe/finito, si può lasciare e farglielo committare invece di stasharlo. In dubbio → tree pulito.

---
## STEPS REV 2 — usare QUESTI (sostituiscono i punti 1-4 sopra)

### A. Admin pulito via worktree (primo: è l'unica cosa live che potrebbe essere sbagliata, non dipende da nessuno)
```bash
git worktree add /tmp/admin-clean HEAD
cd /tmp/admin-clean && pnpm install --filter admin... && pnpm build:admin
# deploy dalla root del progetto puntando alla dist del worktree (o firebase deploy dentro il worktree)
firebase deploy --only hosting:admin
cd - && git worktree remove /tmp/admin-clean
```
Live = solo codice committato (la mia UI c'è, il WIP altrui esce dalla produzione). Non tocca l'albero dell'altra sessione.
> Se il WIP altrui è confermato safe/finito → si può lasciare e farglielo committare. In dubbio → worktree.

### B. Payslip — report-renderer (Cloud Run)
```bash
gcloud auth login                                   # <-- serve azione umana (creds scadute)
gcloud run services list                            # LEGGI nome+region reali, non assumere
cd services/report-renderer
gcloud run deploy report-renderer --region <REGION-VERA> --source .
```
- Se l'URL cambia: `supabase secrets set REPORT_RENDERER_URL=<nuovo>`.
- **Verifica corretta**: invoca l'edge `render-report` con **`report`** = un tipo che usa il payslip (NON `template`); `template=salary_payslip` è ciò che l'edge passa a valle. Atteso: PDF, non "unknown template".

### C. Push + chiavi vere (ultimo)
1. **Ruota** (obbligatorio, sono leakate): **Resend** (`re_H83…`) e **Stitch/GCP** (`AQ.Ab8…`). Aggiorna dove sono usate.
2. Push: **bypass** GitHub (le chiavi ormai morte) → veloce. Oppure **purge** history:
   ```bash
   printf 'RESEND_KEY==>REMOVED\nSTITCH_KEY==>REMOVED\n' > /tmp/scrub.txt
   git filter-repo --replace-text /tmp/scrub.txt --force   # clone non fresco → --force
   git remote add origin <url>
   git push origin feature/faq-central-render              # primo push: no --force-with-lease
   ```
   ⚠️ Riscrive history → coordinare coi 24 file dell'altra sessione.
3. Zoho: NON toccare per il deploy. (Il client_secret è comparso in una chat Shifts → rotazione = igiene futura, non blocco, non tocca il push.)

## Fatto quando
- [ ] Secret Zoho ruotati + edge riautenticate.
- [ ] Branch pushato (bypass o scrub).
- [ ] report-renderer ridefinito, payslip risponde PDF.
- [ ] Admin ripubblicato da tree pulito (o WIP altrui confermato safe).
