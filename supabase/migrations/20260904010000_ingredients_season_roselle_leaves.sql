-- 20260904010000_ingredients_season_roselle_leaves.sql
-- APPLICATA IN PRODUZIONE il 2026-09-04. Completa il popolamento #189: 191 righe erano
-- entrate con 20260903240000, questa e' la 192esima e ultima.
--
-- `roselle-leaves` era rimasta fuori perche' nessuna fonte dava una finestra per la
-- FOGLIA. La risposta e' arrivata da ricerca (non da sopralluogo al banco), ed e'
-- `year_round`, non `seasonal`: le foglie ci sono tutto l'anno grazie alle coltivazioni
-- irrigate, e da maggio a ottobre con le piogge sono solo piu' abbondanti e piu'
-- economiche. Il picco e' abbondanza, non disponibilita': marcarla `seasonal`
-- spegnerebbe il badge da novembre ad aprile su un ingrediente che in quei mesi si
-- compra lo stesso. Stessa logica dei broccoli d'altura, che il freddo migliora ma non
-- fa esistere.
--
-- La parte della nota che conta davvero e' la distinzione foglia/calice: e' l'errore che
-- ha tenuto bloccata questa riga, e senza quella frase si ripresenta al primo che rilegge
-- una fonte sull'ibisco (i calici rossi sono strettamente stagionali, ottobre-dicembre, e
-- servono per l'infuso; questa riga vende la foglia).
--
-- `season_verified_at` resta NULL: nessuno l'ha ancora vista al banco. La colonna si
-- valorizza solo con una verifica al mercato, non con una ricerca da scrivania - per
-- questo `season_source` e' 'desk_research_2026-09', il valore gia' usato dalle altre 84
-- righe, e non una stringa nuova.

begin;

update public.ingredients_library
   set season_status      = 'year_round',
       season_months      = null,
       season_verified_at = null,
       season_source      = 'desk_research_2026-09',
       season_note        = 'Leaves and tender shoots are around all year thanks to irrigated plots, and they get cheaper and more plentiful from May to October with the rains. Not to be confused with the red calyces, which are strictly seasonal from October to December and are the part used for the infusion: this entry is the leaf.'
 where slug = 'roselle-leaves';

do $g$
declare n_null integer; st text;
begin
  select season_status into st from public.ingredients_library where slug='roselle-leaves';
  if st is distinct from 'year_round' then raise exception 'roselle-leaves: status inatteso %', st; end if;
  select count(*) into n_null from public.ingredients_library where season_status is null;
  if n_null <> 12 then raise exception 'attese 12 righe senza status (le non pubblicate), trovate %', n_null; end if;
  raise notice '#189 completa: 192 righe pubblicate con season_status, 12 non pubblicate senza';
end $g$;

commit;
