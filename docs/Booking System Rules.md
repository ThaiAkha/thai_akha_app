# 📐 ARCHITECTURAL MANUAL: Booking Management & Permission Hierarchy (Thai Akha 2026)

> **Objective:** Questo documento funge da **"Single Source of Truth"** per lo sviluppo della logica di backend, routing, permission checks e mutazioni database su Supabase per il modulo Booking.

---

## 📊 Livello 1: User Types (Direct B2C Matrix)

Le tre entità core che interagiscono con la piattaforma public-facing.

### 1. 👑 Main User (Group Leader / Direct Booker)

| Proprietà | Descrizione |
|-----------|-------------|
| **Identità** | Utente che ha creato originalmente la prenotazione |
| **Database Flag** | `booking_participants.is_leader = true` |
| **Permessi** | **CONTROLLO TOTALE** |

**🔓 Azioni Consentite:**
- ✏️ Modifica orari di pick-up
- 🏨 Cambio hotel/dropoff location
- ❌ Cancellazione prenotazione
- 🍽️ Selezione menu personale
- 📝 Completamento quiz
- 📨 **Azioni Speciali:** Generare inviti per:
  - `Invited Users` (compagni di viaggio)
  - `Child Users` (profili minori gestiti)

### 2. 🧳 Invited User (Autonomous Sub-Client)

| Proprietà | Descrizione |
|-----------|-------------|
| **Identità** | Compagno di viaggio che ha ricevuto un invito e creato un account autonomo |
| **Database** | Record distinto in `profiles` |
| **Permessi** | **CONTROLLO LIMITATO** |

**🔒 Azioni Consentite:**
- ✅ Solo gestione del proprio menu (`menu_selections`)
- ✅ Solo gestione del proprio quiz

**🚫 Blocchi Sistemici:**
❌ Cancellare prenotazione
❌ Modificare logistica pick-up
❌ Accedere ai dettagli di pagamento del booker originale

text

### 3. 👶 Child User (Ghost Profile)

| Proprietà | Descrizione |
|-----------|-------------|
| **Identità** | Partecipante (minore) senza email/credenziali |
| **Gestione** | Completamente gestito sotto l'account Main User |
| **Database** | Record `profiles` con campo `managed_by = parent_user_id` |

**🔄 Logica di Sistema:**
> Il sistema commuta **seamlessly** il context all'ID univoco del minore per:
> - Selezione menu
> - Accumulo punti quiz
>
> *Nessun login o flusso di autenticazione separato richiesto.*

---

## 🏢 Livello 2: B2B Rules (Agencies and Their Clients)

Comportamento del sistema quando un'**Agenzia** (`profiles.role = 'agency'`) prenota per conto di un cliente.

### 🏛️ The Agency (B2B Booker)

| Proprietà | Descrizione |
|-----------|-------------|
| **Permessi** | **Controllo amministrativo totale** sulla prenotazione |
| **Azioni** | Modifica, cancella, gestisce routing logistico, genera link di condivisione |
| **Database** | Utilizzo di `bookings.applied_commission_rate` e `bookings.commission_amount` |

### 🧑‍🤝‍🧑 The Agency Client (Restricted Main User)

*Quando l'agenzia genera un link e lo invia al turista:*

**🚫 RESTRIZIONI TOTALI SU:**
⛔ Modifica pickup
⛔ Cambio hotel
⛔ Cancellazione booking
⛔ Gestione pagamenti

text

**✅ PERMESSI CONSENTITI:**
✔️ Inserimento allergie
✔️ Selezione Menu
✔️ Completamento Quiz
✔️ Invito compagni (Invited/Child Users)

text

### ⚠️ CRITICAL PRICE RULE

> 🔴 **REGOLA FONDAMENTALE:**
> Quando vengono interrogati/esposti dati finanziari per l'**Agency Client**, il sistema deve processare e mostrare **SOLO** il prezzo pieno standard (`total_price`).
>
> **È STRETTAMENTE VIETATO** esporre:
> - Commissioni agenzia
> - Sconti B2B

---

## 👨‍💼 Livello 3: Admin "Booking Manager" (Internal Staff)

Quando lo staff interno usa la dashboard per creare manualmente prenotazioni, la logica deve seguire UNO di questi 3 flussi backend specifici.

### 🔷 Flow A: New Guest (Full Client Delegation)
┌────────────────┐
│ Admin crea │
│ booking │
└───────┬────────┘
│
▼
┌────────────────┐
│ Utente │◄────┐
│ registrato? │ │
└───────┬────────┘ │
│ No │
▼ │
┌────────────────┐ │
│ Sistema invia │ │
│ email invito │ │
│ a registrarsi │ │
└───────┬────────┘ │
│ │
▼ │
┌────────────────┐ │
│ Utente si │─────┘
│ autentica │
└───────┬────────┘
│
▼
┌────────────────┐
│ Utente eredita │
│ CONTROLLO │
│ TOTALE │
└────────────────┘

text

| Step | Azione |
|------|--------|
| **Scenario** | Admin inserisce booking per utente **non registrato** |
| **System Action** | Invio email con invito a loggarsi/registrarsi |
| **Resulting Permissions** | Utente diventa **Main User** con controllo totale (cancellazione, modifica pickup, menu, inviti) |

### 🔶 Flow B: Existing User (Full Delegation)
┌────────────────┐
│ Admin crea │
│ booking │
└───────┬────────┘
│
▼
┌────────────────┐
│ Utente │
│ registrato? │
└───────┬────────┘
│ Sì
▼
┌────────────────┐
│ Sistema assegna│
│ booking a │
│ User ID esist. │
└───────┬────────┘
│
▼
┌────────────────┐
│ Utente ottiene │
│ CONTROLLO │
│ TOTALE │
└────────────────┘

text

| Step | Azione |
|------|--------|
| **Scenario** | Admin crea booking per utente **già registrato** |
| **System Action** | Assegnazione diretta del booking allo User ID esistente |
| **Resulting Permissions** | Utente esistente ottiene controllo totale (stato Main User B2C) |

### 🔴 Flow C: Agency (Agency Delegation)
┌────────────────┐
│ Admin inserisce│
│ booking │
└───────┬────────┘
│
▼
┌────────────────┐
│ Assegnato a │
│ Profile ID │
│ Agenzia in │
│ user_id │
└───────┬────────┘
│
▼
┌────────────────┐
│ Booking │
│ trasferito al │
│ portale Agenzia│
└───────┬────────┘
│
▼
┌─────────────────────────────────────┐
│ Si applicano REGOLE LIVELLO 2 │
└───────┬─────────────────────┬───────┘
│ │
▼ ▼
┌────────────────┐ ┌────────────────┐
│ Agenzia: │ │ Cliente: │
│ CONTROLLO │ │ link ristretto │
│ TOTALE │ │ prezzi pieni │
└────────────────┘ └────────────────┘

text

| Step | Azione |
|------|--------|
| **Scenario** | Admin inserisce booking per conto di un'**agenzia partner** |
| **System Action** | `bookings.user_id` = ID Profilo dell'Agenzia |
| **Resulting Permissions** | Booking trasferito al portale agenzia → Si applicano **Regole Livello 2** |

---

## 📋 Riepilogo Permessi per Tipo Utente

| Azione | Main User | Invited User | Child User | Agency | Agency Client | Admin |
|--------|-----------|--------------|------------|--------|---------------|-------|
| **Modifica Pick-up** | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Cancellazione** | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Selezione Menu** | ✅ | ✅ | ✅ | N/A | ✅ | ✅ |
| **Completamento Quiz** | ✅ | ✅ | ✅ | N/A | ✅ | ✅ |
| **Invita Altri** | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Vedere Commissioni** | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Vedere Prezzo Pieno** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🗄️ Riferimenti Database Supabase

### Tabelle Coinvolte

```sql
-- Tabella profiles
- id (UUID)
- role (enum: 'user', 'agency', 'admin')
- managed_by (UUID, NULL per utenti autonomi, parent_id per Child Users)

-- Tabella bookings
- id (UUID)
- user_id (UUID, riferimento a profiles.id)
- total_price (DECIMAL)
- applied_commission_rate (DECIMAL, NULL per B2C)
- commission_amount (DECIMAL, NULL per B2C)
- status (enum)

-- Tabella booking_participants
- id (UUID)
- booking_id (UUID)
- profile_id (UUID)
- is_leader (BOOLEAN)

-- Tabella menu_selections
- id (UUID)
- participant_id (UUID, riferimento a profiles.id)
- booking_id (UUID)
- menu_options (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

-- Tabella quiz_submissions
- id (UUID)
- participant_id (UUID, riferimento a profiles.id)
- booking_id (UUID)
- quiz_answers (JSONB)
- score (INTEGER)
- completed_at (TIMESTAMP)
Relazioni Chiave
text
profiles.id ──────────┬── bookings.user_id
                       ├── booking_participants.profile_id
                       ├── menu_selections.participant_id
                       └── quiz_submissions.participant_id

bookings.id ───────────┬── booking_participants.booking_id
                        ├── menu_selections.booking_id
                        └── quiz_submissions.booking_id
Campi Critici per Logica Permessi
Tabella	Campo	Scopo
profiles	role	Distinguere tra user/agency/admin
profiles	managed_by	Tracciare Child Users (ghost profile)
booking_participants	is_leader	Identificare Main User del booking
bookings	user_id	Proprietario principale della prenotazione
bookings	applied_commission_rate	Tracciamento commissioni B2B (esposto solo ad agency/admin)
🔄 Riepilogo Flussi di Sistema
text
                    ┌─────────────────┐
                    │   NEW BOOKING   │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │           Chi crea?          │
              └──────────────┬──────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│    CLIENTE    │    │   AGENZIA     │    │    ADMIN      │
│   (B2C/Direct)│    │   (B2B)       │    │   (Staff)     │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  MAIN USER    │    │  AGENCY OWNER │    │  FLOW A/B/C   │
│  (Full Ctrl)  │    │  (Full Ctrl)  │    │  (Vedi sopra) │
└───────────────┘    └───────┬───────┘    └───────────────┘
        │                    │
        │                    ▼
        │            ┌───────────────┐
        └───────────▶│ AGENCY CLIENT │
                     │ (Restricted)  │
                     └───────────────┘
✅ Checklist Implementazione Backend
Middleware/Permission Checks:

Funzione isMainUser(bookingId, userId) verifica booking_participants.is_leader

Funzione isInvitedUser(bookingId, userId) verifica partecipazione senza flag leader

Funzione isChildUser(profileId) verifica campo managed_by NON null

Funzione isAgency(profileId) verifica role = 'agency'

Funzione isAdmin(profileId) verifica role = 'admin'

Endpoint Protection:

PUT /api/bookings/:id/pickup → Accessibile solo a Main User, Agency, Admin

DELETE /api/bookings/:id → Accessibile solo a Main User, Agency, Admin

GET /api/bookings/:id/financials → Filtrare campi commissione se utente è Agency Client

POST /api/bookings/:id/invite → Accessibile a Main User, Agency Client, Agency, Admin

Flussi Admin:

Implementare branching logico per Flow A (New Guest)

Implementare branching logico per Flow B (Existing User)

Implementare branching logico per Flow C (Agency)

Gestione Commissioni:

Campo applied_commission_rate popolato SOLO per booking B2B

Campo commission_amount calcolato e salvato SOLO per booking B2B

Query builder che esclude questi campi per utenti con role = 'user'

## 🧪 Sandbox Mode: For Staff & Agency Users (Front App)

*Updated: March 2026*

When internal staff or agency users access the **Front App** (the public-facing website), the system automatically activates **Sandbox Mode**. This special mode lets you explore and test features while preventing accidental real bookings.

### 🎯 Global Rule

> **Any authenticated user with `role` NOT equal to 'guest' or 'alumni'** (e.g., `admin`, `agency`, `driver`, `manager`, `kitchen`) enters the Front App in **Sandbox Mode** (Test/Personal mode).

---

### ✅ What You CAN Do (Gamification & Profile)
┌─────────────────────────────────────────────────────────┐
│ 🎮 SANDBOX MODE – EXPLORE FREELY! │
├─────────────────────────────────────────────────────────┤
│ │
│ YOUR SANDBOX ACTIVITIES: │
│ │
│ ✓ Browse all pages and menus │
│ ✓ Update your dietary profile │
│ ✓ Set your allergies │
│ ✓ Take quizzes and earn points │
│ ✓ Explore menu options │
│ ✓ Simulate the booking flow │
│ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 🏆 YOUR PROGRESS │ │
│ │ • Quiz Score: 450 points │ │
│ │ • Badges Earned: 3 │ │
│ │ • Menu Explorer: 12/20 dishes discovered │ │
│ └─────────────────────────────────────────────────┘ │
│ │
└─────────────────────────────────────────────────────────┘

text

**Permitted Actions:**
- 🌐 Navigate the Front App freely
- 👤 Update your `dietary_profile` and `allergies` in the `profiles` table
- 📝 Participate in `quiz_modules` and accumulate points/rewards tied to your personal ID
- 🍽️ Explore menu options and gamification features **100% unlocked**

---

### 🚫 What's BLOCKED: Booking Funnel

You can click "Book Now" and simulate the entire booking flow, but the final step is **disabled**.
┌─────────────────────────────────────────────────────────┐
│ 🔴 BOOKING PREVIEW MODE │
├─────────────────────────────────────────────────────────┤
│ │
│ STEP 1: Select Date ✅ Available │
│ STEP 2: Choose Pax ✅ Available │
│ STEP 3: Add Extras ✅ Available │
│ │
│ ⚠️━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⚠️ │
│ │ │
│ │ YOU ARE IN SANDBOX MODE │
│ │ You're logged in as: [ADMIN/AGENCY/STAFF] │
│ │ │
│ │ To make REAL bookings for clients: │
│ │ → Use the Booking Manager in your Admin Dashboard │
│ │ │
│ │ [🚀 GO TO ADMIN DASHBOARD] │
│ │ │
│ ⚠️━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⚠️ │
│ │
│ [GRAYED OUT ─ CONFIRM BOOKING ─ GRAYED OUT] │
│ │
└─────────────────────────────────────────────────────────┘

text

**System Behavior:**
- ✅ Can click "Book Now" and simulate all steps
- ✅ Can explore calendar availability
- ✅ Can select number of participants
- ❌ **Final checkout form is DISABLED or HIDDEN**
- ⚠️ **Warning Banner** appears with clear message:
  > *"You're logged in as [ROLE]. To make real bookings for clients, use the Booking Manager in your Admin Dashboard."*
- 🔘 Includes button redirecting to Admin App

---

### 🚫 What's BLOCKED: My Passport / User Dashboard

When you visit your profile page ("My Passport" or Dashboard) on the Front App, the system **completely hides** real booking data.
┌─────────────────────────────────────────────────────────┐
│ 🛂 MY PASSPORT – SANDBOX VIEW │
├─────────────────────────────────────────────────────────┤
│ │
│ YOUR PROFILE │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Name: Maria Chen │ │
│ │ Role: Agency Partner │ │
│ │ Member since: 2024 │ │
│ │ Quiz Points: 450 │ │
│ └─────────────────────────────────────────────────┘ │
│ │
│ QUIZ PROGRESS │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ▰▰▰▰▰▰▰▰▰▰▱▱▱▱ 65% – Northern Thai Cuisine │ │
│ │ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰ 100% – Ingredients 101 │ │
│ │ ▰▰▰▰▰▰▱▱▱▱▱▱▱▱ 40% – Cooking Techniques │ │
│ └─────────────────────────────────────────────────┘ │
│ │
│ ═══════════════════════════════════════════════════ │
│ │
│ 📋 YOUR BOOKINGS │
│ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ℹ️ INFORMATION CARD │ │
│ │ │ │
│ │ Your operational bookings are NOT managed here. │ │
│ │ │ │
│ │ To view and manage your clients' bookings: │ │
│ │ • Assign menus │ │
│ │ • Manage pickup logistics │ │
│ │ • Process cancellations │ │
│ │ │ │
│ │ [🔐 GO TO ADMIN APP] │ │
│ │ │ │
│ └─────────────────────────────────────────────────┘ │
│ │
└─────────────────────────────────────────────────────────┘

text

**System Behavior:**
- ❌ No fetch from `bookings` table for standard tourist tabs
- ❌ "My Bookings" tab is **not rendered**
- ❌ "Modify Pickup" options are **hidden**
- ❌ "Choose Menu for Booking" is **disabled**
- ✅ Instead, a **static Information Card** appears with:
  > *"Your operational bookings are not managed here. To view and manage your clients' bookings (menu assignment, pickup logistics, cancellations), access the Admin App."*
- 🔘 Includes direct link to Admin App

---

## 📊 Sandbox Mode Summary Table

| Feature | Available in Sandbox? | Notes |
|---------|----------------------|-------|
| Browse Front App | ✅ YES | Full navigation |
| Update dietary profile | ✅ YES | Edits `profiles` table |
| Take quizzes | ✅ YES | Earn personal points |
| Explore menu | ✅ YES | 100% unlocked |
| Simulate booking flow | ✅ YES | All steps except final |
| Complete checkout | ❌ NO | Form disabled |
| View real bookings | ❌ NO | Replaced by info card |
| Modify pickup | ❌ NO | Hidden completely |
| Cancel bookings | ❌ NO | Hidden completely |
| Assign menu to booking | ❌ NO | Hidden completely |

---

## 🔄 Visual Flow: How Sandbox Mode Works
┌─────────────────┐
│ USER LOGIN │
└────────┬────────┘
│
▼
┌─────────────────┐
│ CHECK ROLE │
└────────┬────────┘
│
┌────────────────────┴────────────────────┐
│ │
▼ ▼
┌─────────────────┐ ┌─────────────────┐
│ role = guest │ │ role = agency │
│ role = alumni │ │ role = admin │
└────────┬────────┘ │ role = manager │
│ │ role = driver │
▼ │ role = kitchen │
┌─────────────────┐ └────────┬────────┘
│ NORMAL MODE │ │
│ • Full access │ ▼
│ • Can book │ ┌─────────────────┐
│ • Can manage │ │ SANDBOX MODE │
└─────────────────┘ │ • Explore │
│ • Quiz/Profile │
│ • ❌ No real │
│ bookings │
└─────────────────┘

text

---

## ⚙️ Technical Implementation Notes

For developers implementing this feature:

```javascript
// Permission check example
function isSandboxUser(user) {
  const sandboxRoles = ['admin', 'agency', 'manager', 'driver', 'kitchen'];
  return sandboxRoles.includes(user.role);
}

// Front App routing logic
if (isSandboxUser(currentUser)) {
  // Enable gamification features
  enableQuizAndProfile();
  
  // Disable booking engine at checkout step
  disableCheckoutSubmission();
  showSandboxWarning();
  
  // Replace bookings dashboard with static card
  renderStaticInfoCard();
} else {
  // Normal user flow
  enableFullBooking();
  showRealBookings();
}
❓ Sandbox Mode FAQ
<details> <summary><b>Why can't I complete a booking in the Front App?</b></summary>
As a staff or agency user, the Front App is designed for end customers only. Your role requires you to use the Admin Dashboard for creating and managing real bookings, which gives you access to agency features like commission tracking, bulk management, and client delegation.

</details><details> <summary><b>Can I still take quizzes and earn points?</b></summary>
Absolutely! Your personal gamification progress (quiz scores, badges, menu exploration) is separate from your operational role. Feel free to explore and learn – it makes you an even better guide for your clients! 🌟

</details><details> <summary><b>Will my quiz points affect my agency account?</b></summary>
No – your personal quiz points are tied to your individual profile ID and are for your own learning and enjoyment. They don't affect your agency's bookings, commissions, or client data.

</details><details> <summary><b>What if I accidentally book as a guest?</b></summary>
If you log in with a guest account, you'll have normal user permissions. Staff/agency users are clearly identified by their role, and the system will always show the sandbox warning before any booking could be completed.

</details>
🎯 Summary: Sandbox Mode at a Glance
text
╔═══════════════════════════════════════════════════════════╗
║                 SANDBOX MODE QUICK CARD                   ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  WHO: Users with role ≠ guest/alumni                     ║
║  WHERE: Front App (public website)                        ║
║                                                           ║
║  ✅ ALLOWED:                                              ║
║  • Browse & explore                                       ║
║  • Update personal profile                                ║
║  • Take quizzes                                           ║
║  • Simulate booking (all steps except final)              ║
║                                                           ║
║  ❌ BLOCKED:                                               ║
║  • Real booking creation                                  ║
║  • Viewing/managing operational bookings                  ║
║  • Accessing client data in Front App                     ║
║                                                           ║
║  🔐 USE INSTEAD: Admin Dashboard → Booking Manager        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝