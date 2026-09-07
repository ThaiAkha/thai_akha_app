-- 20260907150000 · decisioni owner del 2026-09-07 (chat Cherry), applicata su GO.
-- 1) Walk-in alla cucina: 16:50 la sera (08:50 la mattina) OVUNQUE. La colonna
--    meeting_points.mp_school.evening_pickup_time diceva gia' 16:50; i testi, le
--    traduzioni, il JSON della sessione e la zona walk-in dicevano 17:00 o "15 min prima".
-- 2) La classe serale finisce alle 21:00, riconsegna 21:00-21:30, OVUNQUE: Terms (1.6 -> 1.7),
--    3 FAQ + traduzioni, card della home. class_sessions e il programma dicevano gia' 21:00.
-- 3) La categoria dei curry si chiamava "Hand-Pounded Curry Pastes" come quella delle
--    paste: diventa "Hand-Pounded Thai Curries" (titolo, SEO, breadcrumb, card della hub).
-- Le traduzioni sono toccate SOLO dove il cambio e' numerico e poi dichiarate fresche;
-- title_highlight e la card recipe-05 restano stale per la pipeline di traduzione.
-- Idempotente: ogni UPDATE ha la sua guardia.

-- ── 1. walk-in 16:50 ─────────────────────────────────────────────────────────
update public.meeting_points
   set description = replace(description, '5:00 pm for evening class', '4:50 pm for evening class')
 where id = 'mp_school' and description like '%5:00 pm for evening class%';

update public.meeting_points_translations
   set description = replace(description, '17:00', '16:50')
 where point_id = 'mp_school' and description like '%17:00%';

update public.class_sessions
   set meeting_points = (
     select jsonb_agg(
       case when mp->>'type' = 'walk_in'
            then jsonb_set(jsonb_set(mp, '{time}', '"16:50"'), '{note}', to_jsonb(replace(mp->>'note', 'by 5:00 pm', 'by 4:50 pm')))
            else mp end)
     from jsonb_array_elements(meeting_points) mp)
 where id = 'evening_class' and meeting_points::text like '%"17:00"%';

update public.pickup_zones
   set description = replace(description, '15 mins before class', '10 mins before class')
 where id = 'walk-in' and description like '%15 mins before class%';

update public.pickup_zones_translations
   set description = replace(description, '15', '10')
 where zone_id = 'walk-in' and description like '%15%';

update public.class_sections
   set description = replace(description, 'by 5:00 pm', 'by 4:50 pm')
 where id = '87640ecf-1bc4-4a7f-a98a-f8ba488fdc66' and description like '%by 5:00 pm%';

update public.class_sections_translations
   set description = replace(description, '17:00', '16:50')
 where section_id = '87640ecf-1bc4-4a7f-a98a-f8ba488fdc66' and description like '%17:00%';

-- ── 2. classe serale 21:00, riconsegna 21:00-21:30 ────────────────────────────
update public.legal_documents
   set body = replace(body::text,
        'the Evening Class at 9:30 PM, with drop-off at your hotel within the following half hour - by 3:00 PM and 10:00 PM respectively',
        'the Evening Class at 9:00 PM, with drop-off at your hotel within the following half hour - by 3:00 PM and 9:30 PM respectively')::jsonb,
       legal_version = '1.7',
       date_modified = current_date
 where doc_key = 'front_terms' and body::text like '%the Evening Class at 9:30 PM%';

update public.faq_questions
   set answer = replace(answer, 'the Evening Class finishes at 9:30 PM, with drop-off between 9:30 and 10:00 PM', 'the Evening Class finishes at 9:00 PM, with drop-off between 9:00 and 9:30 PM')
 where faq_key = 'faq.category.sustainable-community-chiang-mai.3' and answer like '%finishes at 9:30 PM%';

update public.faq_questions
   set answer = replace(answer, 'the Evening Class is 5:00 to 9:30 pm', 'the Evening Class is 5:00 to 9:00 pm')
 where faq_key = 'faq.contact.class-times' and answer like '%5:00 to 9:30 pm%';

update public.faq_questions
   set answer = replace(answer, 'The Evening class (5:00 PM to 9:30 PM)', 'The Evening class (5:00 PM to 9:00 PM)')
 where faq_key = 'faq.morning-vs-evening' and answer like '%5:00 PM to 9:30 PM%';

-- traduzioni FAQ: solo numeri; restano nella coda stale gia' aperta (1.027 righe), non si dichiarano fresche
update public.faq_questions_translations
   set answer = replace(replace(answer, '21:30', '21:00'), '22:00', '21:30')
 where question_id = 'd10da6ec-24de-4205-ae3f-789caa5774ba' and answer like '%21:30%';

update public.faq_questions_translations
   set answer = replace(answer, '21:30', '21:00')
 where question_id in ('1472c24e-e437-4485-b2bc-a0648916d617', 'c9873589-dd9a-40de-8ad8-8056da482403') and answer like '%21:30%';

update public.home_cards_front
   set extra_2 = replace(extra_2, '9:30pm', '9:00pm')
 where card_id = 'class-02' and extra_2 like '%9:30pm%';

update public.home_cards_front_translations
   set extra_2 = replace(replace(extra_2, '21:30', '21:00'), '9:30', '9:00')
 where card_id = (select id from public.home_cards_front where card_id = 'class-02')
   and (extra_2 like '%21:30%' or extra_2 like '%9:30%');

-- ── 3. categoria curry ────────────────────────────────────────────────────────
update public.content_categories
   set title_highlight = 'Thai Curries',
       seo_title = replace(seo_title, 'Hand-Pounded Curry Pastes', 'Hand-Pounded Thai Curries'),
       og_title = replace(og_title, 'Hand-Pounded Curry Pastes', 'Hand-Pounded Thai Curries'),
       breadcrumbs = replace(breadcrumbs::text, 'Hand-Pounded Curry Pastes', 'Hand-Pounded Thai Curries')::jsonb,
       json_ld = replace(json_ld::text, 'Hand-Pounded Curry Pastes', 'Hand-Pounded Thai Curries')::jsonb
 where id = 'authentic-thai-curry-recipes' and title_highlight = 'Curry Pastes';

update public.page_sections
   set highlight = 'Thai Curries'
 where section_id = 'recipe-05' and highlight = 'Curry Pastes';

-- ── traduzioni toccate solo nei numeri: di nuovo fresche ──────────────────────
select public.translation_mark_fresh('meeting_points_translations', null, array['mp_school']);
select public.translation_mark_fresh('pickup_zones_translations', null, array['walk-in']);
select public.translation_mark_fresh('class_sections_translations', null, array['87640ecf-1bc4-4a7f-a98a-f8ba488fdc66']);
select public.translation_mark_fresh('home_cards_front_translations', null, (select array[id::text] from public.home_cards_front where card_id = 'class-02'));
