-- ─────────────────────────────────────────────────────────────────────────────
-- Riconsegna: i due vincoli che toccano SOLO le colonne nuove.
--
-- Questa migration doveva essere cinque vincoli. Ne applica due, e le tre righe
-- che seguono spiegano perche' - sono una correzione a una mia premessa sbagliata.
--
-- ── LA PREMESSA CHE AVEVO SCRITTO, ED ERA VERA SOLO A META' ──────────────────
-- Avevo motivato "i vincoli si possono mettere adesso" con: nessun codice
-- deployato scrive `dropoff_mode` ne' `dropoff_meeting_point`. **Vero.** Ma tre
-- dei cinque vincoli non parlavano solo delle colonne nuove: **accoppiavano il
-- mode a `dropoff_hotel`**, che e' scritta da codice vivo. E la conversione ha
-- gia' messo un mode su tutte e 61 le righe. Quindi il raggio d'azione non era la
-- colonna nuova: era quella vecchia.
--
-- Il salvataggio del planner (`useManagerLogistic.ts:340-374`) manda un payload
-- pieno che include `dropoff_hotel` e **non include `dropoff_mode`**. Verificato.
-- Tre gesti che oggi funzionano sarebbero stati rifiutati dal database:
--   · riga convertita a 'hotel', il manager preme walk-off -> `dropoff_hotel` va a
--     null col mode ancora 'hotel';
--   · riga convertita a 'same', il manager preme "luogo diverso" e digita un
--     hotel -> destinazione vera col mode ancora 'same';
--   · riga 'same', il manager sposta il ritiro su walk-in.
-- In tutti e tre il manager preme un pulsante che funziona e riceve un errore su
-- un dato che non ha mai visto e non puo' correggere.
--
-- La regola del progetto non dice "non vincolare le colonne nuove": dice **non
-- vincolare in un modo che leghi scrittori vivi**. Avevo letto la regola guardando
-- la colonna invece del vincolo.
--
-- ── E IL TRIGGER SAREBBE STATO CIECO PROPRIO DOVE SERVIVA ────────────────────
-- Il divieto di `same` con ritiro walk-in doveva riconoscere il walk-in unendo
-- `meeting_points` su `bookings.meeting_point`. Ma il planner, scegliendo la
-- posizione walk-in, scrive `meeting_point: ''` (-> null al salvataggio) e segna
-- il walk-in **nella zona**. Misurato: 8 walk-in hanno un punto, **4 non ce
-- l'hanno** e sono walk-in solo per `pickup_zone` - e tutte e 4 portano
-- `dropoff_mode = 'same'`, cioe' esattamente lo stato da vietare, messo li' dalla
-- mia stessa conversione, che pure lei guarda solo il punto.
-- Il trigger avrebbe quindi vietato il caso raro e lasciato passare quello comune.
-- E "allora guardo anche la zona" non e' la risposta: farebbe tornare il criterio
-- del ritiro ad avere due sorgenti, che e' il difetto chiuso il 09/09.
-- Il nodo vero e' che **il planner puo' creare un walk-in senza punto**: va
-- risolto li', non in un vincolo che ne insegue le conseguenze.
--
-- ── COSA ENTRA ADESSO ────────────────────────────────────────────────────────
-- I due vincoli che toccano SOLO `dropoff_mode` e `dropoff_meeting_point`, che
-- nessuno scrive. Raggio d'azione zero sul vivo, e danno gia' il fallimento forte
-- dove serve di piu': sul punto di riconsegna, che e' la parte nuova.
-- Gli altri tre e il trigger vanno **nella stessa release** in cui admin e front
-- cominciano a scrivere il mode accanto alla destinazione. Non "dopo, un giorno".
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.bookings
  add constraint bookings_dropoff_mode_chk
    check (dropoff_mode is null or dropoff_mode in ('same','to_define','none','point','hotel')),

  -- 'point' e il punto vanno insieme, nei due versi: senza punto quel nome non dice
  -- dove, e un punto sotto un altro nome e' un dato che nessuno leggera'.
  -- Sicuro perche' entrambe le colonne sono nuove e nessuno le scrive: oggi le
  -- righe con l'una o l'altra sono zero.
  add constraint bookings_dropoff_point_coerente_chk
    check (
      dropoff_mode is null
      or (dropoff_mode = 'point') = (dropoff_meeting_point is not null)
    );

comment on constraint bookings_dropoff_point_coerente_chk on public.bookings is
  'Se e solo se. Gli altri tre vincoli della riconsegna (hotel richiede destinazione; same/none/to_define non ne ammettono; same vietato col ritiro walk-in) NON sono qui: accoppiano il mode a dropoff_hotel, che il planner scrive senza toccare il mode, e romperebbero salvataggi vivi. Vanno nella stessa release degli scrittori.';
