-- POS split unificato: una selezione può contenere partecipanti registrati (user_ids) + posti
-- anonimi. Crea un figlio con pax = p_pax (totale selezionati), sposta i registrati selezionati,
-- decrementa il madre. Generalizza split_booking_participants / split_booking_pax_payment.
CREATE OR REPLACE FUNCTION public.split_booking_seats(p_parent uuid, p_user_ids uuid[], p_pax integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare parent_rec record; child_id uuid; moved_named int; new_ref text;
begin
  if not is_staff() then return json_build_object('success', false, 'error', 'forbidden'); end if;
  select * into parent_rec from bookings where internal_id = p_parent for update;
  if parent_rec is null then return json_build_object('success', false, 'error', 'parent not found'); end if;

  if p_pax < 1 or p_pax >= coalesce(parent_rec.pax_count, 0) then
    return json_build_object('success', false, 'error', 'invalid pax'); end if;

  select count(*) into moved_named from booking_participants
    where booking_id = p_parent and user_id = any(coalesce(p_user_ids, '{}'::uuid[]));
  if moved_named > p_pax then
    return json_build_object('success', false, 'error', 'named exceeds pax'); end if;

  new_ref := coalesce(parent_rec.booking_ref, 'TAK') || '-B';
  insert into bookings (
    user_id, session_id, booking_date, status, pax_count, hotel_name,
    payment_method, payment_status, booking_ref, parent_booking_id, is_split_child, kitchen_id, agency_note
  ) values (
    parent_rec.user_id, parent_rec.session_id, parent_rec.booking_date, parent_rec.status,
    p_pax, parent_rec.hotel_name,
    parent_rec.payment_method, 'pending', new_ref, parent_rec.internal_id, true, parent_rec.kitchen_id,
    'Payment split from ' || coalesce(parent_rec.booking_ref, '')
  ) returning internal_id into child_id;

  if moved_named > 0 then
    update booking_participants set booking_id = child_id
      where booking_id = p_parent and user_id = any(p_user_ids);
  end if;
  update bookings set pax_count = pax_count - p_pax, updated_at = now() where internal_id = p_parent;
  return json_build_object('success', true, 'child_booking_id', child_id, 'moved', p_pax, 'moved_named', moved_named);
end; $function$;
