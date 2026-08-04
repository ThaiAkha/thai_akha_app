-- POS Ops — fatturazione giornaliera (cash/card)
-- 1) Tender per gruppo: bookings.pos_tender (cash|card), NULL = non incassato al banco.
-- 2) RPC get_pos_daily_invoice(day): righe per le 2 fatture giornaliere.
--    Quota classe SOLO se pay_on_arrival (prepaid = già pagata, esclusa); shop sempre.
--    Solo gruppi pagati, con tender, non ancora fatturati (zoho_invoice_id null).

alter table public.bookings add column if not exists pos_tender text;
do $$ begin
  if not exists (select 1 from pg_constraint where conname='bookings_pos_tender_chk') then
    alter table public.bookings add constraint bookings_pos_tender_chk check (pos_tender in ('cash','card'));
  end if;
end $$;
comment on column public.bookings.pos_tender is
  'POS: metodo incasso on-arrival (cash|card). Determina su quale fattura giornaliera finisce il gruppo. NULL = non incassato al banco.';

-- Ritorna SESSIONE + AMOUNT base: le fatture sono 4 = sessione (morning/evening) x tender (cash/card).
-- amount = base imponibile (classe: pax×prezzo · shop: qty×prezzo). Il +3% carta lo applica Zoho.
create or replace function public.get_pos_daily_invoice(p_day date)
returns table(tender text, session text, booking_id uuid, sku text, quantity numeric, amount numeric, line_type text)
language sql stable
set search_path to 'public'
as $$
  -- Quota classe: SOLO se incassata al banco (pay_on_arrival). Prepaid => esclusa.
  select b.pos_tender, b.session_id, b.internal_id,
         case b.session_id when 'morning_class' then 'SE-000-2024'
                           when 'evening_class' then 'SE-003-2024' end,
         b.pax_count::numeric,
         (b.pax_count * coalesce(cs.price_thb,0))::numeric,
         'class'::text
  from bookings b
  join class_sessions cs on cs.id = b.session_id
  where b.booking_date = p_day
    and b.payment_status = 'paid'
    and b.pos_tender in ('cash','card')
    and b.zoho_invoice_id is null
    and b.payment_method = 'pay_on_arrival'
    and b.session_id in ('morning_class','evening_class')
  union all
  -- Prodotti shop pagati (stessa sessione del gruppo)
  select b.pos_tender, b.session_id, b.internal_id, o.sku, o.quantity::numeric,
         (o.quantity * coalesce(o.unit_price_snapshot,0))::numeric, 'shop'::text
  from bookings b
  join shop_orders o on o.booking_id = b.internal_id and o.status = 'paid'
  where b.booking_date = p_day
    and b.payment_status = 'paid'
    and b.pos_tender in ('cash','card')
    and b.zoho_invoice_id is null
    and b.session_id in ('morning_class','evening_class');
$$;

comment on function public.get_pos_daily_invoice(date) is
  'POS: righe per le 4 fatture giornaliere (sessione x tender) con amount base. Classe solo se pay_on_arrival; shop sempre. Esclude i gia fatturati.';
