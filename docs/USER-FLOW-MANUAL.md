# Thai Akha Kitchen — Manuale Flusso Utenti
> Versione 1.0 · Giugno 2026 · Documento interno

---

## Indice

1. [Panoramica Ruoli](#1-panoramica-ruoli)
2. [Flusso di Accesso — Login e Registrazione](#2-flusso-di-accesso--login-e-registrazione)
3. [Cosa vede ogni ruolo nella Front App](#3-cosa-vede-ogni-ruolo-nella-front-app)
4. [Tabella permessi per ruolo](#4-tabella-permessi-per-ruolo)
5. [Dashboard per ruolo — descrizione dettagliata](#5-dashboard-per-ruolo--descrizione-dettagliata)
6. [Redirect e navigazione](#6-redirect-e-navigazione)
7. [Gap attuali e proposte di miglioramento](#7-gap-attuali-e-proposte-di-miglioramento)

---

## 1. Panoramica Ruoli

Il sistema Thai Akha Kitchen prevede i seguenti ruoli utente, assegnati automaticamente al momento della registrazione o configurati manualmente da un amministratore.

| Ruolo | Chi è | Dove lavora principalmente |
|---|---|---|
| **guest_virtual** | Visitatore senza account — naviga il sito ma non ha prenotazioni | Solo Front App (senza login) |
| **guest** | Turista registrato — ha un account, può prenotare classi | Front App |
| **kitchen** | Staff di cucina | Front App (vista limitata) + Admin App |
| **driver** | Autista | Front App (vista limitata) + Admin App |
| **manager** | Responsabile operativo | Front App (vista limitata) + Admin App |
| **agency** | Agenzia di viaggi partner | Front App (vista limitata) + Admin App |
| **admin** | Amministratore sistema | Front App (vista limitata) + Admin App |

> **Regola generale:** i ruoli `manager`, `agency` e `admin` sono considerati "ruoli privilegiati". Nella Front App hanno accesso ridotto. Per le operazioni avanzate (gestire prenotazioni, assegnare tavoli, gestire trasporti) devono usare la **Admin App** su `admin.thaiakha.com`.

---

## 2. Flusso di Accesso — Login e Registrazione

### 2.1 Visitatore senza account (guest_virtual)

Il visitatore arriva sul sito senza fare login. Può:
- Navigare tutte le pagine pubbliche (home, classi, ricette, storia Akha, news, quiz pubblico)
- Impostare preferenze alimentari e piccantezza localmente (salvate sul dispositivo, non sul server)
- Vedere i prezzi e le informazioni sulle classi

Non può:
- Prenotare una classe (viene invitato a registrarsi)
- Accedere alla dashboard personale

---

### 2.2 Registrazione (nuovo utente turista)

Percorso: **Pagina Auth → Modulo Signup**

Il processo avviene in due passaggi:

**Passaggio 1 — Credenziali:**
- Nome completo
- Email
- Password

**Passaggio 2 — Profilo personale (opzionale):**
- Età
- Genere
- Nazionalità

Al termine, l'account viene creato con ruolo **guest** e profilo alimentare predefinito "diet_regular". L'utente viene immediatamente reindirizzato alla sua **dashboard personale** (`/user`).

---

### 2.3 Login (utente esistente)

Percorso: **Pagina Auth → Modulo Login**

Inserisce email e password. Al successo:
- Il sistema carica il suo profilo e il suo ruolo
- Viene reindirizzato a `/user` (dashboard personale)
- Se è un ruolo privilegiato (agency, admin, manager), l'esperienza della dashboard cambia (vedi sezione 5)

Esiste anche una funzionalità **"Forgot Password"** che invia un link di reset all'email.

---

### 2.4 Session Hand-off dall'Admin App

Gli utenti con ruolo privilegiato che lavorano nell'Admin App possono aprire la Front App in modo trasparente senza dover fare login di nuovo. La sessione viene passata automaticamente tramite URL e il profilo viene riconosciuto. Dopo l'handoff, i token vengono rimossi dall'URL per sicurezza.

---

## 3. Cosa vede ogni ruolo nella Front App

### Tab della dashboard personale (`/user`)

| Tab | guest | kitchen / driver | manager | agency | admin |
|---|---|---|---|---|---|
| **Overview** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Reservation** (le mie prenotazioni) | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Menu** (seleziona i miei piatti) | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Quiz** (cultura Akha) | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Passport** (impostazioni profilo) | ✅ | ✅ | ✅ | ✅ | ✅ |

> I ruoli privilegiati vedono solo 3 tab: **Overview, Quiz, Passport.**
> Le prenotazioni e la gestione menu sono esclusive dei turisti registrati (ruolo guest).

---

## 4. Tabella permessi per ruolo

### Front App (thaiakha.com)

| Funzione | guest_virtual | guest | kitchen / driver | manager | agency | admin |
|---|---|---|---|---|---|---|
| Naviga pagine pubbliche | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Accede alla dashboard | ❌ | ✅ | ✅ (ridotta) | ✅ (ridotta) | ✅ (ridotta) | ✅ (ridotta) |
| Prenota una classe | ❌ | ✅ | ❌ → Admin App | ❌ → Admin App | ❌ → Admin App | ❌ → Admin App |
| Gestisce la sua prenotazione | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Seleziona il suo menu | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Scarica certificato | ❌ | ✅ (post-classe) | ❌ | ❌ | ❌ | ❌ |
| Partecipa al Quiz | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Modifica profilo personale | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Imposta preferenze alimentari | locale | ✅ | ✅ | ✅ | ✅ | ✅ |

### Admin App (admin.thaiakha.com)

| Funzione | guest | kitchen | driver | manager | agency | admin |
|---|---|---|---|---|---|---|
| Accede all'Admin App | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gestisce prenotazioni clienti | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Gestisce il trasporto / rotte | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Gestisce il menu clienti | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Crea nuove prenotazioni | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Gestisce utenti e profili | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Accede alle statistiche | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |

> **Nota Agency:** il ruolo agency può creare prenotazioni per i propri clienti direttamente dall'Admin App. Nella Front App vede solo una dashboard ridotta.

---

## 5. Dashboard per ruolo — descrizione dettagliata

### 5.1 Guest (turista registrato) — Esperienza completa

Questo è il percorso standard per chi prenota una classe di cucina.

**Tab Overview — "Start Your Journey"**
Se non ha ancora una prenotazione, vede un invito a prenotare la prima classe.
Se ha già prenotato, vede una card riassuntiva con data e stato della sua prenotazione più recente.

**Tab Reservation — "Mission Control"**
È il cuore della dashboard. Contiene:
- Il selettore prenotazione (se ha più prenotazioni, appaiono come chip orizzontali selezionabili)
- Il badge di stato: CONFIRMED / ACTION REQUIRED / COMPLETED
- La timeline logistica in tempo reale: stato del driver, fermate del percorso, orario di pickup
- Il pannello pickup: dove viene raccolto, possibilità di modificare la location
- Le 4 azioni rapide: Menu, Pickup, Certificato, Modifica prenotazione

**Tab Menu**
Permette di selezionare i 3 piatti della classe (curry, zuppa, saltato in padella).
Se il menu non è ancora selezionato, un badge `!` appare sul tab come promemoria.

**Tab Quiz**
Moduli di cultura Akha con domande a risposta multipla. Tiene traccia dei punti e della classifica.

**Tab Passport**
Impostazioni del profilo personale: nome, preferenze alimentari, livello di piccantezza, allergie, opzione di download del certificato.

---

### 5.2 Kitchen (staff di cucina) — Vista ridotta

**Cosa vede:**
- Overview con messaggio di benvenuto personalizzato ("Staff Dashboard") e accesso diretto al quiz
- Quiz culturale Akha
- Passport (impostazioni profilo personale)

**Cosa NON vede:**
- Nessun tab Reservation
- Nessun tab Menu
- Nessun certificato
- Nessun accesso alle prenotazioni dei clienti (quello avviene in Admin App)

**Banner informativo proposto:** nella dashboard dovrebbe apparire un avviso che spiega che per gestire menu e cucina è necessario accedere all'Admin App.

---

### 5.3 Driver (autista) — Vista ridotta

Identica alla vista Kitchen per quanto riguarda la Front App.
Le funzionalità operative (gestione rotte, aggiornamento stato trasporto) avvengono esclusivamente in Admin App.

**Banner informativo proposto:** avviso che le rotte e gli aggiornamenti di trasporto si gestiscono in Admin App.

---

### 5.4 Manager — Vista ridotta + accesso Admin App

**Nella Front App:**
- Overview con messaggio di benvenuto Staff
- Quiz culturale Akha
- Passport (profilo personale)
- Se tenta di cliccare "Prenota una classe", viene aperta automaticamente l'Admin App in una nuova scheda

**Nell'Admin App:**
- Accesso completo a prenotazioni, menu clienti, rotte trasporto, statistiche
- Può creare e modificare prenotazioni per conto dei clienti

**Banner informativo proposto:** avviso che spiega il suo ruolo elevated e che per tutte le operazioni sui clienti deve usare l'Admin App.

---

### 5.5 Agency (agenzia partner) — Vista ridotta + accesso Admin App

**Nella Front App:**
- Overview con messaggio di benvenuto Staff (stesso di kitchen/driver)
- Quiz culturale Akha
- Passport (profilo personale)
- Se tenta di cliccare "Prenota una classe", viene aperta automaticamente l'Admin App in una nuova scheda

**Nell'Admin App:**
- Può creare prenotazioni per i propri clienti
- Accede alle statistiche rilevanti per la propria agenzia
- Non gestisce cucina o trasporti

**Banner informativo proposto:** avviso che spiega che l'agency non ha prenotazioni personali nella Front App — le prenotazioni dei clienti si creano dall'Admin App. Con link diretto.

---

### 5.6 Admin — Vista ridotta + accesso completo Admin App

**Nella Front App:**
- Identica alla vista Manager/Agency (3 tab: Overview, Quiz, Passport)
- Se tenta di accedere al flusso di booking, viene reindirizzato all'Admin App in nuova scheda

**Nell'Admin App:**
- Accesso completo a tutto il sistema
- Unico ruolo che può gestire altri utenti e configurare il sistema

**Gap noto:** un admin non può vedere la Front App come la vede un utente normale (modalità preview). Se vuole fare test QA dell'esperienza turista, deve usare un account separato con ruolo guest.

---

## 6. Redirect e navigazione

### Redirect post-login

| Ruolo | Dove finisce dopo il login |
|---|---|
| guest | `/user` → tab Overview (se nessuna prenotazione) o Reservation (se ha prenotazioni) |
| kitchen / driver / manager / agency / admin | `/user` → tab Overview (Staff Dashboard) |

> **Gap attuale:** il redirect è sempre verso Overview, indipendentemente dallo stato. Un guest con prenotazione attiva dovrebbe atterrare direttamente sul tab Reservation. Da implementare.

### Tentativo di accesso a "Prenota una Classe" da ruolo privilegiato

Se un utente con ruolo manager, agency o admin clicca su qualsiasi bottone di prenotazione nella Front App:
→ Si apre automaticamente l'Admin App (`admin.thaiakha.com/booking`) in una **nuova scheda del browser**.
→ La pagina corrente nella Front App rimane invariata (non c'è navigazione interna).

### Logout

Al logout:
- La sessione Supabase viene chiusa
- Il client vocale Gemini (Cherry AI) viene invalidato
- Tutto il localStorage viene svuotato (incluse preferenze locali e ID prenotazione in lavorazione)
- L'utente torna alla home come visitatore anonimo

---

## 7. Gap attuali e proposte di miglioramento

### 7.1 Banner ruolo privilegiato (PRIORITÀ ALTA)

**Problema:** quando un manager, agency o admin apre la Front App, non c'è nessuna comunicazione visiva che spieghi perché la loro dashboard è diversa da quella di un turista.

**Proposta:** aggiungere nella tab Overview, per tutti i ruoli privilegiati, un banner/card che dica chiaramente:

> "Sei collegato come [MANAGER / AGENCY / ADMIN]. In questa app puoi esplorare il quiz e gestire il tuo profilo personale. Per prenotare classi, gestire clienti o accedere agli strumenti operativi, usa l'Admin App."

Il banner dovrebbe includere:
- Il nome del ruolo evidenziato (badge colorato)
- Elenco sintetico di cosa si può fare qui
- Bottone diretto "Apri Admin App →"

---

### 7.2 Redirect intelligente post-login (PRIORITÀ MEDIA)

**Problema:** un guest con prenotazione attiva atterri sempre su Overview, anche se il tab più utile è Reservation.

**Proposta:** dopo il login, se l'utente ha almeno una prenotazione attiva (data futura o odierna), reindirizzarlo direttamente al tab Reservation.

---

### 7.3 Certificato — guard logic (PRIORITÀ MEDIA)

**Problema:** il bottone "Download Certificate" è visibile anche per prenotazioni future o senza menu selezionato.

**Proposta:** il certificato dovrebbe essere accessibile solo se:
1. La prenotazione è nel passato (classe già completata)
2. Il menu è stato selezionato (almeno curry, zuppa e saltato)

Prima di completare queste condizioni: mostrare il bottone come disabilitato con un tooltip "Disponibile dopo la tua classe".

---

### 7.4 Download certificato su mobile (PRIORITÀ ALTA)

**Problema:** il download attuale usa la stampa del browser, che su mobile è inaffidabile o inesistente.

**Proposta:** implementare generazione PDF reale (html2canvas + jsPDF) con un bottone "Scarica PDF" che funzioni su iOS, Android e desktop senza aprire il dialogo di stampa.

---

### 7.5 Modalità preview per admin (PRIORITÀ BASSA)

**Problema:** un admin non può testare l'esperienza turista dalla stessa sessione.

**Proposta:** aggiungere nell'Admin App un bottone "Visualizza come guest" che apra la Front App con un profilo di test temporaneo, senza perdere la sessione admin.

---

*Documento generato automaticamente dall'analisi del codebase Thai Akha Kitchen · thaiakha-cherry-2026*
