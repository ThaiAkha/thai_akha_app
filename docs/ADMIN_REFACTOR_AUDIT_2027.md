# Admin App — Audit complessivo & Programma Refactoring (Giu 2026)

Audit di TUTTE le pagine admin (tutti i ruoli), componenti condivisi, ridondanze → programma di refactoring assoluto pagina-per-pagina. Idioma admin (TailAdmin): `gray-*`/`dark:` leciti, iPad/desktop-first.

## 0. Numeri
- **41 pagine** (`pages/`), ~**7.249 LOC** solo pagine.
- Componenti per cartella (LOC): `admin` 5402 · `manager` 1933 · `ui` 1390 · `form` 1103 · `common` 1012 · `data-explorer` 836 · `UserProfile` 751 · `booking` 726 · `ecommerce` 613 · `showcase` 492 · `dashboard` 480 · `typography` 253 · `market` 142 · `layout` 93.
- 19 hook (`useAdmin*`/`useManager*` 191–387 LOC).

## 1. Pattern architetturale ricorrente — "Feature Triad"
Quasi ogni pagina-feature admin segue lo stesso schema (≈12-13 volte):
```
<FeaturePage> (thin)
  → use<Feature> (hook dati)        # 11 pagine hanno hook dedicato
  → <Feature>Content  (master list) # 13 componenti *Content
  → <Feature>Inspector (detail)     # 12 componenti *Inspector
  + <Feature>Sidebar / *Actions
  composti in master-detail (PageGrid)
```
**Buona separazione, MA ogni triade è scritta a mano** → enorme duplicazione nelle shell Content/Inspector. È il bersaglio #1.

## 2. Inventario pagine per ruolo (stato)
| Ruolo | Pagine (LOC) | Stato |
|---|---|---|
| **admin** (10) | AdminHome 105 · AdminReport 223 · AdminDatabase 150 · AdminNews 144 · AdminInventory 138 · AdminMedia 127 · AdminStorage 122 · AdminHotels 117 · ComponentShowcase 104 · AdminCalendar 92 | triade hook+Content+Inspector |
| **agency** (9) | AgencyReservations 461🔴 · AgencyBooking 282 · AgencyReports 222 · AgencyNews 175 · AgencyHome 129 · AgencyTerms 111 · AgencyAssets 98 · AgencyRates 96 · AgencyDashboard 56 | mista (2 inline supabase) |
| **manager** (7) | ManagerDriverPayouts 337 · ManagerLogistic 294 · ManagerBooking 110 · ManagerPos 105 · ManagerHome 104 · ManagerReservation 103 · ManagerReports 47 | triade + 1 inline |
| **driver** (4) | DriverRoute 465🔴 · DriverPayoutForm 374 · DriverPayoutDashboard 258 · DriverHome 184 | 2 inline supabase |
| **market** (2) | MarketShop 832🔴 · MarketRunner 412🔴 | monolite inline |
| **kitchen** (1) | KitchenHome 129 | ⚠️ **solo Home — viste da creare** |
| **logistics** (1) | LogisticHome 129 | ⚠️ **solo Home — viste da creare** |
| common (3) | Home 17 · NotFound 44 · UserProfiles 35 | ok |
| auth (4) | ResetPassword 201 · AuthPageLayout 56 · SignIn 31 · SignUp 30 | ✅ già rivisti |

## 3. Componenti condivisi — adozione
- `PageContainer` → **20 pagine** ✅ (baseline layout solida). `PageGrid` 3, `PageHeader` 41 LOC.
- Home dashboard quad (`WelcomeHero` 11 · `FeatureCardsGrid`/`DashboardNavCard`/`CTABanner` 6 ciascuno) → le 6 home. ✅ già toccato (grid responsive, flash, typography).
- `usePageMetadata` → 15 pagine ✅.
- UI kit: `Button` 7 · `Badge` 7 · `Card` 3 · `Modal` 1 · `InputField` 2 — **uso disomogeneo** (molte pagine fanno bottoni/card a mano).
- Typography (6 componenti) → solo **4 pagine** li importano → adozione ~0%.

## 4. Ridondanze & candidati estrazione (per impatto)
| # | Ridondanza | Evidenza | Estrazione proposta | Risparmio |
|---|---|---|---|---|
| R1 | **Inspector shell** (master-detail detail panel) | **12 Inspector**, ~3.124 LOC (News 529, Hotels 386, Logistic 383, Media 378, Storage 289, Booking 253…) | `<InspectorShell>` (header+body+actions+close) + slot | alto |
| R2 | **Content shell** (master list) | **13 *Content** | `<ContentList>`/`<DataTableShell>` generico | alto |
| R3 | ~~Master-detail layout~~ **GIÀ FATTO** | `DataExplorerLayout` (toolkit data-explorer, 836 LOC) usato da **9 pagine** (AdminNews/Hotels/Media/Storage/Inventory/Database + ManagerPos/Logistic/Reservation) | nessuna estrazione — far adottare alle hand-rolled | — |
| R4 | **Home dashboard** | 6 home identiche | ✅ già condiviso (quad) — manca solo estrarre l'outer in `<HomeDashboard>` | medio |
| R5 | **Data-fetch inline** | **6 pagine** con `supabase.from` inline (MarketShop, DriverRoute, AgencyReservations, AgencyBooking, ManagerDriverPayouts, DriverPayoutForm) | estrarre `use<Feature>` come le altre 11 | medio |
| R6 | **Bottoni/card a mano** | Button importato solo da 7 pagine | adottare UI kit (`Button`/`Card`/`Badge`) ovunque | basso-medio |
| R7 | **Report PDF print/download** | ManagerDriverPayouts + MarketShop ri-implementano | estrarre `useReportPdf()` (già pattern gemello) | basso |

## 5. Debito tecnico
- **Monstre (>440 LOC)**: MarketShop 832, NewsInspector 529, DriverRoute 465, AgencyReservations 461, MarketRunner 412 + hook 300-387 → `/simplify`.
- **Typography**: **121** `<h1-6>/<p>` grezzi nelle pagine → migrare ai 6 componenti (scala fissa già decisa).
- **Colore**: **434** occorrenze `gray-*` hardcoded (lecite in admin, ma senza token-discipline) → baseline DS `/admin-style`.
- **Ruoli vuoti**: kitchen + logistics = solo Home → viste operative da progettare.

## 6. Programma refactoring — fasi (shared-first)
> Principio: estrarre PRIMA le shell condivise (R1–R3), POI migrare pagina-per-pagina a comportamento invariato (`/simplify`→`/verify` ogni step).

- **Fase 0 — Fondazione DS** *(prerequisito)*: baseline `/admin-style` (token gray/spacing/radius/ombre/focus) + gate `/admin-typography` (adozione 6 componenti). Senza, ogni migrazione "indovina".
- **Fase 1 — Shell condivise**: `InspectorShell` (R1) + `ContentList`/`DataTableShell` (R2) + `ExplorerLayout` (R3) + `HomeDashboard` (R4) + `useReportPdf` (R7).
- **Fase 2 — Migrazione feature triadi** (page-by-page, a comportamento invariato), ordine per impatto:
  1. News · Hotels · Media · Storage · Inventory · Database · Calendar (admin)
  2. Logistic · Reservation · Pos · Booking (manager)
  3. Reservations · Booking · Reports (agency)
- **Fase 3 — De-inline dati** (R5): estrarre hook per le 6 pagine inline; spezzare i monstre (`/simplify`).
- **Fase 4 — Typography/colore**: migrare 121 raw text + token-izzare gray-* dove ha senso.
- **Fase 5 — Ruoli vuoti**: progettare e implementare viste kitchen + logistics (nuove pagine).

Ogni pagina chiude con: tsc 0 · build ok · `/verify` (comportamento invariato).
