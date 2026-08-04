# Admin Planner UX — Standard unico

Regola viva per i **planner della manager** (driver/pickup · kitchen · reservation · POS).
Obiettivo: navigazione fluida e intuitiva — stesso scheletro ovunque, **cambia il contenuto, non la struttura**.

## Principi (tablet/iPad-first)
1. **Testi leggibili, mai piccoli.** Floor **14px** (`text-sm`) per qualsiasi testo informativo; titoli `text-base`+. Vietato `text-xs`/`text-[7-13px]` nei planner.
2. **Scroll verticale > compressione orizzontale.** Su iPad si impila e si scrolla; non si stringe in larghezza.
3. **Touch comodo:** target ≥ **44px**; bottoni primari `h-12`.
4. **Stessi mattoni:** `LeaderHeader`, `InspectorShell`, `InspectorActionButtons`, `BadgePaxNumber`, `Avatar`.

## Card lista (sidebar/centro)
Scheletro **fisso** (contenuto variabile per dominio):
- **[avatar/icona 40px sx]** · **[titolo: nome/gruppo + 1 sottotitolo]** · **[destra: `BadgePaxNumber` + colore-stato]** · espande alla selezione.
- **Colore-stato unico** trasversale: 🩶 grigio = da fare · 🟧 arancione = in corso/salvato · 🟩 verde = fatto/cash · 🟦 blu = card. Ogni dominio mappa i suoi stati su questa scala.
- Bordo **1px**, niente doppio bordo; selezione = elevazione (`shadow`).
- Testi: titolo `text-base`, sottotitolo `text-sm`.

## Inspector (colonna destra) — guscio unico
1. **Header = `LeaderHeader`** (unico, ovunque, driver incluso). Contenuto standard, nell'ordine:
   **avatar** · **corona tour leader** (+ eyebrow ruolo) · **nome** · **pax badge** (`BadgePaxNumber`) · **luggage badge** (se presente) · **booking number** · **telefono + WhatsApp** (se disponibile). Contatti extra (email/LINE/agency phone) opzionali.
2. **Body = sezioni impilate**, ognuna con titolo (`SectionTitle`, `text-sm` uppercase) + righe info / campi. Un blocco logico per sezione (es. driver: *Pickup · Hotel/Zone · Driver*; kitchen: *Pax · Class · Contacts*). Scroll verticale, niente colonne strette.
3. **Footer sticky = 1 azione PRIMARIA** full-width (`h-12`, `text-base`: Save / Pay / Confirm pickup). Azioni secondarie = **icon-button 44px** nell'header (edit/delete/whatsapp), via `InspectorActionButtons`.

## Sizing di riferimento
| Elemento | Classe |
|---|---|
| Section title | `text-sm font-bold uppercase tracking-wide` (mai `text-xs`) |
| Info row label / value | label `text-sm` · value `text-base` |
| Bottone primario | `h-12 text-base font-bold rounded-xl` |
| Icon-button | `size-11 rounded-xl` |
| Avatar header | `xlarge` (h-14) · card list `medium` (h-10) |

## Applicazione
Outlier da allineare per primo: **driver** (`LogisticInspector`, `TransportStopCard`) → adottare `LeaderHeader` + alzare i `text-xs`. Poi verificare kitchen/reservation/POS già conformi.
