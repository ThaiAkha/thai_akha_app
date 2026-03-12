# 📖 THAI AKHA 2026: Core Architecture & System Rules

**Obiettivo per l'AI**: Utilizza questo documento come "Single Source of Truth" per lo sviluppo dell'infrastruttura, del routing, dei permessi UI e delle query Supabase.

---

## 🏗️ 1. Architettura dei Repository (Separazione Netta)

Il progetto è un **monorepo pnpm** con una rigida separazione dei domini:

### **Front App** (`/packages/front`)
- **Scopo**: PWA pubblica dedicata esclusivamente all'esperienza cliente (B2C)
- **Destinatari**: Guest, Customer
- **Restrizioni**:
  - ❌ Nessuna pagina o componente operativo
  - ❌ Nessun accesso ai ruoli staff (admin, manager, driver, kitchen, agency)
  - ✅ Tutte le 9 pagine "Admin" precedentemente incluse (es. AdminDriverDashboard, AgencyDashboard) sono state **tassativamente eliminate** per sicurezza e performance
- **Porte Dev**: `:3000`

### **Admin App** (`/packages/admin`)
- **Scopo**: Dashboard operativa per lo staff e portale B2B
- **Destinatari**: Admin, Manager, Kitchen, Driver, Agency (staff roles)
- **Funzionalità**:
  - Kitchen orders management
  - Logistics coordination
  - Booking manager (create, edit, delete)
  - Driver route console
  - Agency B2B portal
- **Porte Dev**: `:3001`

### **Shared Module** (`/packages/shared`)
- **Scopo**: Centralizzare logica comune tra le app
- **Contenuti**:
  - Client Supabase unificato (`lib/supabase.ts`)
  - Autenticazione condivisa (`services/auth.service.ts`)
  - Data & Types comuni (`data/`, `types/`)
  - Utilities (cn, geoUtils, etc.)
  - Design System 4.8 (tailwind configs separate per app)

---

## 🚦 2. Strategia di Routing Globale & Modalità "Sandbox"

La gestione degli accessi previene la confusione tra i ruoli e protegge il database.

### **A. Login Redirect (Il Confine)**

Nel componente `AuthForm.tsx` della Front App:

```typescript
if (['admin', 'manager', 'driver', 'kitchen', 'logistics', 'agency'].includes(profile?.role)) {
  // Staff role detected → redirect to Admin App
  window.location.href = `${VITE_ADMIN_APP_URL}?token=${user.id}&app=front`;
} else {
  // Customers (guest, customer) → stay in Front App
  onNavigate('user');
}
```

**Comportamento:**
- ✅ **Guest/Customer**: Accedono regolarmente alla Front App → UserPage
- ✅ **Staff** (admin, manager, driver, kitchen, agency): Vengono intercettati e reindirizzati all'URL dell'Admin App tramite `VITE_ADMIN_APP_URL`

### **B. Il "Ponte" (Navigazione Incrociata Sicura)**

Lo staff **può** visitare il sito pubblico per ispezionarlo, ma con regole rigorose:

#### **Da Admin a Front:**
Nell'Admin App è presente un bottone **"View Live Site"** che apre la Front App passando la sessione autenticata.

#### **La "Staff Top-Bar":**
Quando un ruolo Staff naviga sulla Front App, il sistema innesca un rendering condizionale che mostra:
- **Barra flottante in alto** (colore Lime Green `#BAD879`)
- **Link "Return to Admin Dashboard"** per tornare indietro in qualsiasi momento
- **Indicatore di stato**: "You are viewing the site as Staff"

#### **Modalità Sandbox (Blocco Checkout):**
Lo staff sulla Front App può navigare, gestire il proprio profilo dietetico e giocare al Quiz. **Tuttavia**:

```
🚫 CHECKOUT BLOCCATO
┌─────────────────────────────────────────┐
│ Sei in modalità Staff                    │
│                                          │
│ Per creare una prenotazione,             │
│ usa il Booking Manager nell'Admin App    │
│                                          │
│ [← Return to Admin Dashboard]            │
└─────────────────────────────────────────┘
```

- ❌ Il Funnel di Prenotazione è bloccato
- ❌ Al momento del checkout, il bottone di pagamento è **nascosto**
- ✅ Viene mostrato il banner di cui sopra
- ✅ Possono navigare e visualizzare le classi

---

## 👥 3. Matrice dei Permessi Booking (Database & UI)

### **Livello 1: Utenti B2C Diretti**

| Entità | DB Flag | Permessi UI & Restrizioni |
|--------|---------|---------------------------|
| **Main User** | `booking_participants.is_leader = true` | ✅ Pieno Controllo. Può modificare pick-up, cambiare hotel, cancellare, scegliere il menu e invitare altri. |
| **Invited User** | Record indipendente in `profiles` | ⚠️ Controllo Limitato. Può gestire SOLO il proprio menu e quiz. 🚫 Blocco totale su cancellazione e logistica pick-up. |
| **Child User** | `profiles.managed_by = parent_id` | 👶 Ghost Profile. Il genitore compila menu e quiz per conto del figlio tramite un Profile Switcher nella UI, senza alcun login separato. |

### **Livello 2: Regole B2B (Agenzie)**

Quando un'agenzia (`profiles.role = 'agency'`) prenota per un cliente:

| Attore | Luogo | Permessi |
|--------|-------|----------|
| **L'Agenzia** | Admin App | Controllo totale amministrativo e logistico. Genera il link condiviso per il cliente. |
| **L'Agency Client** | Front App (link condiviso) | ⚠️ Se usa il link condiviso: ❌ Non può modificare il pick-up, ❌ non può cancellare il booking. ✅ Può solo inserire allergie, scegliere il menu e fare il quiz. |

**⚠️ CRITICAL PRICE RULE:**
> In qualsiasi vista dell'Agency Client, la Front App deve mostrare **esclusivamente il prezzo pieno standard** (`total_price`).
> È **VIETATO esporre** i dati commissionali dell'agenzia al cliente finale.

### **Livello 3: Flussi Admin "Booking Manager"**

Quando lo staff interno prenota per conto terzi:

#### **Flow A: New Guest**
```
Admin crea booking per utente non registrato
    ↓
Sistema invia email al cliente
    ↓
Cliente fa login → eredita Controllo Totale
    ↓
Diventa Main User (is_leader = true)
```

#### **Flow B: Existing User**
```
Admin assegna booking a ID esistente
    ↓
Cliente riceve Controllo Totale sulla sua app
    ↓
Diventa Main User per quel booking
```

#### **Flow C: Agency**
```
Admin assegna booking all'ID di un'agenzia
    ↓
Booking si trasferisce nel portale dell'agenzia
    ↓
Si attivano le regole del Livello 2 (Agency Client)
```

---

## 🔐 4. Regole di Accesso Supabase (RLS Policies)

### **Booking Table**
```sql
-- Customers vedono solo i loro booking
SELECT * FROM bookings
WHERE user_id = auth.uid()

-- Agenzie vedono i booking del loro cliente
SELECT * FROM bookings
WHERE agency_id = (
  SELECT agency_id FROM profiles WHERE id = auth.uid()
) AND client_user_id = auth.uid()

-- Admin vede tutto
-- (IF auth.jwt() ->> 'role' = 'admin')
```

### **Profiles Table**
```sql
-- Utenti vedono il loro profilo
SELECT * FROM profiles
WHERE id = auth.uid()

-- Parents vedono i profili dei figli
SELECT * FROM profiles
WHERE managed_by = auth.uid()

-- Admin vede tutto
```

### **Pricing & Commissions**
```sql
-- Customers NEVER see agency_commission_rate
SELECT id, user_id, total_price, menu_selections
FROM bookings
WHERE user_id = auth.uid()
-- agency_commission_rate è filtrato a livello UI in Frontend

-- Agencies vedono le loro commissioni
SELECT id, total_price, agency_commission_rate
FROM bookings
WHERE agency_id = (SELECT agency_id FROM profiles WHERE id = auth.uid())
```

---

## 🛠️ 5. Checklist per il Deployment

### **Variabili d'Ambiente**
- [ ] `.env.local` (Front): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_APP_URL`, `VITE_GEMINI_API_KEY`, `VITE_GOOGLE_MAPS_API_KEY`
- [ ] `.env` (Admin): Stessi valori di Front + `SUPABASE_SERVICE_ROLE_KEY` (per edge functions)

### **RLS Policies**
- [ ] ✅ `bookings` - filtra per `user_id`
- [ ] ✅ `bookings` - filtra per `agency_id` (se agenzia)
- [ ] ✅ `profiles` - filtra per `id` (utente)
- [ ] ✅ `profiles` - mostra profili figli solo al genitore
- [ ] ✅ Nessun ruolo vede `agency_commission_rate` eccetto Admin e Agenzia

### **Frontend Safeguards**
- [ ] ✅ Staff login in Front → Redirect a Admin App
- [ ] ✅ Staff in Front → Staff Top-Bar visibile
- [ ] ✅ Staff in Front → Checkout bloccato con banner
- [ ] ✅ Agency Client → Prezzo standard visibile, commissioni nascoste
- [ ] ✅ Invited User → Menu UI di cancellazione disabilitato

---

## 📚 Documenti Correlati

- **[ROLE_ROUTING_STRATEGY.md](./ROLE_ROUTING_STRATEGY.md)** - Dettagli del routing tra app
- **[ADMIN_PAGES_CLEANUP.md](./ADMIN_PAGES_CLEANUP.md)** - Analisi della rimozione delle pagine duplicate
- **[Booking System Rules.md](./Booking%20System%20Rules.md)** - Regole di business per i booking

---

**Ultimo Aggiornamento**: Mar 12, 2026
**Status**: Production Ready ✅
