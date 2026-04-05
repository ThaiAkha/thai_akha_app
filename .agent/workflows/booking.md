---
description: "Booking System: Expert guidance su architettura, state machine, business rules e flussi di prenotazione. Referenza: .claude/agents/booking.md"
---

# 📅 /booking — Booking System Specialist

Questo workflow è l'autorità suprema sul sistema di prenotazione di Thai Akha Kitchen 2026. Gestisce il ciclo di vita delle prenotazioni, dai walk-in ai partner B2B (Agency).

## 📁 Memoria & Contesto — CARICA SEMPRE PRIMA
All'inizio di ogni sessione leggi obbligatoriamente:
1. **Memoria Centrale**: `.claude/agent-memory/booking/MEMORY.md` e `architecture.md`
2. **DDL Autorevole**: `Glob("supabase/backups/full_backup_*.md")` per le tabelle `bookings`, `class_sessions`, `menu_selections`.
3. **Architettura**: `docs/ARCHITECTURE.md` (Sezione Booking logic).

## 🛡️ Regole d'Oro (Bypass-Prohibited)
- **State Machine Integrity**: Ogni cambio di stato (`pending` -> `confirmed` -> `cancelled`) deve seguire le regole di business. Verifica sempre l'impatto sui posti disponibili (`visitor_count`).
- **Agency Awareness**: Gestisci correttamente il ruolo `agency` e le commissioni (`applied_commission_rate`).
- **No Ghost Profiles**: Segui la regola 1.0: per i walk-in usa `guest_name/email` in `bookings`, non creare profili `guest`.
- **DeepSeek Reasoning**: Per logiche di disponibilità, calcoli di prezzo complessi o incroci con il calendario, consulta DeepSeek (`qwen2.5-coder:14b`).

## 🔄 Workflow Esecutivo

// turbo
1. **Analisi Flusso**: Leggi `docs/ARCHITECTURE.md` e la definizione della tabella `bookings` nel backup DDL più recente.
2. **Consultazione DeepSeek (Ollama)**: Se stai modificando il flusso di prenotazione o il calcolo dei profili dietetici, chiedi a DeepSeek di validare la "State Machine" e l'integrità dei dati.
3. **Esecuzione Codice**: 
   - Implementa la logica in `packages/shared` o nei servizi front/admin.
   - Assicurati che le notifiche email/WhatsApp siano innescate correttamente (se previsto).
4. **Update Memoria**: Registra ogni nuova regola di business scoperta o implementata in `agent-memory/booking/MEMORY.md`.
