# 💵 Salari → Zoho + Payslip — handoff per la pagina (Claude Code)

Backend pronto. Mancano la **pagina admin** e il **wiring payslip** (lato Claude Code).

## Modello deciso
- **Spesa Zoho RAGGRUPPATA per metodo** (max 2/mese): 1 spesa BANK + 1 spesa CASH. Account-only (nessun vendor). Nome + totale (+ nota OT) di ogni lavoratore vanno nella **descrizione** della spesa. amount = somma del gruppo.
- **Payslip individuale** per ogni lavoratore, con **pulsante separato** (non insieme alla spesa).
- Payroll esclude admin/owner (no Svevo) e agency. Solo manager/kitchen/logistics/driver.

## Contratto dati (Supabase `mtqullobcsypkqgdkaob`)
**Tabella `staff_salaries`**: `id · employee_id→profiles.id · period 'YYYY-MM' · total_amount · overtime_note · pay_method('bank'|'cash') · status('draft'|'paid') · zoho_expense_id` · unique(employee_id, period). `profiles.base_salary` = default.

**RPC `get_salary_run(p_period)`** → roster (9 lavoratori): `employee_id, full_name, role, zoho_contact_id, base_salary, salary_id, total_amount, overtime_note, pay_method, status, zoho_expense_id`.

**Edge `zoho-create-salary-expense`** (POST, staff JWT): body `{ period }` o `{ salary_ids[] }`.
→ raggruppa le draft per metodo, crea 1 Expense/metodo (account+cassa per metodo, righe nei `description`), write-back `status=paid`+`zoho_expense_id` su tutto il gruppo. Idempotente. Risposta `{ success, expenses[], failures[] }`.

## Mappatura Zoho (verificata)
| Metodo | Conto spesa | Paid through |
|---|---|---|
| bank | Employers - Salary - Bank `1215788000000032023` | Bank 7502 `1215788000000147263` |
| cash | Employers - Salary - Cash `1215788000000064005` | Black Box `1215788000000097047` |

## Payslip (pulsante separato)
Generatore già pronto: `thai_akha_brain/600_Business_Thai_Akha/605_Financial/Payroll/payslip_a5_bilingual.py` — `build(data, out)` A5 bilingue TH/EN.
**Campi `data`**: `employee_name, position, period, pay_date, salary, overtime, bonus, advance, ssf, other_ded, total_income, total_ded, net, ytd_income, ytd_ded, ytd_ssf, ytd_tax`.
**Mapping minimo (versione attuale)** da `staff_salaries`+`profiles`:
`employee_name`=full_name · `position`=role · `period`=period · `pay_date`=oggi · `salary`=total_amount · `overtime`=0 (testo in `overtime_note`) · `bonus/advance/ssf/other_ded`=0 · `total_income`=`net`=total_amount · YTD=0 (abilitare con struttura dedicata futura).
**Wiring suggerito**: nuovo tipo `salary_payslip` in `render-report` (riusa lo script) → input `{ salary_id }` o `{ period }` (zip di N PDF). In alternativa edge dedicata.

## UI da costruire (pagina manager, es. `ManagerSalaries.tsx`)
1. Selettore mese → `get_salary_run(period)`.
2. Lista 9 lavoratori: nome+ruolo · input **importo totale** (prefill `base_salary`) · input **nota straordinari** · toggle **Bank/Cash** · badge stato.
3. Salva riga → upsert `staff_salaries` su unique(employee_id, period).
4. Bottone **"Crea spese salari"** → invoke `zoho-create-salary-expense` `{ period }`.
5. Bottone **"Genera payslip"** (separato) → render-report `salary_payslip` per lavoratore (PDF singolo o zip).
6. Righe con `zoho_expense_id` = read-only.

## Deploy (a mano)
`supabase functions deploy zoho-create-salary-expense` + secret `ZOHO_*` (ID conto già di default). Per i payslip: aggiungere il template `salary_payslip` al servizio render-report.

## Note
- Per ora bastano **nome + totale**; struttura dedicata workers/ruoli/deduzioni = fase 2 (poi YTD/ssf nei payslip).
- Mai movimento denaro reale automatico: la spesa documenta, il pagamento fisico lo fa l'umano.
