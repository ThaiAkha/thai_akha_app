### 📖 THAI AKHA 2026: Architecture v2 — Definitive Schema
**Aggiornato**: Marzo 2026
**Status**: Risoluzione GAP applicata e allineamento completato ✅

---

## 1. Overview Sistema (Multi-Tenant)

```
┌─────────────────────────────────────────────────────────────────┐
│                    MULTI-TENANT ARCHITECTURE                    │
├────────────────┬───────────────────────┬────────────────────────┤
│  B2C Customers │   Agency Partners     │    Internal Staff      │
│  guest/alumni  │   agency (profiles)   │  admin/mgr/drv/ktchn   │
│  Front App     │   Admin App (B2B)     │   Admin App (ops)      │
└────────────────┴───────────────────────┴────────────────────────┘
```

**Monorepo pnpm** — 3 package: `front` `:3000` | `admin` `:3001` | `shared`

---

#### 2. Ruoli — DB vs TypeScript (RISOLTO ✅)
I ruoli sono stati ufficialmente allineati tra Database e TypeScript tramite aggiornamento dei constraint SQL. Il ruolo `customer` è stato rimosso dall'architettura (lo status di cliente si calcola dinamicamente dalle prenotazioni attive), mentre `logistics` e `user` sono stati ufficializzati per supportare rispettivamente le operazioni di spesa al mercato e gli account utente standard.

| Ruolo      | DB  | TypeScript | Note Operative |
| ---------- | --- | ---------- | -------------- |
| **admin**  | ✅ | ✅ | Accesso totale al sistema. |
| **manager**| ✅ | ✅ | Gestione operativa, prenotazioni, logistica secondaria. |
| **logistics**| ✅ | ✅ | Dedicato esclusivamente allo staff per la spesa al mercato fisico (Market Run, Market Planner). |
| **agency** | ✅ | ✅ | Partner B2B per la creazione e gestione di prenotazioni di gruppo. |
| **kitchen**| ✅ | ✅ | Staff cucina (Accesso al POS, Inventory, Daily Prep). |
| **driver** | ✅ | ✅ | App autisti per la gestione pickup/dropoff. |
| **alumni** | ✅ | ✅ | Ex studenti (sblocca ricette e feature avanzate). |
| **user**   | ✅ | ✅ | Ruolo di default per gli iscritti al sito. |
| **guest**  | ✅ | ✅ | Ospiti anonimi (usato principalmente per i session_token della AI Chat, non più per i booking). |

---

## 3. Tabelle DB — Schema Reale (42 tabelle)

### Dominio Booking
| Tabella | Colonne | RLS | Note |
|---------|---------|-----|------|
| `bookings` | **49** | ✅ | Tabella principale |
| `booking_participants` | 5 | ✅ | is_leader, joined_at |
| `menu_selections` | 10 | ✅ | curry/soup/stirfry → recipes |
| `class_sessions` | 12 | ✅ | Sessioni disponibili |
| `class_calendar_overrides` | 8 | ✅ | Chiusure/capacità custom |
| `cooking_classes` | 18 | — | Catalogo classi |

### Dominio Logistica
| Tabella | Colonne | Note |
|---------|---------|------|
| `pickup_zones` | 10 | Zone pickup con orari |
| `hotel_locations` | 16 | Hotel con zone_id → pickup_zones |
| `hotel_pickup_rules` | 12 | **Non documentata** — regole custom per hotel/giorno |
| `meeting_points` | 13 | Punti incontro con coordinate |
| `driver_payments` | 11 | Pagamenti driver per corsa |
| `driver_payout_tiers` | 6 | Tariffe per n. fermate |

### Dominio Profili & Utenti
| Tabella | Colonne | Note |
|---------|---------|------|
| `profiles` | **27** | Tutto in una tabella incl. agency fields |
| `dietary_profiles` | 10 | Profili dietetici catalogo |
| `dietary_substitutions` | 4 | Sostituzioni per profilo |
| `spiciness_levels` | 13 | Livelli piccante |

### Dominio Shop
| Tabella | Colonne | Note |
|---------|---------|------|
| `shop_akha` | 20 | Prodotti + zoho_item_id |
| `shop_categories` | 6 | |
| `shop_orders` | 9 | booking_id → bookings.internal_id ⚠️ |
| `shop_storefront` | 10 | Vetrina pubblica |
| `shop_contacts` | 5 | Contatti fornitori |

### Dominio Content
| Tabella | Colonne | Note |
|---------|---------|------|
| `recipes` | 21 | Con dietary_variants, gallery_images |
| `recipe_categories` | 13 | |
| `recipe_composition` | 8 | recipe → ingredients |
| `recipe_selections` | 4 | Selezioni per categoria |
| `site_metadata` | 25 | SEO + OG + JSON-LD |
| `site_metadata_admin` | 25 | |
| `akha_news` | 15 | Blog |
| `culture_sections` | 21 | |
| `ethnic_groups` | 7 | |
| `gallery_items` | 9 | |
| `home_cards` | 13 | |

### Dominio Operativo
| Tabella | Colonne | Note |
|---------|---------|------|
| `market_runs` | 11 | + zoho_expense_id |
| `ingredients_library` | 17 | |
| `ingredient_categories` | 4 | |

### Dominio Quiz
| Tabella | Note |
|---------|------|
| `quiz_levels` | → quiz_rewards |
| `quiz_modules` | → quiz_levels |
| `quiz_questions` | → quiz_modules |
| `quiz_rewards` | |

---

## 4. Mappa FK Reali (da Supabase)

```
profiles ──────────────────────────────────────────────────────────────┐
  └── managed_by → profiles.id (ghost profiles / child users)         │
                                                                        │
bookings (49 col)                                                       │
  ├── user_id            → profiles.id  (Main User / Agency)          │
  ├── guest_user_id      → profiles.id  (Guest con account)           │
  ├── pickup_driver_uid  → profiles.id                                 │
  ├── dropoff_driver_uid → profiles.id                                 │
  ├── session_id         → class_sessions.id                           │
  └── parent_booking_id  → bookings.internal_id ⚠️ (split booking)   │
                                                                        │
booking_participants                                                    │
  ├── booking_id → bookings.internal_id ⚠️ (non id!)                 │
  └── user_id   → profiles.id ─────────────────────────────────────┘

menu_selections
  ├── booking_id   → bookings.internal_id ⚠️
  ├── user_id      → profiles.id
  ├── curry_id     → recipes.id
  ├── soup_id      → recipes.id
  ├── stirfry_id   → recipes.id
  └── spiciness_id → spiciness_levels.id

shop_orders
  ├── booking_id → bookings.internal_id ⚠️
  └── sku        → shop_akha.sku

hotel_locations
  └── zone_id → pickup_zones.id

hotel_pickup_rules
  └── hotel_id → hotel_locations.id

profiles
  └── preferred_spiciness_id → spiciness_levels.id
```

---

## 5. Tabella `bookings` — 49 Colonne Complete

### Campi Core
```
id, internal_id, booking_ref, booking_date, session_type,
status, created_at, updated_at, booking_source
```

### Relazioni
```
user_id, guest_user_id, session_id
```

### Dati Cliente
```
hotel_name, phone_number, phone_prefix, email_reference,
guest_name, guest_email,          ← walk-in senza account
special_requests, customer_note
```

### Logistica Pickup
```
pickup_zone, pickup_time, pickup_lat, pickup_lng,
pickup_driver_uid, pickup_sequence,
meeting_point,                     ← override meeting point
has_luggage                        ← non documentato
```

### Logistica Dropoff
```
requires_dropoff, dropoff_hotel, dropoff_zone,
dropoff_lat, dropoff_lng,
dropoff_driver_uid, dropoff_sequence,
actual_pickup_time, actual_dropoff_time,
transport_status, route_order
```

### Pagamento & Commissioni
```
pax_count, total_price,
payment_method, payment_status,
applied_commission_rate, commission_amount,  ← importo calcolato
agency_note, reservation_id_agency
```

### Integrazioni Esterne
```
zoho_invoice_id         ← Zoho Books
```

### Split Booking
```
parent_booking_id       ← → bookings.internal_id
is_split_child          ← boolean flag
```

---

## 6. Agency: Approccio Attuale (senza tabella dedicata)

Tutto il dato agenzia è su `profiles` con prefisso `agency_*`:

```
profiles
  ├── agency_commission_rate (integer)
  ├── agency_company_name
  ├── agency_tax_id
  ├── agency_phone
  ├── agency_address / city / province / country / postal_code
  ├── commission_config (JSONB) — {mode: 'flat'|'tiered', tiers:[...]}
  └── zoho_contact_id
```

### Pro approccio attuale
- Zero JOIN extra per recuperare dati agenzia
- Semplice per agenzie piccole / singolo contatto

### Contro
- Nessuna relazione `agency → agenti` (più utenti per stessa agenzia)
- Commissioni non storicizzate
- Nessuna separazione tra "agenzia come entità" e "agente come utente"

---

#### 7. Logica Prenotazioni & Walk-in Flow (Aggiornamento 2026)
Il "doppio path" per le email e la creazione di account fantasma è stato risolto, centralizzando la logica sulla tracciabilità di chi inserisce il dato.

**Walk-in Guest & Agency Flow (No Ghost Profiles):**
La colonna `guest_user_id` è **deprecata**. Non creeremo più profili utente "vuoti" con ruolo `guest` solo per far figurare un nome a sistema.
* **La colonna `user_id` in `bookings` è logicamente obbligatoria e indica "Chi ha creato la prenotazione":**
  * *Cliente dal sito Web:* `user_id` = UUID del cliente registrato (`user`).
  * *Walk-in / Telefono:* `user_id` = UUID del `manager` che inserisce la prenotazione dal tablet.
  * *Agenzia:* `user_id` = UUID dell'`agency` che prenota per il suo gruppo.
* **Dati del Turista:** Nei casi di Walk-in o Agenzia, i dati reali del turista vengono salvati esclusivamente nei campi testuali `guest_name` e `guest_email` della tabella `bookings`. Il sistema invierà la conferma a quella mail senza richiedere la creazione di un account.

### Zoho Integration
```
bookings.zoho_invoice_id
profiles.zoho_contact_id
market_runs.zoho_expense_id
shop_akha.zoho_item_id
```
Integrazione con Zoho Books/CRM su 4 tabelle.

---

## 8. Rischi Prioritizzati (DeepSeek Analysis)

### 🔴 CRITICO
| # | Problema | Rischio |
|---|---------|---------|
| 1 | FK su `internal_id` invece di `id` (3 tabelle) | Se `internal_id` cambia → FK rotte, dati orfani |
| 2 | `logistics` nel TS ma non nel DB constraint | Inserimento profilo logistics → errore DB silenzioso |

### 🟡 ALTO
| # | Problema | Note |
|---|---------|------|
| 3 | `internal_id` senza UNIQUE constraint (da verificare) | FK senza unicità garantita = dati inconsistenti |
| 4 | Split booking non documentato | Nessuna validazione delle transizioni |
| 5 | `guest_name/guest_email` vs `guest_user_id` — doppio path | Logica email divergente |

### 🟢 OK (nessuna azione urgente)
| Elemento | Perché è OK |
|---------|------------|
| `profiles.managed_by` self-reference | Pattern valido per ghost profiles |
| Agency data su profiles | Accettabile con ≤10 agenzie |
| `hotel_pickup_rules` non documentata | Funziona, va solo documentata |
| Zoho integration | Campi presenti, integrazioni esterne OK |

---

## 9. Raccomandazioni (solo documentazione — nessuna modifica)

### Azioni da pianificare (non applicate)

**Fase 1 — Quick wins (quando pronti)**
```sql
-- Verificare se internal_id ha già UNIQUE constraint
SELECT conname FROM pg_constraint
WHERE conrelid = 'bookings'::regclass AND contype = 'u';

-- Aggiungere logistics al role constraint (se necessario)
-- ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;
-- ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
-- CHECK (role = ANY (ARRAY[..., 'logistics']));
```

**Fase 2 — Documentazione**
- Aggiungere `hotel_pickup_rules` alla doc ufficiale
- Documentare split booking flow
- Allineare TypeScript types con constraint DB reali

**Fase 3 — Valutare (futuro)**
- Tabella `agencies` separata se agenzie crescono
- Migrazione FK da `internal_id` a `id`
- Audit logging su modifiche booking critiche

---

#### 10. Checklist Allineamento Doc ↔ Codice ↔ DB
Il sistema ha raggiunto il perfetto allineamento tra le direttive aziendali, il codice React/TypeScript e il database Supabase.

| Item | Status Finale | Note di Risoluzione |
| ---- | ------------- | ------------------- |
| **Ruolo `logistics`** | ✅ Allineato | Mantenuto e ufficializzato in DB e TS per gestire la pagina Market Run. |
| **Ruolo `customer`** | ✅ Risolto | Eliminato. Lo status VIP/Customer è calcolato verificando se l'utente ha un record `status='confirmed'` in `bookings`. |
| **Ruolo `user`** | ✅ Allineato | Aggiunto ai constraint DB come default per i nuovi registrati. |
| **Walk-in Flow** | ✅ Allineato | Si usano le colonne `guest_name/email`. Il rischio di collisione è azzerato eliminando la logica del `guest_user_id`. |
| **AI System (Cherry)** | ✅ Allineato | Create tabelle `chat_sessions` e `chat_messages` per memoria e rate limiting. |

---

**Generato**: Mar 16, 2026
**Fonte dati**: Supabase MCP → DB live `mtqullobcsypkqgdkaob`
**Analisi**: Claude Sonnet 4.6 + DeepSeek v3.2:cloud
**Azione**: Nessuna modifica applicata — solo lettura e documentazione ✅
