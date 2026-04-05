--------------------------------------------------------------------------------
##### 📖 THAI AKHA 1.0: Architecture v2 — Definitive Schema
**Aggiornato**: Aprile 2026 **Status**: Risoluzione GAP applicata e allineamento completato ✅ [1]

---

#### 1. Overview Sistema (Multi-Tenant)
**Monorepo pnpm** — 3 package: front :3000 | admin :3001 | shared [1]

---

###### 2. Ruoli — DB vs TypeScript (RISOLTO ✅)
I ruoli sono stati ufficialmente allineati tra Database e TypeScript tramite aggiornamento dei constraint SQL [1]. Il ruolo customer è stato rimosso dall'architettura (lo status di cliente si calcola dinamicamente dalle prenotazioni attive), mentre logistics e user sono stati ufficializzati per supportare rispettivamente le operazioni di spesa al mercato e gli account utente standard [1].

| Ruolo | DB | TypeScript | Note Operative |
| ------ | ------ | ------ | ------ |
| **admin** | ✅ | ✅ | Accesso totale al sistema. [2] |
| **manager** | ✅ | ✅ | Gestione operativa, prenotazioni, logistica secondaria. [2] |
| **logistics** | ✅ | ✅ | Dedicato esclusivamente allo staff per la spesa al mercato fisico (Market Run, Market Planner). [2] |
| **agency** | ✅ | ✅ | Partner B2B per la creazione e gestione di prenotazioni di gruppo. [2] |
| **kitchen** | ✅ | ✅ | Staff cucina (Accesso al POS, Inventory, Daily Prep). [2] |
| **driver** | ✅ | ✅ | App autisti per la gestione pickup/dropoff. [2] |
| **alumni** | ✅ | ✅ | Ex studenti (sblocca ricette e feature avanzate). [2] |
| **user** | ✅ | ✅ | Ruolo di default per gli iscritti al sito. [2] |
| **guest** | ✅ | ✅ | Ospiti anonimi (usato principalmente per i session_token della AI Chat, non più per i booking). [2] |

---

#### 3. Tabelle DB — Schema Reale (53 tabelle) [3]

##### Dominio Booking
| Tabella | Colonne | RLS | Note |
| ------ | ------ | ------ | ------ |
| bookings | **50** | ✅ | Tabella principale (incl. visitor_count) [3] |
| booking_participants | 5 | ✅ | is_leader, joined_at [3] |
| menu_selections | 10 | ✅ | curry/soup/stirfry → recipes [3] |
| class_sessions | 12 | ✅ | Sessioni disponibili [3] |
| class_calendar_overrides | 8 | ✅ | Chiusure/capacità custom [3] |
| cooking_classes | 18 | — | Catalogo classi [3] |

##### Dominio Logistica
| Tabella | Colonne | Note |
| ------ | ------ | ------ |
| pickup_zones | 10 | Zone pickup con orari [3] |
| hotel_locations | 16 | Hotel con zone_id → pickup_zones [3] |
| hotel_pickup_rules | 12 | **Non documentata** — regole custom per hotel/giorno [3] |
| meeting_points | 13 | Punti incontro con coordinate [3] |
| driver_payments | 11 | Pagamenti driver per corsa [3] |
| driver_payout_tiers | 6 | Tariffe per n. fermate [3] |

##### Dominio Profili & Utenti
| Tabella | Colonne | Note |
| ------ | ------ | ------ |
| profiles | **27** | Tutto in una tabella incl. agency fields [4] |
| dietary_profiles | 10 | Profili dietetici catalogo [4] |
| dietary_substitutions | 4 | Sostituzioni per profilo [4] |
| spiciness_levels | 13 | Livelli piccante [4] |
| allergy_knowledge | 3 | Allergeni/diete speciali (allergy_key, warning_text) [4] |

##### Dominio Shop
| Tabella | Colonne | Note |
| ------ | ------ | ------ |
| shop_akha | 20 | Prodotti + zoho_item_id [4] |
| shop_categories | 6 | [4] |
| shop_orders | 9 | booking_id → bookings.internal_id ⚠️ [4] |
| shop_storefront | 10 | Vetrina pubblica [4] |
| shop_contacts | 5 | Contatti fornitori [4] |

##### Dominio Content (Aggiornato alla Unified Schema Strategy)
| Tabella | Colonne | Note |
| ------ | ------ | ------ |
| recipes | 21 | Con dietary_variants, gallery_images e json_ld [4] |
| recipe_categories | 13 | [4] |
| recipe_composition | 8 | recipe → ingredients [4] |
| recipe_key_ingredients | 3 | Ingredienti chiave per ricetta [4] |
| recipe_selections | 4 | Selezioni per categoria [4] |
| recipe_selection_categories | 3 | Categorie selezione ricette [4] |
| content_categories | 3 | Categorie contenuto multi-dominio [4] |
| site_metadata | 24 | SEO + OG + JSON-LD (rimossa colonna features) [4] |
| site_metadata_admin | 24 | incl. og_type, twitter_card, cache_ttl, redirect_to [4] |
| site_metadata_admin_translations | 14 | Traduzioni EN/TH per pagine admin [4] |
| home_cards_translations | 8 | Traduzioni EN/TH per home_cards [4] |
| home_cards_front | 12 | Card homepage B2C (separata da admin) [4] |
| page_sections | 9 | Sezioni CMS pagine generiche [4] |
| media_assets | 15 | Libreria immagini centralizzata [4] |
| audio_assets | 14 | Asset audio (storie, narrazione) [4] |
| class_sections | 11 | Sezioni contenuto pagine classe [4] |
| akha_news | **24** | Blog. Include access_level, json_ld, e meta SEO [4] |
| culture_sections | **22** | Include json_ld e meta tag (Unified Schema) [4] |
| ethnic_groups | 7 | [4] |
| gallery_items | 9 | [4] |
| home_cards | 13 | [4] |

##### Dominio Operativo
| Tabella | Colonne | Note |
| ------ | ------ | ------ |
| market_runs | 11 | + zoho_expense_id [5] |
| ingredients_library | 17 | [5] |
| ingredient_categories | 4 | [5] |

##### Dominio Chat (Cherry AI)
| Tabella | Colonne | Note |
| ------ | ------ | ------ |
| chat_sessions | 10 | user_id nullable (guest via session_token) [5] |
| chat_messages | 6 | sender_role: user/assistant/system [5] |

##### Dominio Quiz
| Tabella | Note |
| ------ | ------ |
| quiz_categories | Categorie quiz [5] |
| quiz_modules | → quiz_levels [5] |
| quiz_levels | → quiz_rewards [5] |
| quiz_questions | → quiz_modules [5] |
| quiz_rewards | [5] |

---

#### 4. Mappa FK Reali (da Supabase) [5]
*(Dettagli relazionali strutturali mappati correttamente)*

---

#### 5. Tabella bookings — 50 Colonne Complete [6]
*   **Campi Core** [6]
*   **Relazioni** [6]
*   **Dati Cliente** [6]
*   **Logistica Pickup** [6]
*   **Logistica Dropoff** [6]
*   **Pagamento & Commissioni** [6]
*   **Integrazioni Esterne** [6]
*   **Split Booking** [6]

---

#### 6. Agency: Approccio Attuale (senza tabella dedicata) [6]
Tutto il dato agenzia è su `profiles` con prefisso `agency_*`: [6]
**Pro approccio attuale:**
*   Zero JOIN extra per recuperare dati agenzia [6]
*   Semplice per agenzie piccole / singolo contatto [6]

**Contro:**
*   Nessuna relazione agency → agenti (più utenti per stessa agenzia) [6]
*   Commissioni non storicizzate [6]
*   Nessuna separazione tra "agenzia come entità" e "agente come utente" [6]

---

###### 7. Logica Prenotazioni & Walk-in Flow (Aggiornamento 1.0)
Il "doppio path" per le email e la creazione di account fantasma è stato risolto, centralizzando la logica sulla tracciabilità di chi inserisce il dato [7].
**Walk-in Guest & Agency Flow (No Ghost Profiles):** La colonna `guest_user_id` è **deprecata**. Non creeremo più profili utente "vuoti" con ruolo guest solo per far figurare un nome a sistema [7].
*   **La colonna `user_id` in `bookings` è logicamente obbligatoria e indica "Chi ha creato la prenotazione":** [7]
    *   *Cliente dal sito Web:* `user_id` = UUID del cliente registrato (`user`). [7]
    *   *Walk-in / Telefono:* `user_id` = UUID del manager che inserisce la prenotazione dal tablet. [7]
    *   *Agenzia:* `user_id` = UUID dell'agency che prenota per il suo gruppo. [7]
*   **Dati del Turista:** Nei casi di Walk-in o Agenzia, i dati reali del turista vengono salvati esclusivamente nei campi testuali `guest_name` e `guest_email` della tabella `bookings`. Il sistema invierà la conferma a quella mail senza richiedere la creazione di un account [7].

##### Zoho Integration
Integrazione con Zoho Books/CRM su 4 tabelle [8].

---

#### 8. Rischi Prioritizzati (DeepSeek Analysis) [8]
##### 🔴 CRITICO
| # | Problema | Rischio |
| ------ | ------ | ------ |
| 1 | FK su `internal_id` invece di `id` (3 tabelle) | Se `internal_id` cambia → FK rotte, dati orfani [8] |
| 2 | `logistics` nel TS ma non nel DB constraint | Inserimento profilo logistics → errore DB silenzioso [8] |

##### 🟡 ALTO
| # | Problema | Note |
| ------ | ------ | ------ |
| 3 | `internal_id` senza UNIQUE constraint (da verificare) | FK senza unicità garantita = dati inconsistenti [8] |
| 4 | Split booking non documentato | Nessuna validazione delle transizioni [8] |
| 5 | `guest_name`/`guest_email` vs `guest_user_id` — doppio path | Logica email divergente [8] |

##### 🟢 OK (nessuna azione urgente)
| Elemento | Perché è OK |
| ------ | ------ |
| `profiles.managed_by` self-reference | Pattern valido per ghost profiles [9] |
| Agency data su `profiles` | Accettabile con ≤10 agenzie [9] |
| `hotel_pickup_rules` non documentata | Funziona, va solo documentata [9] |
| Zoho integration | Campi presenti, integrazioni esterne OK [9] |

---

#### 9. Raccomandazioni (solo documentazione — nessuna modifica) [9]
**Fase 1 — Quick wins (quando pronti)** [9]
**Fase 2 — Documentazione** [9]
*   ✅ Aggiungere 5 tabelle mancanti (allergy_knowledge, content_categories, quiz_categories, recipe_key_ingredients, recipe_selection_categories) [10]
*   ✅ Aggiungere `hotel_pickup_rules` alla doc ufficiale [10]
*   Documentare split booking flow [10]
*   Allineare TypeScript types con constraint DB reali [10]

**Fase 3 — Valutare (futuro)** [10]
*   Tabella agencies separata se agenzie crescono [10]
*   Migrazione FK da `internal_id` a `id` [10]
*   Audit logging su modifiche booking critiche [10]

---

###### 10. Checklist Allineamento Doc ↔ Codice ↔ DB
Il sistema ha raggiunto il perfetto allineamento tra le direttive aziendali, il codice React/TypeScript e il database Supabase [10].

| Item | Status Finale | Note di Risoluzione |
| ------ | ------ | ------ |
| **Ruolo `logistics`** | ✅ Allineato | Mantenuto e ufficializzato in DB e TS per gestire la pagina Market Run. [11] |
| **Ruolo `customer`** | ✅ Risolto | Eliminato. Lo status VIP/Customer è calcolato verificando se l'utente ha un record status='confirmed' in bookings. [11] |
| **Ruolo `user`** | ✅ Allineato | Aggiunto ai constraint DB come default per i nuovi registrati. [11] |
| **Walk-in Flow** | ✅ Allineato | Si usano le colonne guest_name/email. Il rischio di collisione è azzerato eliminando la logica del guest_user_id. [11] |
| **AI System (Cherry)** | ✅ Allineato | Create tabelle chat_sessions e chat_messages per memoria e rate limiting. [11] |

---

**Aggiornato**: Aprile 2026 (5 tabelle sincronizzate) **Fonte dati**: Supabase MCP → DB live `mtqullobcsypkqgdkaob` via `Glob("supabase/backups/full_backup_*.md")` **Analisi**: Claude 3.7 Sonnet + DeepSeek **Azione**: Architettura SEO unificata applicata (JSON-LD & OpenGraph) ✅ | Schema sincronizzato (53/53 tabelle) ✅
